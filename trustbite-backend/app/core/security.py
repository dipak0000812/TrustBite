"""
Core authentication & authorization helpers.

Provides:
  - Password hashing / verification  (bcrypt via passlib)
  - JWT access-token creation        (HS256 signed)
  - JWT refresh-token creation       (separate type claim)
  - get_current_user dependency      (validates token, checks blacklist, checks is_active)
  - require_role() factory           (role-based access guard)
"""

import uuid
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Optional

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db


# ── Password context ──────────────────────────────────────────────
# rounds= is read from settings so it can be tuned without code changes.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.BCRYPT_ROUNDS,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ── Password helpers ──────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a plain-text password with bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against its bcrypt hash.

    Rejects passwords > 72 bytes to avoid the silent bcrypt truncation
    vulnerability — bcrypt silently ignores bytes beyond the 72nd.
    """
    if len(plain_password.encode("utf-8")) > 72:
        return False
    return pwd_context.verify(plain_password, hashed_password)


# ── Token creation ────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    """
    Create a short-lived signed JWT access token.

    Embeds:
      - exp  : expiry timestamp
      - iat  : issued-at timestamp
      - jti  : unique token ID (used for blacklist on logout)
      - type : "access" (prevents a refresh token being used here)
    """
    payload = data.copy()
    now = datetime.now(timezone.utc)
    payload.update(
        {
            "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": now,
            "jti": str(uuid.uuid4()),
            "type": "access",
        }
    )
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """
    Create a long-lived signed JWT refresh token.

    The 'type' claim is 'refresh' — get_current_user explicitly rejects
    refresh tokens, so they can never be used as access tokens.
    """
    payload = data.copy()
    now = datetime.now(timezone.utc)
    payload.update(
        {
            "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "iat": now,
            "jti": str(uuid.uuid4()),
            "type": "refresh",
        }
    )
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ── Token validation helpers ──────────────────────────────────────

def _decode_token(token: str, expected_type: str, db: Session):
    """
    Decode and validate a JWT token.

    Raises HTTPException 401 on any failure (expired, wrong type,
    blacklisted, user not found / inactive).
    """
    from app.models.token_blacklist import BlacklistedToken
    from app.models.user import User

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    expired_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token expired. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except ExpiredSignatureError:
        raise expired_exception
    except JWTError:
        raise credentials_exception

    # Enforce token-type claim (prevents refresh token being used as access token and vice-versa)
    if payload.get("type") != expected_type:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    jti: Optional[str] = payload.get("jti")

    if user_id is None or jti is None:
        raise credentials_exception

    # Check token blacklist (for logged-out tokens)
    if db.query(BlacklistedToken).filter(BlacklistedToken.jti == jti).first():
        raise credentials_exception

    # Validate user_id is a valid UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception

    user = (
        db.query(User)
        .filter(User.id == user_uuid, User.is_active == True)  # noqa: E712
        .first()
    )
    if not user:
        raise credentials_exception

    return user, payload


# ── FastAPI dependencies ──────────────────────────────────────────

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    access_token_cookie: Optional[str] = Cookie(default=None, alias="access_token"),
    db: Session = Depends(get_db),
):
    """
    Resolve the authenticated user from either:
      1. Authorization: Bearer <token>  header  (SPA / mobile clients)
      2. HttpOnly cookie `access_token`          (browser clients — more secure)

    Priority: Authorization header > cookie.
    """
    raw_token = token or access_token_cookie

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Cookie stores "Bearer <token>" — strip the prefix if present
    if raw_token.startswith("Bearer "):
        raw_token = raw_token[len("Bearer "):]

    user, _ = _decode_token(raw_token, expected_type="access", db=db)
    return user


# ── Role guard factory ────────────────────────────────────────────

@lru_cache(maxsize=None)
def require_role(*roles: str):
    """
    Returns a FastAPI dependency that enforces role membership.

    Usage:
        current_user = Depends(require_role("admin"))
        current_user = Depends(require_role("admin", "mess_owner"))

    The @lru_cache ensures the same roles-tuple always returns the
    same dependency object — FastAPI then reuses its cached resolution
    instead of creating a new closure per request.
    """

    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(roles)}",
            )
        return current_user

    return role_checker