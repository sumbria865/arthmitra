"""
ArthMitra — FastAPI 0.111.0 Application
India's Agentic Financial Co-Pilot — Backend Entry Point
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Correct imports based on your folder structure
from app.core.config import settings
from app.db.database import engine, Base

from app.api.routes import (
    auth,
    users,
    chat,
    agents,
    scam,
    benefits,
    voice,
    notifications,
    admin,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ ArthMitra backend started — DB tables ensured")

    yield

    # Shutdown
    await engine.dispose()

    print("🛑 ArthMitra backend shut down")


app = FastAPI(
    title="ArthMitra API",
    description="India's Agentic Financial Co-Pilot — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags=["Users"]
)

app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["Chat"]
)

app.include_router(
    agents.router,
    prefix="/api/v1/agents",
    tags=["Agents"]
)

app.include_router(
    scam.router,
    prefix="/api/v1/scam",
    tags=["Scam Detection"]
)

app.include_router(
    benefits.router,
    prefix="/api/v1/benefits",
    tags=["Benefits Navigator"]
)

app.include_router(
    voice.router,
    prefix="/api/v1/voice",
    tags=["Voice"]
)

app.include_router(
    notifications.router,
    prefix="/api/v1/notifications",
    tags=["Notifications"]
)

app.include_router(
    admin.router,
    prefix="/api/v1/admin",
    tags=["Admin"]
)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "ArthMitra Backend Running",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "arthmitra-backend",
        "version": "1.0.0"
    }