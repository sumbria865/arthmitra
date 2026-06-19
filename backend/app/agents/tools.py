"""
ArthMitra — LangGraph Agent Tools
All tools used across the 7-agent architecture.
"""

import re
import httpx
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from langchain_core.tools import tool


# ─────────────────────────────────────────────
# SCAM GUARDIAN TOOLS
# ─────────────────────────────────────────────

@tool
async def extract_url(text: str) -> dict:
    """Extract and normalise URL or UPI ID from user message."""
    url_pattern = r'https?://[^\s]+'
    upi_pattern = r'[\w.\-]+@[\w]+'
    
    urls = re.findall(url_pattern, text)
    upis = re.findall(upi_pattern, text)
    
    return {
        "urls": urls,
        "upi_ids": upis,
        "raw": text
    }


@tool
async def analyse_domain(url: str) -> dict:
    """
    Analyse domain age, SSL certificate, and known fraud patterns.
    Returns risk signals for the Scam Guardian agent.
    """
    try:
        domain = re.sub(r'https?://', '', url).split('/')[0]
        
        # Known scam patterns
        scam_keywords = [
            'instacash', 'quickloan', 'easymoney', 'fastloan',
            'lotery', 'lottery', 'prize', 'winner', 'free',
            'rbi-approved', 'sebi-certified', 'guaranteed-returns'
        ]
        
        red_flags = []
        risk_score = 0.0
        
        # Check suspicious keywords in domain
        for kw in scam_keywords:
            if kw in domain.lower():
                red_flags.append(f"Suspicious keyword '{kw}' in domain")
                risk_score += 20.0
        
        # Check TLD
        suspicious_tlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.co.in']
        for tld in suspicious_tlds:
            if domain.endswith(tld):
                red_flags.append(f"High-risk TLD: {tld}")
                risk_score += 15.0
        
        # Simulate domain age check (production: use WHOIS API)
        domain_hash = int(hashlib.md5(domain.encode()).hexdigest()[:4], 16)
        simulated_age_days = domain_hash % 365
        
        if simulated_age_days < 30:
            red_flags.append(f"Domain registered only {simulated_age_days} days ago")
            risk_score += 30.0
        elif simulated_age_days < 90:
            red_flags.append(f"Very new domain ({simulated_age_days} days old)")
            risk_score += 15.0
        
        # Check for number substitutions (l33t speak patterns)
        if re.search(r'\d[a-z]|[a-z]\d', domain):
            red_flags.append("Mixed numbers and letters — typical phishing pattern")
            risk_score += 25.0
        
        risk_score = min(risk_score, 100.0)
        trust_score = 100.0 - risk_score
        
        return {
            "domain": domain,
            "domain_age_days": simulated_age_days,
            "risk_score": round(risk_score, 1),
            "trust_score": round(trust_score, 1),
            "red_flags": red_flags,
            "verdict": "fraud" if risk_score > 70 else "suspicious" if risk_score > 40 else "safe"
        }
    except Exception as e:
        return {"error": str(e), "risk_score": 50.0, "verdict": "suspicious"}


@tool
async def check_rbi_registration(entity_name: str) -> dict:
    """Check if a financial entity is registered with RBI."""
    # Production: query RBI CRILC / NBFC master list API
    # Hackathon: pattern-based check
    
    legitimate_keywords = ['sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'canara',
                           'mudra', 'pmjdy', 'pmkisan', 'kvgb', 'nabard']
    
    entity_lower = entity_name.lower()
    is_registered = any(kw in entity_lower for kw in legitimate_keywords)
    
    return {
        "entity": entity_name,
        "rbi_registered": is_registered,
        "message": "Listed in RBI NBFC master list" if is_registered else "NOT found in RBI/SEBI registry"
    }


@tool
async def check_upi_registry(upi_id: str) -> dict:
    """Validate UPI ID against NPCI registry patterns."""
    # Legitimate VPA patterns: username@bankname
    legitimate_banks = [
        'oksbi', 'okhdfcbank', 'okaxis', 'okicici', 'ybl', 'ibl',
        'paytm', 'gpay', 'phonepe', 'upi', 'sbi', 'hdfc', 'icici',
        'axisbank', 'kotak', 'aubank', 'apl', 'abfspay'
    ]
    
    if '@' not in upi_id:
        return {"valid": False, "reason": "Not a valid UPI ID format"}
    
    handle = upi_id.split('@')[1].lower()
    is_legitimate = any(bank in handle for bank in legitimate_banks)
    
    return {
        "upi_id": upi_id,
        "handle": handle,
        "npci_registered": is_legitimate,
        "verdict": "legitimate" if is_legitimate else "unrecognised_vpa"
    }


