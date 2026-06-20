"""
ArthMitra — JWT Security
"""
import uuid
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "arthmitra-jwt-secret-change-in-production-2024"
ALGORITHM = "HS256"
EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def create_access_token(user_id: str, phone: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "phone": phone,
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Returns payload dict or raises JWTError."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_user_id_from_token(token: str) -> str | None:
    try:
        payload = decode_token(token)
        return payload.get("sub")
    except JWTError:
        return None