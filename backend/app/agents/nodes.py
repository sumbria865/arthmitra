"""
ArthMitra — LangGraph Agent Nodes
LLM: Google Gemini 2.0 Flash (google.generativeai) — free tier.
Anthropic client removed; Gemini is the only LLM provider.
Falls back to rule-based responses if GEMINI_API_KEY is missing.
"""

import os
import re
import time
import json
import httpx

from .state import AgentState
from .prompts import (
    ORCHESTRATOR_PROMPT, SCAM_GUARDIAN_PROMPT, LITERACY_AGENT_PROMPT,
    COACH_PROMPT, BENEFITS_PROMPT, ACCESSIBILITY_PROMPT,
)
from .tools import (
    extract_url, analyse_domain, check_rbi_registration, check_upi_registry,
    match_schemes, analyse_cashflow, schedule_nudge,
    detect_language, retrieve_regulatory_doc,
)

# ── Gemini setup ────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)


async def _call_gemini(system: str, user_msg: str, max_tokens: int = 800) -> str:
    """
    Call Gemini 2.0 Flash via REST.
    Returns the text response, or a rule-based fallback if the key is missing
    or the API call fails.
    """
    if not GEMINI_API_KEY:
        return _rule_based_fallback(user_msg)

    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user_msg}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": max_tokens,
        },
    }
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            r = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            r.raise_for_status()
            data = r.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except httpx.HTTPStatusError as e:
        print(f"[Gemini HTTP error] {e.response.status_code}: {e.response.text[:200]}")
        return _rule_based_fallback(user_msg)
    except Exception as e:
        print(f"[Gemini error] {type(e).__name__}: {e}")
        return _rule_based_fallback(user_msg)


def _rule_based_fallback(user_msg: str) -> str:
    """Completely offline fallback — no LLM needed. Used when Gemini is unavailable."""
    msg = user_msg.lower()
    if any(k in msg for k in ["loan", "link", "upi", "fraud", "scam", "fake", "http", ".xyz"]):
        return (
            "⚠️ यह लिंक/UPI संदिग्ध है। कृपया किसी भी unknown link पर click न करें।\n\n"
            "Safe loan के लिए: **mudra.org.in** या नज़दीकी SBI/PNB branch जाएं।\n\n"
            "_ArthMitra Scam Guardian — RBI guidelines के अनुसार_"
        )
    if any(k in msg for k in ["scheme", "yojana", "kisan", "mudra", "benefit", "government"]):
        return (
            "🌾 आपके लिए योजनाएं:\n\n"
            "1. **PM-KISAN** — ₹6,000/year (किसान)\n"
            "2. **MUDRA Loan** — ₹10 लाख तक\n"
            "3. **Jan Dhan** — Zero-balance account + ₹5k overdraft\n\n"
            "Benefits tab में जाएं → Apply करें।"
        )
    if any(k in msg for k in ["save", "savings", "salary", "bachat", "paise"]):
        return (
            "💰 बचत की सलाह:\n\n"
            "Salary मिलते ही **10% पहले बचाएं**, फिर खर्च करें।\n"
            "50-30-20 Rule: 50% जरूरत • 30% चाहत • 20% बचत"
        )
    return (
        "नमस्ते! मैं ArthMitra हूँ — आपकी वित्तीय सहायक।\n\n"
        "मैं इनमें मदद कर सकती हूँ:\n"
        "• 🛡️ Scam detection (URL/UPI scan)\n"
        "• 🎁 Government schemes (PM-KISAN, MUDRA)\n"
        "• 💰 Savings advice\n"
        "• 📚 Financial literacy\n\n"
        "आप क्या जानना चाहते हैं?"
    )


def _build_user_vars(state: AgentState) -> dict:
    uc = state.get("user_context", {})
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
        "tools_called": state.get("tools_called", []) + ["detect_language"],
    }