# ─────────────────────────────────────────────
# BENEFITS NAVIGATOR TOOLS
# ─────────────────────────────────────────────

@tool
async def match_schemes(income_type: str, state: str, monthly_income: Optional[float] = None) -> list[dict]:
    """Match eligible government schemes for a user profile."""
    
    schemes_db = [
        {
            "id": "pm-kisan",
            "name": "PM-KISAN",
            "name_hi": "पीएम किसान",
            "category": "farmer",
            "benefit": "₹6,000/year in 3 instalments",
            "benefit_amount": 6000,
            "eligible_if": lambda it, st, inc: it == "farmer",
            "eligibility_match": 92,
            "apply_url": "https://pmkisan.gov.in",
            "offline": True,
        },
        {
            "id": "mudra-loan",
            "name": "MUDRA Loan",
            "name_hi": "मुद्रा लोन",
            "category": "business",
            "benefit": "Up to ₹10 Lakh collateral-free loan",
            "benefit_amount": 1000000,
            "eligible_if": lambda it, st, inc: it in ["business", "freelancer", "gig_worker"],
            "eligibility_match": 78,
            "apply_url": "https://mudra.org.in",
            "offline": True,
        },
        {
            "id": "jan-dhan",
            "name": "Jan Dhan Yojana",
            "name_hi": "जन धन योजना",
            "category": "banking",
            "benefit": "Zero-balance account + ₹5k overdraft + Insurance",
            "benefit_amount": 5000,
            "eligible_if": lambda it, st, inc: True,
            "eligibility_match": 100,
            "apply_url": "https://pmjdy.gov.in",
            "offline": True,
        },
        {
            "id": "pm-fasal-bima",
            "name": "PM Fasal Bima Yojana",
            "name_hi": "पीएम फसल बीमा योजना",
            "category": "insurance",
            "benefit": "Crop insurance up to full sum insured",
            "benefit_amount": 0,
            "eligible_if": lambda it, st, inc: it == "farmer",
            "eligibility_match": 85,
            "apply_url": "https://pmfby.gov.in",
            "offline": True,
        },
        {
            "id": "ayushman-bharat",
            "name": "Ayushman Bharat PM-JAY",
            "name_hi": "आयुष्मान भारत",
            "category": "health",
            "benefit": "₹5 Lakh health cover per family per year",
            "benefit_amount": 500000,
            "eligible_if": lambda it, st, inc: (inc or 999999) < 300000,
            "eligibility_match": 88,
            "apply_url": "https://pmjay.gov.in",
            "offline": False,
        },
        {
            "id": "pmegp",
            "name": "PMEGP",
            "name_hi": "प्रधानमंत्री रोजगार सृजन",
            "category": "business",
            "benefit": "25-35% govt subsidy on project cost up to ₹50L",
            "benefit_amount": 1750000,
            "eligible_if": lambda it, st, inc: it in ["business", "freelancer"],
            "eligibility_match": 70,
            "apply_url": "https://kviconline.gov.in/pmegpeportal",
            "offline": False,
        },
    ]
    
    matched = []
    for scheme in schemes_db:
        try:
            if scheme["eligible_if"](income_type, state, monthly_income):
                matched.append({
                    "id": scheme["id"],
                    "name": scheme["name"],
                    "name_hi": scheme["name_hi"],
                    "category": scheme["category"],
                    "benefit": scheme["benefit"],
                    "benefit_amount": scheme["benefit_amount"],
                    "eligibility_match": scheme["eligibility_match"],
                    "apply_url": scheme["apply_url"],
                    "offline": scheme["offline"],
                })
        except Exception:
            continue
    
    return sorted(matched, key=lambda x: x["eligibility_match"], reverse=True)


# ─────────────────────────────────────────────
# BEHAVIOURAL COACH TOOLS
# ─────────────────────────────────────────────

@tool
async def analyse_cashflow(user_id: str, event_type: str, amount: float) -> dict:
    """Analyse a financial event and recommend a savings action."""
    
    SAVE_RATIOS = {
        "salary_credit": 0.10,   # Save 10% immediately
        "harvest": 0.20,          # Save 20% of harvest proceeds
        "windfall": 0.30,         # Save 30% of unexpected income
        "month_end": 0.05,        # Move 5% surplus to RD
    }
    
    save_ratio = SAVE_RATIOS.get(event_type, 0.10)
    save_amount = round(amount * save_ratio)
    
    nudge_messages = {
        "salary_credit": f"Salary ₹{amount:,.0f} credited! Save ₹{save_amount:,.0f} first — before any spending.",
        "harvest": f"Harvest proceeds ₹{amount:,.0f} received! Consider saving ₹{save_amount:,.0f} for off-season.",
        "windfall": f"₹{amount:,.0f} received! Save ₹{save_amount:,.0f} in Emergency Fund first.",
        "month_end": f"Month-end surplus! Transfer ₹{save_amount:,.0f} to a Recurring Deposit.",
    }
    
    return {
        "event_type": event_type,
        "total_amount": amount,
        "save_amount": save_amount,
        "save_ratio": save_ratio,
        "nudge_message": nudge_messages.get(event_type, f"Consider saving ₹{save_amount:,.0f}"),
        "emergency_fund_target": amount * 3,  # 3 months expenses
    }


