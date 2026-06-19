"""ArthMitra — Notifications API"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_notifications():
    return {"notifications": [], "unread": 0}

@router.patch("/{notif_id}/read")
async def mark_read(notif_id: str):
    return {"id": notif_id, "is_read": True}