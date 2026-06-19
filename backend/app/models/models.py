"""
ArthMitra - Complete SQLAlchemy Models
PostgreSQL 16.3 | SQLAlchemy 2.0
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Text, JSON,
    ForeignKey, Enum as SAEnum, Index
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum


class Base(DeclarativeBase):
    pass


class IncomeType(str, enum.Enum):
    SALARY = "salary"
    DAILY_WAGE = "daily_wage"
    FARMER = "farmer"
    BUSINESS = "business"
    FREELANCER = "freelancer"
    GIG_WORKER = "gig_worker"


class LiteracyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class LanguageCode(str, enum.Enum):
    HI = "hi"   # Hindi
    MR = "mr"   # Marathi
    KN = "kn"   # Kannada
    TA = "ta"   # Tamil
    TE = "te"   # Telugu
    BN = "bn"   # Bengali
    EN = "en"   # English


class AgentName(str, enum.Enum):
    CONTEXT = "context_agent"
    LITERACY = "literacy_agent"
    COACH = "behavioural_coach"
    SCAM_GUARDIAN = "scam_guardian"
    BENEFITS = "benefits_navigator"
    ACCESSIBILITY = "accessibility_agent"
    ORCHESTRATOR = "master_orchestrator"


class SchemeStatus(str, enum.Enum):
    MATCHED = "matched"
    APPLIED = "applied"
    ENROLLED = "enrolled"
    REJECTED = "rejected"


class NudgeType(str, enum.Enum):
    SAVINGS = "savings"
    SPENDING = "spending"
    SCHEME = "scheme"
    SCAM_ALERT = "scam_alert"
    SALARY_CREDIT = "salary_credit"
    HARVEST = "harvest"


# ─────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    phone: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(120))
    language: Mapped[str] = mapped_column(SAEnum(LanguageCode), default=LanguageCode.HI)
    income_type: Mapped[Optional[str]] = mapped_column(SAEnum(IncomeType))
    income_monthly: Mapped[Optional[float]] = mapped_column(Float)
    state: Mapped[Optional[str]] = mapped_column(String(60))
    district: Mapped[Optional[str]] = mapped_column(String(60))
    literacy_score: Mapped[int] = mapped_column(Integer, default=0)
    literacy_level: Mapped[str] = mapped_column(SAEnum(LiteracyLevel), default=LiteracyLevel.BEGINNER)
    biggest_worry: Mapped[Optional[str]] = mapped_column(String(50))  # debt/savings/child_edu/retirement/fraud
    preferred_comm: Mapped[str] = mapped_column(String(20), default="both")  # voice/text/both
    is_pwd: Mapped[bool] = mapped_column(Boolean, default=False)
    onboarding_done: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    supabase_uid: Mapped[Optional[str]] = mapped_column(String(36), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    interactions: Mapped[list["Interaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    scam_scans: Mapped[list["ScamScan"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    scheme_matches: Mapped[list["SchemeMatch"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    nudges: Mapped[list["Nudge"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sessions: Mapped[list["Session"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_users_phone", "phone"),
        Index("ix_users_state", "state"),
    )


# ─────────────────────────────────────────────
# SESSIONS
# ─────────────────────────────────────────────
class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    channel: Mapped[str] = mapped_column(String(20), default="mobile")  # mobile/whatsapp/web
    language_used: Mapped[str] = mapped_column(String(5), default="hi")
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    agent_trace: Mapped[Optional[dict]] = mapped_column(JSON)

    user: Mapped["User"] = relationship(back_populates="sessions")


# ─────────────────────────────────────────────
# INTERACTIONS / CHAT HISTORY
# ─────────────────────────────────────────────
class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    session_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("sessions.id"))
    agent_name: Mapped[str] = mapped_column(SAEnum(AgentName))
    intent: Mapped[Optional[str]] = mapped_column(String(100))
    user_message: Mapped[Text] = mapped_column(Text)
    response_text: Mapped[Text] = mapped_column(Text)
    response_language: Mapped[str] = mapped_column(String(5), default="hi")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    source_docs: Mapped[Optional[list]] = mapped_column(JSON)  # [{doc_name, section, url}]
    tools_called: Mapped[Optional[list]] = mapped_column(JSON)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer)
    escalated_to_human: Mapped[bool] = mapped_column(Boolean, default=False)
    is_voice: Mapped[bool] = mapped_column(Boolean, default=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="interactions")

    __table_args__ = (
        Index("ix_interactions_user_id", "user_id"),
        Index("ix_interactions_timestamp", "timestamp"),
    )


# ─────────────────────────────────────────────
# SCAM SCANS
# ─────────────────────────────────────────────
class ScamScan(Base):
    __tablename__ = "scam_scans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    scan_type: Mapped[str] = mapped_column(String(20))  # url/upi/message/qr
    raw_input: Mapped[Text] = mapped_column(Text)
    domain_age_days: Mapped[Optional[int]] = mapped_column(Integer)
    rbi_registered: Mapped[Optional[bool]] = mapped_column(Boolean)
    upi_registry_match: Mapped[Optional[bool]] = mapped_column(Boolean)
    pattern_matched: Mapped[Optional[str]] = mapped_column(String(200))
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    trust_score: Mapped[float] = mapped_column(Float, default=100.0)
    verdict: Mapped[str] = mapped_column(String(20))  # safe/suspicious/fraud
    blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    red_flags: Mapped[Optional[list]] = mapped_column(JSON)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="scam_scans")

    __table_args__ = (Index("ix_scam_scans_user_id", "user_id"),)


# ─────────────────────────────────────────────
# GOVERNMENT SCHEMES
# ─────────────────────────────────────────────
class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    name_hi: Mapped[Optional[str]] = mapped_column(String(200))
    ministry: Mapped[Optional[str]] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50))  # farmer/banking/insurance/health/education
    benefit_type: Mapped[str] = mapped_column(String(50))  # cash/insurance/loan/subsidy
    benefit_amount: Mapped[Optional[float]] = mapped_column(Float)
    benefit_desc: Mapped[Optional[Text]] = mapped_column(Text)
    eligibility_criteria: Mapped[Optional[dict]] = mapped_column(JSON)
    apply_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_available_offline: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    matches: Mapped[list["SchemeMatch"]] = relationship(back_populates="scheme")


class SchemeMatch(Base):
    __tablename__ = "scheme_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    scheme_id: Mapped[str] = mapped_column(String(36), ForeignKey("schemes.id"), nullable=False)
    eligibility_score: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(SAEnum(SchemeStatus), default=SchemeStatus.MATCHED)
    applied_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    enrolled_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    form_prefilled: Mapped[bool] = mapped_column(Boolean, default=False)
    matched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="scheme_matches")
    scheme: Mapped["Scheme"] = relationship(back_populates="matches")


# ─────────────────────────────────────────────
# NUDGES (BEHAVIOURAL COACH)
# ─────────────────────────────────────────────
class Nudge(Base):
    __tablename__ = "nudges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    nudge_type: Mapped[str] = mapped_column(SAEnum(NudgeType))
    message: Mapped[Text] = mapped_column(Text)
    message_lang: Mapped[str] = mapped_column(String(5), default="hi")
    trigger_event: Mapped[Optional[str]] = mapped_column(String(100))  # salary_credit/harvest/month_end
    amount: Mapped[Optional[float]] = mapped_column(Float)
    fired_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    acted_on: Mapped[bool] = mapped_column(Boolean, default=False)
    acted_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    outcome_amount: Mapped[Optional[float]] = mapped_column(Float)

    user: Mapped["User"] = relationship(back_populates="nudges")


# ─────────────────────────────────────────────
# KNOWLEDGE CHUNKS (RAG — Qdrant-backed)
# ─────────────────────────────────────────────
class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    doc_name: Mapped[str] = mapped_column(String(200))
    section: Mapped[Optional[str]] = mapped_column(String(300))
    chunk_text: Mapped[Text] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(5), default="en")
    source_url: Mapped[Optional[str]] = mapped_column(String(500))
    authority: Mapped[str] = mapped_column(String(50))  # RBI/SEBI/IRDAI/PMKISAN/MUDRA
    verified_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    qdrant_id: Mapped[Optional[str]] = mapped_column(String(36))  # vector DB ID
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────
# DOCUMENTS (UPLOADED / INDEXED)
# ─────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(300))
    authority: Mapped[str] = mapped_column(String(100))
    file_url: Mapped[Optional[str]] = mapped_column(String(500))
    language: Mapped[str] = mapped_column(String(5), default="en")
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    indexed: Mapped[bool] = mapped_column(Boolean, default=False)
    indexed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[Text] = mapped_column(Text)
    channel: Mapped[str] = mapped_column(String(20))  # push/sms/whatsapp/email
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────
# AUDIT LOGS
# ─────────────────────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36))
    action: Mapped[str] = mapped_column(String(200))
    resource: Mapped[Optional[str]] = mapped_column(String(100))
    resource_id: Mapped[Optional[str]] = mapped_column(String(36))
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(String(300))
    details: Mapped[Optional[dict]] = mapped_column(JSON)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("ix_audit_logs_user_id", "user_id"),)