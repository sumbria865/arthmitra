"""ArthMitra — Benefits Navigator API"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.agents.tools import match_schemes

router = APIRouter()

@router.get("/match")
async def get_matched_schemes(
    income_type: str = "farmer",
    state: str = "Maharashtra",
    db: AsyncSession = Depends(get_db)
):
    schemes = await match_schemes.ainvoke({
        "income_type": income_type, "state": state, "monthly_income": None
    })
    return {"schemes": schemes, "total": len(schemes)}

@router.post("/apply/{scheme_id}")
async def apply_for_scheme(scheme_id: str, db: AsyncSession = Depends(get_db)):
    return {"scheme_id": scheme_id, "status": "applied", "form_prefilled": True}