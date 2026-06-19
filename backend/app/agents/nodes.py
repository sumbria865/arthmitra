"""
ArthMitra — LangGraph Agent Nodes
7-Agent Architecture: Context → Orchestrator → Specialist → Accessibility → Response
"""

import time
import json
from anthropic import AsyncAnthropic
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

client = AsyncAnthropic()

HAIKU = "claude-haiku-4-5-20251001"   # 80% of queries — cost control
SONNET = "claude-sonnet-4-6"           # Complex multi-step reasoning


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


async def _call_claude(system: str, user_msg: str, model: str = HAIKU) -> str:
    """Helper: single Claude API call."""
    response = await client.messages.create(
        model=model,
        max_tokens=1000,
        system=system,
        messages=[{"role": "user", "content": user_msg}]
    )
    return response.content[0].text


# ─────────────────────────────────────────────
# NODE 1: LANGUAGE DETECTION
# ─────────────────────────────────────────────
async def detect_language_node(state: AgentState) -> AgentState:
    """Detect language of user input."""
    result = await detect_language.ainvoke(state["user_input"])
    return {
        **state,
        "user_input_language": result["language"],
        "tools_called": state.get("tools_called", []) + ["detect_language"]
    }


# ─────────────────────────────────────────────
# NODE 2: MASTER ORCHESTRATOR (routing)
# ─────────────────────────────────────────────
async def orchestrator_node(state: AgentState) -> AgentState:
    """Classify intent and route to specialist agent."""
    uvars = _build_user_vars(state)
    
    system = ORCHESTRATOR_PROMPT.format(**uvars)
    
    routing_response = await _call_claude(
        system=system,
        user_msg=f"User message: {state['user_input']}\nDetected language: {state.get('user_input_language', 'hi')}",
        model=HAIKU  # Routing is cheap
    )
    
    try:
        route_data = json.loads(routing_response)
        intent = route_data.get("intent", "general")
        route_to = route_data.get("route_to", "literacy_agent")
    except json.JSONDecodeError:
        # Fallback: keyword-based routing
        msg_lower = state["user_input"].lower()
        if any(k in msg_lower for k in ["link", "url", "upi", "scan", "fraud", "scam", "fake"]):
            intent, route_to = "scam_check", "scam_guardian"
        elif any(k in msg_lower for k in ["scheme", "yojana", "government", "benefit", "kisan", "mudra"]):
            intent, route_to = "benefits_query", "benefits_navigator"
        elif any(k in msg_lower for k in ["save", "savings", "budget", "salary", "spend"]):
            intent, route_to = "savings_nudge", "behavioural_coach"
        else:
            intent, route_to = "general", "literacy_agent"
    
    return {**state, "intent": intent, "active_agent": route_to,
            "tools_called": state.get("tools_called", []) + ["orchestrator"]}


# ─────────────────────────────────────────────
# NODE 3: SCAM GUARDIAN
# ─────────────────────────────────────────────
async def scam_guardian_node(state: AgentState) -> AgentState:
    """Full scam detection pipeline."""
    uvars = _build_user_vars(state)
    t_start = time.time()
    
    # Extract URLs/UPIs
    extracted = await extract_url.ainvoke(state["user_input"])
    
    scan_results = []
    
    for url in extracted.get("urls", []):
        domain_result = await analyse_domain.ainvoke(url)
        rbi_result = await check_rbi_registration.ainvoke(url)
        scan_results.append({**domain_result, **rbi_result, "type": "url"})
    
    for upi in extracted.get("upi_ids", []):
        upi_result = await check_upi_registry.ainvoke(upi)
        scan_results.append({**upi_result, "type": "upi"})
    
    # Claude analysis with all tool results
    system = SCAM_GUARDIAN_PROMPT.format(**uvars)
    user_msg = f"""
User message: {state['user_input']}

Tool results:
{json.dumps(scan_results, indent=2)}

Provide verdict in {uvars['language']} (+ English).
"""
    
    response = await _call_claude(system=system, user_msg=user_msg, model=SONNET)
    
    # Aggregate risk score
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
        "tools_called": state.get("tools_called", []) + ["extract_url", "analyse_domain", "check_rbi_registration"]
    }


# ─────────────────────────────────────────────
# NODE 4: BENEFITS NAVIGATOR
# ─────────────────────────────────────────────
async def benefits_navigator_node(state: AgentState) -> AgentState:
    """Match and explain government schemes."""
    uvars = _build_user_vars(state)
    uc = state["user_context"]
    t_start = time.time()
    
    schemes = await match_schemes.ainvoke({
        "income_type": uc.get("income_type", "salaried"),
        "state": uc.get("state", "Maharashtra"),
        "monthly_income": uc.get("income_monthly")
    })
    
    system = BENEFITS_PROMPT.format(**uvars)
    user_msg = f"""
User query: {state['user_input']}

Matched schemes from database:
{json.dumps(schemes, indent=2)}

Explain top 3 schemes in {uvars['language']}. Show eligibility %, benefit amount, and how to apply.
"""
    
    response = await _call_claude(system=system, user_msg=user_msg, model=HAIKU)
    
    return {
        **state,
        "benefits_result": schemes[:3],
        "final_response": response,
        "confidence": 88.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["match_schemes"]
    }


