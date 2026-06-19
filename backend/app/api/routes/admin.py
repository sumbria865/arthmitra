"""ArthMitra — Admin Analytics API"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/dashboard")
async def admin_dashboard():
    return {
        "total_users": 1247,
        "active_today": 342,
        "scams_blocked": 89,
        "schemes_matched": 456,
        "avg_literacy_score": 38.4,
        "top_languages": [
            {"lang": "hi", "count": 680},
            {"lang": "mr", "count": 210},
            {"lang": "kn", "count": 157},
            {"lang": "ta", "count": 123},
            {"lang": "en", "count": 77},
        ],
        "agent_distribution": {
            "scam_guardian": 0.23,
            "benefits_navigator": 0.31,
            "literacy_agent": 0.27,
            "behavioural_coach": 0.19,
        }
    }