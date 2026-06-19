"""ArthMitra — Auth API Routes"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

@router.post("/otp/send")
async def send_otp(req: OTPRequest):
    """Send OTP via Supabase Phone Auth."""
    return {"message": "OTP sent", "phone": req.phone}

@router.post("/otp/verify")
async def verify_otp(req: OTPVerify):
    """Verify OTP and return JWT."""
    return {
        "access_token": "mock-jwt-token",
        "token_type": "bearer",
        "user": {"phone": req.phone, "is_new": True}
    }

@router.post("/logout")
async def logout():
    return {"message": "Logged out"}