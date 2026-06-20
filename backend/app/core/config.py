"""
ArthMitra — Application Configuration
"""

"""
ArthMitra — Application Configuration
"""

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    APP_NAME: str = "ArthMitra"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://arthmitra:password@localhost:5432/arthmitra"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Qdrant
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "arthmitra_knowledge"

  
    GEMINI_API_KEY: str = ""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str

    # JWT
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    # CORS
    CORS_ORIGINS: list[str] = [
    "http://localhost:8082",      # Expo Web
    "http://127.0.0.1:8082",

    "http://localhost:8081",      # Expo native
    "exp://localhost:8081",

    "http://localhost:3000",      # React web if needed
]

    # Voice
    WHISPER_MODEL: str = "large-v3"
    TTS_MODEL: str = "xtts_v2"

    # Langfuse (observability)
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()