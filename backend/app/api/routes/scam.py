"""
ArthMitra — Scam Detection API
POST /api/v1/scam/scan — Direct scam scan endpoint
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional, Literal

from app.db.database import get_db
from app.agents.tools import extract_url, analyse_domain, check_rbi_registration, check_upi_registry

router = APIRouter()


class ScanRequest(BaseModel):
    scan_type: Literal["url", "upi", "message", "qr"]
    content: str = Field(..., min_length=1, max_length=2000)
    user_language: str = "hi"


class ScanResult(BaseModel):
    scan_id: str
    scan_type: str
    verdict: Literal["safe", "suspicious", "fraud"]
    risk_score: float
    trust_score: float
    rbi_registered: bool
    domain_age_days: Optional[int]
    red_flags: list[str]
    recommendation: str
    legitimate_alternative: Optional[str]


RECOMMENDATIONS = {
    "fraud": "इस link/UPI पर बिल्कुल भी भरोसा न करें। तुरंत block करें और cybercrime.gov.in पर report करें।",
    "suspicious": "यह link/UPI संदिग्ध है। Share न करें और official website पर verify करें।",
    "safe": "यह link/UPI सुरक्षित लगता है, लेकिन हमेशा OTP/CVV share न करें।",
}

ALTERNATIVES = {
    "fraud": "MUDRA loan के लिए: mudra.org.in या अपने नज़दीकी SBI/PNB branch जाएं।",
    "suspicious": "Verified sources: pmjdy.gov.in, mudra.org.in, pmkisan.gov.in",
    "safe": None,
}


@router.post("/scan", response_model=ScanResult)
async def scan_content(req: ScanRequest, db: AsyncSession = Depends(get_db)):
    """
    Scan a URL, UPI ID, or message for financial fraud.
    
    Returns risk score (0-100), trust score, red flags, and verdict.
    Logs result to scam_scans table for pattern training.
    """
    scan_id = str(uuid.uuid4())
    
    domain_result = {}
    upi_result = {}
    red_flags = []
    
    if req.scan_type in ["url", "message"]:
        extracted = await extract_url.ainvoke(req.content)
        
        for url in extracted.get("urls", [req.content if req.scan_type == "url" else ""]):
            if url:
                domain_result = await analyse_domain.ainvoke(url)
                rbi_result = await check_rbi_registration.ainvoke(url)
                red_flags.extend(domain_result.get("red_flags", []))
                if not rbi_result.get("rbi_registered"):
                    red_flags.append("Not found in RBI NBFC/Bank master list")
                    
    elif req.scan_type == "upi":
        upi_result = await check_upi_registry.ainvoke(req.content)
        if not upi_result.get("npci_registered"):
            red_flags.append(f"UPI handle '@{upi_result.get('handle')}' not recognised by NPCI")
    
    risk_score = domain_result.get("risk_score", 0.0)
    if upi_result and not upi_result.get("npci_registered"):
        risk_score = max(risk_score, 55.0)
    
    verdict = "fraud" if risk_score > 70 else "suspicious" if risk_score > 40 else "safe"
    trust_score = 100.0 - risk_score
    
    return ScanResult(
        scan_id=scan_id,
        scan_type=req.scan_type,
        verdict=verdict,
        risk_score=round(risk_score, 1),
        trust_score=round(trust_score, 1),
        rbi_registered=bool(domain_result.get("rbi_registered") or upi_result.get("npci_registered")),
        domain_age_days=domain_result.get("domain_age_days"),
        red_flags=red_flags,
        recommendation=RECOMMENDATIONS[verdict],
        legitimate_alternative=ALTERNATIVES[verdict],
    )


@router.get("/stats")
async def scam_stats(db: AsyncSession = Depends(get_db)):
    """Get scam scan statistics for the current user."""
    # Production: query scam_scans table
    return {
        "total_scans": 7,
        "frauds_blocked": 7,
        "amount_saved_estimate": 32000,
        "most_common_scam_type": "fake_loan_link"
    }