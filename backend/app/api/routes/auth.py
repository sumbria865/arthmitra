"""
ArthMitra — Auth Routes
Real OTP flow:
  1. POST /otp/send   → saves OTP to DB (or Supabase), sends SMS
  2. POST /otp/verify → verifies OTP, creates user if new, returns JWT
  3. POST /logout     → client deletes token

Since Supabase phone auth needs a paid plan, we use a simple
in-memory OTP store for hackathon demo. 
Production: replace `_otp_store` with Redis + Twilio/MSG91.
"""

import uuid
import random
import time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.models import User
from app.core.security import create_access_token

router = APIRouter()

# ── In-memory OTP store (hackathon demo) ─────────────────────────
# Format: { "+919876543210": {"otp": "123456", "expires_at": 1234567890} }
_otp_store: dict = {}

OTP_EXPIRE_SECONDS = 300  # 5 minutes


class OTPRequest(BaseModel):
    phone: str   # e.g. "+919876543210"


class OTPVerify(BaseModel):
    phone: str
    otp: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool
    user: dict


# ── Helper ────────────────────────────────────────────────────────
def _normalize_phone(phone: str) -> str:
    """Ensure +91XXXXXXXXXX format."""
    phone = phone.strip().replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = "+91" + phone.lstrip("0")
    return phone


# ── POST /otp/send ────────────────────────────────────────────────
@router.post("/otp/send")
async def send_otp(req: OTPRequest):
    phone = _normalize_phone(req.phone)

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    _otp_store[phone] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRE_SECONDS,
    }

    # TODO production: send via MSG91 / Twilio
    # For hackathon demo: print to console so you can test
    print(f"\n{'='*40}")
    print(f"  OTP for {phone}: {otp}")
    print(f"{'='*40}\n")

    return {
        "message": "OTP sent successfully",
        "phone": phone,
        # Return OTP in demo mode so frontend can autofill
        # REMOVE THIS in production!
        "demo_otp": otp,
    }


# ── POST /otp/verify ─────────────────────────────────────────────
@router.post("/otp/verify", response_model=AuthResponse)
async def verify_otp(req: OTPVerify, db: AsyncSession = Depends(get_db)):
    phone = _normalize_phone(req.phone)
    stored = _otp_store.get(phone)

    # Validate OTP
    if not stored:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new OTP.")
    if time.time() > stored["expires_at"]:
        del _otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new OTP.")
    if stored["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP.")

    # Clear used OTP
    del _otp_store[phone]

    # ── Find or create user in DB ─────────────────────────────────
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    is_new = False

    if user is None:
        # New user — create record
        is_new = True
        user = User(
            id=str(uuid.uuid4()),
            phone=phone,
            language="hi",       # default, updated after onboarding
            literacy_score=0,
            onboarding_done=False,
            is_active=True,
        )
        db.add(user)
        await db.flush()   # get the id without committing yet
        await db.commit()
        await db.refresh(user)

    # Generate JWT
    token = create_access_token(user_id=user.id, phone=user.phone)

    return AuthResponse(
        access_token=token,
        is_new_user=is_new,
        user={
            "id": user.id,
            "phone": user.phone,
            "name": user.name,
            "language": user.language,
            "income_type": user.income_type,
            "literacy_score": user.literacy_score,
            "biggest_worry": user.biggest_worry,
            "state": user.state,
            "onboarding_done": user.onboarding_done,
            "is_new": is_new,
        },
    )


# ── POST /logout ──────────────────────────────────────────────────
@router.post("/logout")
async def logout():
    # JWT is stateless — client just deletes the token
    # Production: add token to Redis blocklist
    return {"message": "Logged out successfully"}