"""
ArthMitra — LangGraph Agent Nodes
7-Agent Architecture: Context → Orchestrator → Specialist → Accessibility → Response
"""

import time
import json
import os
import asyncio
import google.generativeai as genai

from app.core.config import settings
print("Gemini configured successfully")
genai.configure(api_key=settings.GEMINI_API_KEY)

from .state import AgentState
from .prompts import (
    ORCHESTRATOR_PROMPT, SCAM_GUARDIAN_PROMPT, LITERACY_AGENT_PROMPT,
    COACH_PROMPT, BENEFITS_PROMPT, CONTEXT_AGENT_PROMPT, ACCESSIBILITY_PROMPT
)
from .tools import (
    extract_url, analyse_domain, check_rbi_registration, check_upi_registry,
    match_schemes, analyse_cashflow, detect_language, estimate_literacy,
    retrieve_regulatory_doc
)

# ─────────────────────────────────────────────
# GEMINI SETUP
# ─────────────────────────────────────────────

genai.configure(api_key=settings.GEMINI_API_KEY)

model_flash = genai.GenerativeModel("gemini-2.5-flash")
model_pro = genai.GenerativeModel("gemini-2.5-flash")
# ─────────────────────────────────────────────
# LLM CALL WRAPPER (REPLACES CLAUDE)
# ─────────────────────────────────────────────

async def _call_gemini(system: str, user_msg: str, use_pro: bool = False) -> str:
    prompt = f"""
SYSTEM:
{system}

USER:
{user_msg}
"""

    selected_model = model_pro if use_pro else model_flash

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: selected_model.generate_content(prompt)
    )

    return response.text


# ─────────────────────────────────────────────
# USER CONTEXT BUILDER
# ─────────────────────────────────────────────

def _build_user_vars(state: AgentState) -> dict:
    uc = state["user_context"]
    return {
        "name": uc.get("name", "User"),
        "language": uc.get("language", "hi"),
        "income_type": uc.get("income_type", "salaried"),
        "literacy_score": uc.get("literacy_score", 30),
        "biggest_worry": uc.get("biggest_worry", "savings"),
        "state": uc.get("state", "Maharashtra"),
        "is_pwd": uc.get("is_pwd", False),
        "preferred_comm": "both",
    }


# ─────────────────────────────────────────────
# NODE 1: LANGUAGE DETECTION
# ─────────────────────────────────────────────

async def detect_language_node(state: AgentState) -> AgentState:
    result = await detect_language.ainvoke(state["user_input"])
    return {
        **state,
        "user_input_language": result["language"],
        "tools_called": state.get("tools_called", []) + ["detect_language"]
    }


# ─────────────────────────────────────────────
# NODE 2: ORCHESTRATOR
# ─────────────────────────────────────────────

async def orchestrator_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)

    system = ORCHESTRATOR_PROMPT.format(**uvars)

    routing_response = await _call_gemini(
        system,
        f"User message: {state['user_input']}\nDetected language: {state.get('user_input_language', 'hi')}"
    )

    try:
        route_data = json.loads(routing_response)
        intent = route_data.get("intent", "general")
        route_to = route_data.get("route_to", "literacy_agent")
    except Exception:
        msg = state["user_input"].lower()

        if any(k in msg for k in ["link", "upi", "fraud", "scam", "fake"]):
            intent, route_to = "scam_check", "scam_guardian"
        elif any(k in msg for k in ["scheme", "yojana", "benefit", "kisan"]):
            intent, route_to = "benefits_query", "benefits_navigator"
        elif any(k in msg for k in ["save", "salary", "budget"]):
            intent, route_to = "savings_nudge", "behavioural_coach"
        else:
            intent, route_to = "general", "literacy_agent"

    return {
        **state,
        "intent": intent,
        "active_agent": route_to,
        "tools_called": state.get("tools_called", []) + ["orchestrator"]
    }


# ─────────────────────────────────────────────
# NODE 3: SCAM GUARDIAN
# ─────────────────────────────────────────────

