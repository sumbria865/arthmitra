"""
ArthMitra — Users API (Real DB)
All operations read/write to PostgreSQL via SQLAlchemy.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.models import User, Interaction, ScamScan, Nudge, SchemeMatch
from app.core.deps import get_current_user

router = APIRouter()


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    income_type: Optional[str] = None
    income_monthly: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    biggest_worry: Optional[str] = None
    preferred_comm: Optional[str] = None
    is_pwd: Optional[bool] = None


class OnboardingRequest(BaseModel):
    income_type: str
    biggest_worry: str
    preferred_comm: str
    language: Optional[str] = "hi"
    name: Optional[str] = None
    state: Optional[str] = None


# ── GET /me ───────────────────────────────────────────────────────
@router.get("/me")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return {
        "id": current_user.id,
        "phone": current_user.phone,
        "name": current_user.name,
        "language": current_user.language,
        "income_type": current_user.income_type,
        "income_monthly": current_user.income_monthly,
        "state": current_user.state,
        "literacy_score": current_user.literacy_score,
        "literacy_level": current_user.literacy_level,
        "biggest_worry": current_user.biggest_worry,
        "preferred_comm": current_user.preferred_comm,
        "is_pwd": current_user.is_pwd,
        "onboarding_done": current_user.onboarding_done,
        "created_at": current_user.created_at.isoformat(),
    }


# ── PATCH /me ─────────────────────────────────────────────────────
@router.patch("/me")
async def update_profile(
    body: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updates = body.model_dump(exclude_none=True)
    for field, value in updates.items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return {"updated": True, "user_id": current_user.id}


# ── POST /onboarding ──────────────────────────────────────────────
@router.post("/onboarding")
async def complete_onboarding(
    body: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save 3-question onboarding answers to DB. Called after Q3 answer."""
    current_user.income_type = body.income_type
    current_user.biggest_worry = body.biggest_worry
    current_user.preferred_comm = body.preferred_comm
    if body.language:
        current_user.language = body.language
    if body.name:
        current_user.name = body.name
    if body.state:
        current_user.state = body.state

    # Estimate initial literacy score
    if body.income_type in ["salary", "business"]:
        current_user.literacy_score = 35
    elif body.income_type in ["farmer", "daily_wage"]:
        current_user.literacy_score = 20
    else:
        current_user.literacy_score = 25

    current_user.onboarding_done = True
    await db.commit()
    await db.refresh(current_user)

    return {
        "onboarding_done": True,
        "user_id": current_user.id,
        "literacy_score": current_user.literacy_score,
    }


# ── DELETE /me/data ───────────────────────────────────────────────
@router.delete("/me/data")
async def delete_all_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """DPDP Act 2023 — Right to erasure."""
    user_id = current_user.id

    # Delete all related records
    await db.execute(delete(Interaction).where(Interaction.user_id == user_id))
    await db.execute(delete(ScamScan).where(ScamScan.user_id == user_id))
    await db.execute(delete(Nudge).where(Nudge.user_id == user_id))
    await db.execute(delete(SchemeMatch).where(SchemeMatch.user_id == user_id))

    # Delete user
    await db.delete(current_user)
    await db.commit()

    return {"message": "All data deleted. DPDP Act 2023 compliant."}