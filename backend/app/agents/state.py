"""
ArthMitra — LangGraph Agent State
"""
from typing import TypedDict, Annotated, Optional
from langgraph.graph.message import add_messages


class UserContext(TypedDict):
    user_id: str
    phone: str
    name: str
    language: str          # hi/mr/kn/ta/te/bn/en
    income_type: str
    literacy_score: int    # 0-100
    biggest_worry: str
    state: str
    is_pwd: bool


class AgentState(TypedDict):
    # Core identity
    user_context: UserContext
    session_id: str

    # Conversation
    messages: Annotated[list, add_messages]
    user_input: str
    user_input_language: str
    is_voice_input: bool

    # Routing
    active_agent: str
    intent: str            # scam_check / benefits_query / savings_nudge / literacy / general
    requires_escalation: bool

    # Agent outputs
    scam_result: Optional[dict]
    benefits_result: Optional[list]
    nudge_result: Optional[dict]
    literacy_result: Optional[dict]

    # RAG
    retrieved_docs: list[dict]
    sources_cited: list[dict]

    # Response
    final_response: str
    confidence: float      # 0-100
    response_language: str
    tools_called: list[str]
    latency_ms: int