async def scam_guardian_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    t_start = time.time()

    extracted = await extract_url.ainvoke(state["user_input"])

    scan_results = []

    for url in extracted.get("urls", []):
        domain = await analyse_domain.ainvoke(url)
        rbi = await check_rbi_registration.ainvoke(url)
        scan_results.append({**domain, **rbi, "type": "url"})

    for upi in extracted.get("upi_ids", []):
        upi_result = await check_upi_registry.ainvoke(upi)
        scan_results.append({**upi_result, "type": "upi"})

    system = SCAM_GUARDIAN_PROMPT.format(**uvars)

    user_msg = f"""
User message: {state['user_input']}
Tool results: {json.dumps(scan_results, indent=2)}
"""

    response = await _call_gemini(system, user_msg, use_pro=True)

    top_risk = max((r.get("risk_score", 0) for r in scan_results), default=0)

    return {
        **state,
        "scam_result": {
            "scan_results": scan_results,
            "risk_score": top_risk,
            "verdict": "fraud" if top_risk > 70 else "suspicious" if top_risk > 40 else "safe"
        },
        "final_response": response,
        "confidence": 99.0 - top_risk if top_risk > 0 else 80.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["scam_tools"]
    }


# ─────────────────────────────────────────────
# NODE 4: BENEFITS
# ─────────────────────────────────────────────

async def benefits_navigator_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    uc = state["user_context"]
    t_start = time.time()

    schemes = await match_schemes.ainvoke({
        "income_type": uc.get("income_type"),
        "state": uc.get("state"),
        "monthly_income": uc.get("income_monthly")
    })

    system = BENEFITS_PROMPT.format(**uvars)

    user_msg = f"""
User query: {state['user_input']}
Schemes: {json.dumps(schemes, indent=2)}
"""

    response = await _call_gemini(system, user_msg)

    return {
        **state,
        "benefits_result": schemes[:3],
        "final_response": response,
        "confidence": 88.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["match_schemes"]
    }


# ─────────────────────────────────────────────
# NODE 5: COACH
# ─────────────────────────────────────────────

async def behavioural_coach_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    t_start = time.time()

    msg = state["user_input"].lower()
    amount = 0.0

    import re
    m = re.findall(r'₹?([\d,]+)', state["user_input"])
    if m:
        amount = float(m[0].replace(",", ""))

    cashflow = {}
    if amount > 0:
        cashflow = await analyse_cashflow.ainvoke({
            "user_id": state["user_context"]["user_id"],
            "amount": amount
        })

    system = COACH_PROMPT.format(**uvars)

    user_msg = f"""
Cashflow: {json.dumps(cashflow)}
"""

    response = await _call_gemini(system, user_msg)

    return {
        **state,
        "nudge_result": cashflow,
        "final_response": response,
        "confidence": 82.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["cashflow"]
    }


# ─────────────────────────────────────────────
# NODE 6: LITERACY
# ─────────────────────────────────────────────

async def literacy_agent_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    t_start = time.time()

    docs = await retrieve_regulatory_doc.ainvoke(state["user_input"])

    system = LITERACY_AGENT_PROMPT.format(**uvars)

    user_msg = f"""
Question: {state['user_input']}
Docs: {json.dumps(docs, indent=2)}
"""

    response = await _call_gemini(system, user_msg)

    return {
        **state,
        "final_response": response,
        "retrieved_docs": docs,
        "confidence": 78.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["docs"]
    }


# ─────────────────────────────────────────────
# NODE 7: ACCESSIBILITY
# ─────────────────────────────────────────────

async def accessibility_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)

    if not uvars["is_pwd"]:
        return state

    system = ACCESSIBILITY_PROMPT.format(**uvars)

    user_msg = f"Rewrite: {state.get('final_response','')}"

    response = await _call_gemini(system, user_msg)

    return {
        **state,
        "final_response": response
    }


# ─────────────────────────────────────────────
# ROUTER
# ─────────────────────────────────────────────

def route_to_agent(state: AgentState) -> str:
    return state.get("active_agent", "literacy_agent")