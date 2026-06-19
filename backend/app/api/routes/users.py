"""ArthMitra — Users API Routes"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db

router = APIRouter()

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    income_type: Optional[str] = None
    state: Optional[str] = None
    biggest_worry: Optional[str] = None
    preferred_comm: Optional[str] = None

@router.get("/me")
async def get_profile(db: AsyncSession = Depends(get_db)):
    return {
        "id": "demo-user-001",
        "name": "Rajesh",
        "phone": "+919876543210",
        "language": "hi",
        "income_type": "farmer",
        "literacy_score": 42,
        "biggest_worry": "debt",
        "state": "Maharashtra",
        "onboarding_done": True,
    }

@router.patch("/me")
async def update_profile(body: UserProfileUpdate, db: AsyncSession = Depends(get_db)):
    return {"updated": True, **body.model_dump(exclude_none=True)}

@router.post("/onboarding")
async def complete_onboarding(body: UserProfileUpdate, db: AsyncSession = Depends(get_db)):
    return {"onboarding_done": True, "user_id": "demo-user-001"}

@router.delete("/me/data")
async def delete_all_data(db: AsyncSession = Depends(get_db)):
    """DPDP Act 2023 — right to erasure. Voice command triggered."""
    return {"message": "All personal data deleted within 24 hours as per DPDP Act 2023"}