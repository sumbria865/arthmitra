"""ArthMitra — Agent Status API"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def agent_status():
    return {
        "agents": [
            {"name": "Context Agent", "status": "active", "calls_today": 142},
            {"name": "Literacy Agent", "status": "active", "calls_today": 89},
            {"name": "Behavioural Coach", "status": "active", "calls_today": 67},
            {"name": "Scam Guardian", "status": "active", "calls_today": 23},
            {"name": "Benefits Navigator", "status": "active", "calls_today": 45},
            {"name": "Accessibility Agent", "status": "active", "calls_today": 12},
            {"name": "Master Orchestrator", "status": "active", "calls_today": 366},
        ]
    }