@tool
async def schedule_nudge(user_id: str, nudge_type: str, message: str, send_at: str) -> dict:
    """Schedule a behavioural nudge for future delivery."""
    return {
        "scheduled": True,
        "user_id": user_id,
        "nudge_type": nudge_type,
        "message": message,
        "send_at": send_at,
        "channel": "push"
    }


# ─────────────────────────────────────────────
# CONTEXT AGENT TOOLS
# ─────────────────────────────────────────────

@tool
async def detect_language(text: str) -> dict:
    """Detect language from user input."""
    # Devanagari script range
    devanagari_chars = len([c for c in text if '\u0900' <= c <= '\u097F'])
    
    if devanagari_chars > len(text) * 0.3:
        return {"language": "hi", "confidence": 0.85, "script": "devanagari"}
    
    # Basic heuristics for other scripts
    if any('\u0C00' <= c <= '\u0C7F' for c in text):
        return {"language": "te", "confidence": 0.80, "script": "telugu"}
    if any('\u0B80' <= c <= '\u0BFF' for c in text):
        return {"language": "ta", "confidence": 0.80, "script": "tamil"}
    if any('\u0C80' <= c <= '\u0CFF' for c in text):
        return {"language": "kn", "confidence": 0.80, "script": "kannada"}
    if any('\u0980' <= c <= '\u09FF' for c in text):
        return {"language": "bn", "confidence": 0.80, "script": "bengali"}
    
    return {"language": "en", "confidence": 0.70, "script": "latin"}


@tool
async def estimate_literacy(responses: list[str]) -> dict:
    """Estimate financial literacy score from onboarding responses."""
    score = 30  # base score
    
    keywords_advanced = ['sip', 'mutual fund', 'elss', 'nps', 'fd', 'rd', 'insurance', 'portfolio']
    keywords_basic = ['save', 'loan', 'bank', 'interest', 'account', 'pension']
    
    for resp in responses:
        resp_lower = resp.lower()
        for kw in keywords_advanced:
            if kw in resp_lower:
                score += 10
        for kw in keywords_basic:
            if kw in resp_lower:
                score += 3
    
    score = min(score, 100)
    
    if score < 30:
        level = "beginner"
    elif score < 60:
        level = "intermediate"
    else:
        level = "advanced"
    
    return {
        "literacy_score": score,
        "literacy_level": level,
        "recommended_complexity": "simple" if score < 30 else "moderate" if score < 60 else "advanced"
    }


# ─────────────────────────────────────────────
# RAG / KNOWLEDGE TOOLS
# ─────────────────────────────────────────────

@tool
async def retrieve_regulatory_doc(query: str, top_k: int = 3) -> list[dict]:
    """
    Retrieve relevant RBI/SEBI/IRDAI document chunks from Qdrant vector DB.
    Production: calls Qdrant 1.9.4 with sentence-transformers embeddings.
    """
    # Hackathon stub — returns structured mock for demo
    mock_chunks = [
        {
            "doc_name": "RBI Digital Lending Guidelines 2022",
            "section": "Section 3.2 — Disclosure Requirements",
            "chunk_text": "All digital lending apps must display Annual Percentage Rate (APR), not just interest rate. The effective annual interest rate including all fees must be disclosed upfront.",
            "source_url": "https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12382",
            "authority": "RBI",
            "relevance": 0.91
        },
        {
            "doc_name": "SEBI IA Regulations 2021",
            "section": "Regulation 22 — Prohibited Activities",
            "chunk_text": "No investment adviser shall promise guaranteed or assured returns. Any promise of fixed/guaranteed returns in securities is a violation.",
            "source_url": "https://sebi.gov.in/legal/regulations/sep-2020/",
            "authority": "SEBI",
            "relevance": 0.85
        },
        {
            "doc_name": "IRDAI Insurance Act 1938",
            "section": "Section 45 — Policy not to be called in question",
            "chunk_text": "No policy of life insurance shall be called in question on any ground after the expiry of three years from the date of policy, whichever is later.",
            "source_url": "https://irdai.gov.in/",
            "authority": "IRDAI",
            "relevance": 0.79
        }
    ]
    return mock_chunks[:top_k]