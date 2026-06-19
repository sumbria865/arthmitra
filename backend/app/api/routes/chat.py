"""
ArthMitra — Chat API Route
POST /api/v1/chat/message — Main agent interaction endpoint
"""

import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional

from app.db.database import get_db
from app.agents.graph import arthmitra_graph
from app.agents.state import AgentState, UserContext

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


def _mock_user_context(user_id: str) -> UserContext:
    """Stub — production: fetch from DB by user_id from JWT."""
    return UserContext(
        user_id=user_id,
        phone="+919876543210",
        name="Rajesh",
        language="hi",
        income_type="farmer",
        literacy_score=42,
        biggest_worry="debt",
        state="Maharashtra",
        is_pwd=False,
    )


@router.post("/message", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    # current_user: dict = Depends(get_current_user),  # uncomment with auth
):
    """
    Main chat endpoint — routes through the 7-agent LangGraph.
    
    - Detects language automatically
    - Routes to correct specialist agent
    - Returns grounded, sourced response with confidence score
    - Escalates to human if confidence < 60 or high-stakes query
    """
    t_start = time.time()
    session_id = req.session_id or str(uuid.uuid4())
    user_id = "demo-user-001"  # Replace with JWT user_id in production

    user_context = _mock_user_context(user_id)

    initial_state: AgentState = {
        "user_context": user_context,
        "session_id": session_id,
        "messages": [],
        "user_input": req.message,
        "user_input_language": req.language_override or "hi",
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
        "response_language": user_context["language"],
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
    requires_escalation = confidence < 60 or final_state.get("requires_escalation", False)

    return ChatResponse(
        response=final_state.get("final_response", "माफ़ करें, कुछ गड़बड़ हो गई।"),
        confidence=confidence,
        agent_used=final_state.get("active_agent", "unknown"),
        intent=final_state.get("intent", "general"),
        tools_called=final_state.get("tools_called", []),
        sources=final_state.get("sources_cited", []),
        latency_ms=int((time.time() - t_start) * 1000),
        session_id=session_id,
        scam_result=final_state.get("scam_result"),
        benefits=final_state.get("benefits_result"),
        nudge=final_state.get("nudge_result"),
        requires_escalation=requires_escalation,
    )


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve chat history for a session."""
    # Production: query interactions table
    return {"session_id": session_id, "messages": [], "count": 0}