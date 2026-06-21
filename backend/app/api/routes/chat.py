"""
ArthMitra — Chat API (with DB persistence)
Every message saved to interactions table.
"""

import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field
from typing import Optional

from app.db.database import get_db
from app.agents.graph import arthmitra_graph
from app.agents.state import AgentState, UserContext
from app.models.models import User, Interaction, Session as ChatSession
from app.core.deps import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    is_voice: bool = False
    language_override: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    confidence: float
    agent_used: str
    intent: str
    tools_called: list[str]
    sources: list[dict]
    latency_ms: int
    session_id: str
    scam_result: Optional[dict] = None
    benefits: Optional[list] = None
    nudge: Optional[dict] = None
    requires_escalation: bool = False


@router.post("/message", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t_start = time.time()
    session_id = req.session_id or str(uuid.uuid4())

    # Build user context from real DB record
    user_context = UserContext(
        user_id=current_user.id,
        phone=current_user.phone,
        name=current_user.name or "User",
        language=req.language_override or current_user.language or "hi",
        income_type=current_user.income_type or "salaried",
        literacy_score=current_user.literacy_score or 30,
        biggest_worry=current_user.biggest_worry or "savings",
        state=current_user.state or "Maharashtra",
        is_pwd=current_user.is_pwd or False,
    )

    initial_state: AgentState = {
        "user_context": user_context,
        "session_id": session_id,
        "messages": [],
        "user_input": req.message,
        "user_input_language": req.language_override or current_user.language or "hi",
        "is_voice_input": req.is_voice,
        "active_agent": "",
        "intent": "",
        "requires_escalation": False,
        "scam_result": None,
        "benefits_result": None,
        "nudge_result": None,
        "literacy_result": None,
        "retrieved_docs": [],
        "sources_cited": [],
        "final_response": "",
        "confidence": 0.0,
        "response_language": current_user.language or "hi",
        "tools_called": [],
        "latency_ms": 0,
    }

    try:
        final_state = await arthmitra_graph.ainvoke(initial_state)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {str(e)}"
        )

    confidence = final_state.get("confidence", 70.0)
    latency = int((time.time() - t_start) * 1000)

    # ── Save to DB ────────────────────────────────────────────────
    try:
        # Ensure a Session row exists before inserting an Interaction that
        # references it via foreign key — session_id is generated client-side
        # (or accepted from the mobile app) but no row in `sessions` is ever
        # created elsewhere, so we upsert it here before the FK insert.
        existing_session = await db.get(ChatSession, session_id)
        if existing_session is None:
            db.add(ChatSession(
                id=session_id,
                user_id=current_user.id,
                channel="mobile",
                language_used=current_user.language or "hi",
                message_count=0,
            ))
            await db.flush()  # ensure it exists before the Interaction FK references it

        interaction = Interaction(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            session_id=session_id,
            agent_name=final_state.get("active_agent", "master_orchestrator"),
            intent=final_state.get("intent", "general"),
            user_message=req.message,
            response_text=final_state.get("final_response", ""),
            response_language=current_user.language or "hi",
            confidence=confidence,
            source_docs=final_state.get("sources_cited", []),
            tools_called=final_state.get("tools_called", []),
            latency_ms=latency,
            is_voice=req.is_voice,
        )
        db.add(interaction)
        await db.commit()
    except Exception as e:
        print(f"[DB save warning] {e}")  # Don't fail the response if DB save fails
        await db.rollback()  # required — without this, the session stays in a
                              # broken state and the cleanup commit in get_db()
                              # raises PendingRollbackError, turning this into a 500

    return ChatResponse(
        response=final_state.get("final_response", "माफ़ करें, कुछ गड़बड़ हो गई।"),
        confidence=confidence,
        agent_used=final_state.get("active_agent", "unknown"),
        intent=final_state.get("intent", "general"),
        tools_called=final_state.get("tools_called", []),
        sources=final_state.get("sources_cited", []),
        latency_ms=latency,
        session_id=session_id,
        scam_result=final_state.get("scam_result"),
        benefits=final_state.get("benefits_result"),
        nudge=final_state.get("nudge_result"),
        requires_escalation=confidence < 60,
    )


@router.get("/history/{session_id}")
async def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all messages for a session from DB."""
    result = await db.execute(
        select(Interaction)
        .where(
            Interaction.user_id == current_user.id,
            Interaction.session_id == session_id,
        )
        .order_by(Interaction.timestamp)
    )
    interactions = result.scalars().all()

    messages = []
    for i in interactions:
        messages.append({"role": "user", "text": i.user_message, "timestamp": i.timestamp.isoformat()})
        messages.append({"role": "assistant", "text": i.response_text, "confidence": i.confidence, "agent": i.agent_name, "timestamp": i.timestamp.isoformat()})

    return {"session_id": session_id, "messages": messages, "count": len(interactions)}


@router.get("/sessions")
async def get_my_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get recent chat sessions for current user."""
    result = await db.execute(
        select(
            Interaction.session_id,
            Interaction.timestamp,
            Interaction.intent,
        )
        .where(Interaction.user_id == current_user.id)
        .order_by(desc(Interaction.timestamp))
        .limit(20)
    )
    rows = result.all()
    seen = {}
    for row in rows:
        if row.session_id not in seen:
            seen[row.session_id] = {
                "session_id": row.session_id,
                "last_message_at": row.timestamp.isoformat(),
                "last_intent": row.intent,
            }
    return {"sessions": list(seen.values())}