"""
ArthMitra — Async SQLAlchemy Database Connection
PostgreSQL 16.3 + asyncpg
"""

import uuid
from asyncpg import Connection
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.models import Base
from app.core.config import settings


class NoPreparedStatementConnection(Connection):
    """
    Supabase's pooler (pgbouncer, transaction mode) does not support
    prepared statements. asyncpg's default statement-name generator
    reuses short counter-based names (__asyncpg_stmt_1__, _2__, ...)
    which collide across pooled connections handed out by pgbouncer.
    Using a uuid-based name avoids those collisions even when the
    cache itself is disabled below.
    """

    def _get_unique_id(self, prefix: str) -> str:
        return f"__asyncpg_{prefix}_{uuid.uuid4()}__"


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
    # pool_pre_ping issues its own statement under the hood and has been
    # known to reintroduce this exact error with pgbouncer; safe to leave
    # off since asyncpg + Supabase pooler handles dead connections fine.
    pool_pre_ping=False,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "connection_class": NoPreparedStatementConnection,
    },
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()