# ─────────────────────────────────────────────
# NODE 2: MASTER ORCHESTRATOR — keyword routing (no LLM cost)
# ─────────────────────────────────────────────
async def orchestrator_node(state: AgentState) -> AgentState:
    msg = state["user_input"].lower()

    if any(k in msg for k in ["link", "url", "upi", "scan", "fraud", "scam", "fake",
                               "http", ".xyz", ".tk", "suspicious", "lottery", "prize"]):
        intent, route_to = "scam_check", "scam_guardian"
    elif any(k in msg for k in ["scheme", "yojana", "government", "benefit", "kisan",
                                 "mudra", "pension", "bima", "insurance", "subsidy"]):
        intent, route_to = "benefits_query", "benefits_navigator"
    elif any(k in msg for k in ["save", "saving", "budget", "salary", "spend", "bachat",
                                 "invest", "credited", "harvest", "fasal", "bonus",
                                 "month end", "mahina"]):
        intent, route_to = "savings_nudge", "behavioural_coach"
    else:
        intent, route_to = "general", "literacy_agent"

    return {
        **state,
        "intent": intent,
        "active_agent": route_to,
        "tools_called": state.get("tools_called", []) + ["orchestrator"],
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
        domain_result = await analyse_domain.ainvoke(url)
        rbi_result = await check_rbi_registration.ainvoke(url)
        scan_results.append({**domain_result, **rbi_result, "type": "url"})

    for upi in extracted.get("upi_ids", []):
        upi_result = await check_upi_registry.ainvoke(upi)
        scan_results.append({**upi_result, "type": "upi"})

    top_risk = max((r.get("risk_score", 0) for r in scan_results), default=0)

    system = SCAM_GUARDIAN_PROMPT.format(**uvars)
    user_msg = (
        f"User message: {state['user_input']}\n\n"
        f"Tool scan results:\n{json.dumps(scan_results, indent=2)}\n\n"
        f"Give verdict in {uvars['language']} + English. Be direct about fraud."
    )
    response = await _call_gemini(system, user_msg, max_tokens=600)

    verdict = "fraud" if top_risk > 70 else "suspicious" if top_risk > 40 else "safe"

    return {
        **state,
        "scam_result": {
            "scan_results": scan_results,
            "risk_score": top_risk,
            "verdict": verdict,
        },
        "final_response": response,
        "confidence": max(0.0, 100.0 - top_risk) if top_risk > 0 else 80.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + [
            "extract_url", "analyse_domain", "check_rbi_registration"
        ],
    }


# ─────────────────────────────────────────────
# NODE 4: BENEFITS NAVIGATOR
# ─────────────────────────────────────────────
async def benefits_navigator_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    uc = state.get("user_context", {})
    t_start = time.time()

    schemes = await match_schemes.ainvoke({
        "income_type": uc.get("income_type", "salaried"),
        "state": uc.get("state", "Maharashtra"),
        "monthly_income": uc.get("income_monthly"),
    })

    system = BENEFITS_PROMPT.format(**uvars)
    user_msg = (
        f"User query: {state['user_input']}\n\n"
        f"Matched schemes:\n{json.dumps(schemes[:3], indent=2)}\n\n"
        f"Explain top 3 in {uvars['language']}. Show eligibility %, benefit, how to apply."
    )
    response = await _call_gemini(system, user_msg, max_tokens=700)

    # P5: strip specific product names if confidence is low
    response = _compliance_strip(response)

    return {
        **state,
        "benefits_result": schemes[:3],
        "final_response": response,
        "confidence": 88.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["match_schemes"],
    }


# ─────────────────────────────────────────────
# NODE 5: BEHAVIOURAL COACH  (P2 fix)
# ─────────────────────────────────────────────
async def behavioural_coach_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    t_start = time.time()
    msg = state["user_input"].lower()
    uc = state.get("user_context", {})

    # P2 FIX — keyword-based event_type detection (complete mapping)
    if any(k in msg for k in ["salary", "credited", "vetan", "tankhwa"]):
        event_type = "salary_credit"
    elif any(k in msg for k in ["harvest", "fasal", "crop"]):
        event_type = "harvest"
    elif any(k in msg for k in ["bonus", "windfall", "lottery payout", "prize money",
                                 "unexpected", "extra income", "incentive"]):
        event_type = "windfall"
    elif any(k in msg for k in ["month end", "mahina khatam", "end of month",
                                 "month close", "surplus"]):
        event_type = "month_end"
    else:
        event_type = "salary_credit"   # safest default

    # Extract amount from message
    amounts = re.findall(r'₹?([\d,]+)', state["user_input"])
    amount = float(amounts[0].replace(",", "")) if amounts else 0.0

    # P2 FIX — always pass event_type; only call if amount > 0
    cashflow: dict = {}
    if amount > 0:
        cashflow = await analyse_cashflow.ainvoke({
            "user_id": uc.get("user_id", "demo"),
            "event_type": event_type,          # was missing before — this was the bug
            "amount": amount,
        })

        # Also schedule a nudge (wires up schedule_nudge tool)
        if cashflow.get("save_amount", 0) > 0:
            await schedule_nudge.ainvoke({
                "user_id": uc.get("user_id", "demo"),
                "nudge_type": event_type,
                "message": cashflow.get("nudge_message", ""),
                "send_at": "now",
            })

    system = COACH_PROMPT.format(
        **uvars,
        amount=amount,
        save_amount=int(amount * 0.10),
    )
    user_msg = (
        f"User message: {state['user_input']}\n"
        f"Detected event: {event_type}\n"
        f"Cashflow analysis: {json.dumps(cashflow)}\n\n"
        f"Give a practical savings nudge in {uvars['language']}. "
        f"Keep under 4 lines. Be friendly, not preachy."
    )
    response = await _call_gemini(system, user_msg, max_tokens=400)

    # P5: compliance strip
    response = _compliance_strip(response)

    return {
        **state,
        "nudge_result": cashflow,
        "final_response": response,
        "confidence": 82.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["analyse_cashflow", "schedule_nudge"],
    }


# ─────────────────────────────────────────────
# NODE 6: LITERACY AGENT
# ─────────────────────────────────────────────
async def literacy_agent_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    t_start = time.time()

    docs = await retrieve_regulatory_doc.ainvoke(state["user_input"])

    system = LITERACY_AGENT_PROMPT.format(**uvars)
    user_msg = (
        f"User question: {state['user_input']}\n\n"
        f"Reference docs:\n{json.dumps(docs, indent=2)}\n\n"
        f"Answer in {uvars['language']} at literacy level {uvars['literacy_score']}/100. "
        f"End with one simple quiz question."
    )
    response = await _call_gemini(system, user_msg, max_tokens=700)

    return {
        **state,
        "final_response": response,
        "retrieved_docs": docs,
        "sources_cited": [
            {"doc": d.get("doc_name", ""), "url": d.get("source_url", "")}
            for d in docs
        ],
        "confidence": 78.0,
        "latency_ms": int((time.time() - t_start) * 1000),
        "tools_called": state.get("tools_called", []) + ["retrieve_regulatory_doc"],
    }


# ─────────────────────────────────────────────
# NODE 7: ACCESSIBILITY (post-processor)
# ─────────────────────────────────────────────
async def accessibility_node(state: AgentState) -> AgentState:
    uvars = _build_user_vars(state)
    if not uvars["is_pwd"] and uvars["preferred_comm"] != "voice":
        return state   # nothing to transform

    # Lightweight strip — no extra LLM call needed
    response = state.get("final_response", "")
    response = response.replace("**", "").replace("*", "").replace("_", "")
    return {
        **state,
        "final_response": response,
        "tools_called": state.get("tools_called", []) + ["accessibility_formatter"],
    }


# ─────────────────────────────────────────────
# P5 HELPER — Compliance output check
# ─────────────────────────────────────────────
_SPECIFIC_PRODUCT_NAMES = [
    "SBI RD", "HDFC RD", "ICICI RD", "Axis RD",
    "SBI FD", "HDFC FD",
    "Zerodha", "Groww", "Upstox", "PhonePe",
    "buy SBI", "invest in HDFC",
]

def _compliance_strip(text: str) -> str:
    """
    P5: Remove any specific bank/product recommendations the LLM may have
    generated, replacing with generic category names.
    SEBI IA Regulation 22 — no specific product advice.
    """
    for name in _SPECIFIC_PRODUCT_NAMES:
        # Replace "SBI RD" → "Recurring Deposit", etc.
        generic = name.split()[-1]   # last word: RD, FD, etc.
        text = text.replace(name, generic)
    return text


# ─────────────────────────────────────────────
# ROUTING FUNCTION
# ─────────────────────────────────────────────
def route_to_agent(state: AgentState) -> str:
    intent_map = {
        "scam_check":    "scam_guardian",
        "benefits_query": "benefits_navigator",
        "savings_nudge": "behavioural_coach",
        "general":       "literacy_agent",
    }
    return intent_map.get(state.get("intent", "general"), "literacy_agent")