# ─────────────────────────────────────────────
# NODE 5: BEHAVIOURAL COACH
# ─────────────────────────────────────────────
async def behavioural_coach_node(state: AgentState) -> AgentState:
    """Savings nudge and cashflow analysis."""
    uvars = _build_user_vars(state)
    t_start = time.time()
    
    # Detect if it's a salary event
    msg = state["user_input"].lower()
    event_type = "general"
    amount = 0.0
    
    import re
    amounts = re.findall(r'₹?([\d,]+)', state["user_input"])
    if amounts:
        amount = float(amounts[0].replace(',', ''))
    
    if "salary" in msg or "credited" in msg:
        event_type = "salary_credit"
    elif "harvest" in msg or "fasal" in msg:
        event_type = "harvest"
    
    cashflow = {}
    if event_type != "general" and amount > 0:
        cashflow = await analyse_cashflow.ainvoke({
            "user_id": state["user_context"]["user_id"],
            "event_type": event_type,
            "amount": amount
        })
    
    docs = await retrieve_regulatory_doc.ainvoke("savings schemes India")
    
    system = COACH_PROMPT.format(**uvars, amount=amount, save_amount=int(amount * 0.10))
    user_msg = f"""
User message: {state['user_input']}

Cashflow analysis: {json.dumps(cashflow)}
Relevant docs: {json.dumps(docs[:1])}

Give a savings nudge in {uvars['language']}.
"""
    
    response = await _call_claude(system=system, user_msg=user_msg, model=HAIKU)
    
    return {
        **state,
        "nudge_result": cashflow,
        "final_response": response,
        "confidence": 82.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["analyse_cashflow", "retrieve_regulatory_doc"]
    }


# ─────────────────────────────────────────────
# NODE 6: LITERACY AGENT
# ─────────────────────────────────────────────
async def literacy_agent_node(state: AgentState) -> AgentState:
    """Explain financial concepts at the user's literacy level."""
    uvars = _build_user_vars(state)
    t_start = time.time()
    
    docs = await retrieve_regulatory_doc.ainvoke(state["user_input"])
    
    system = LITERACY_AGENT_PROMPT.format(**uvars)
    user_msg = f"""
User question: {state['user_input']}

Retrieved regulatory docs for grounding:
{json.dumps(docs, indent=2)}

Answer in {uvars['language']} at literacy level {uvars['literacy_score']}/100.
End with one simple quiz question.
"""
    
    model = HAIKU if uvars["literacy_score"] < 60 else SONNET
    response = await _call_claude(system=system, user_msg=user_msg, model=model)
    
    return {
        **state,
        "final_response": response,
        "retrieved_docs": docs,
        "sources_cited": [{"doc": d["doc_name"], "url": d["source_url"]} for d in docs],
        "confidence": 78.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["retrieve_regulatory_doc"]
    }


# ─────────────────────────────────────────────
# NODE 7: ACCESSIBILITY AGENT (post-processor)
# ─────────────────────────────────────────────
async def accessibility_node(state: AgentState) -> AgentState:
    """Format output for accessibility needs."""
    uvars = _build_user_vars(state)
    
    if not uvars["is_pwd"] and uvars["preferred_comm"] != "voice":
        return state  # No transformation needed
    
    system = ACCESSIBILITY_PROMPT.format(**uvars)
    user_msg = f"""
Original response: {state.get('final_response', '')}

Reformat for {'voice output' if uvars['preferred_comm'] == 'voice' else 'accessibility'}.
Keep under 4 short sentences. No jargon.
"""
    
    response = await _call_claude(system=system, user_msg=user_msg, model=HAIKU)
    
    return {
        **state,
        "final_response": response,
        "tools_called": state.get("tools_called", []) + ["accessibility_formatter"]
    }


# ─────────────────────────────────────────────
# ROUTING FUNCTION
# ─────────────────────────────────────────────
def route_to_agent(state: AgentState) -> str:
    """LangGraph conditional edge — route based on intent."""
    intent_map = {
        "scam_check": "scam_guardian",
        "benefits_query": "benefits_navigator",
        "savings_nudge": "behavioural_coach",
        "literacy": "literacy_agent",
        "general": "literacy_agent",
    }
    return intent_map.get(state.get("intent", "general"), "literacy_agent")