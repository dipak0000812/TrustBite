import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, ExpiredSignatureError, jwt
from passlib.context import CryptContext

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


# ─────────────────────────────────────────────
# Password Helpers
# ─────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    # bcrypt truncates at 72 bytes — reject silently instead of comparing truncated hash
    if len(plain_password.encode("utf-8")) > 72:
        return False

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ─────────────────────────────────────────────
# JWT Helpers
# ─────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    """
    Creates a signed JWT access token.

    Embeds:
      - exp: expiry timestamp
      - iat: issued-at timestamp
      - jti: unique token ID (for future blacklisting)
      - type: "access" (prevents token confusion — a refresh token
              can never be accepted where an access token is expected)
    """
    payload = data.copy()

    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload.update({
        "exp":  expire,
        "iat":  now,
        "jti":  str(uuid.uuid4()),   # unique ID per token
        "type": "access",            # token type guard
    })

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


# ─────────────────────────────────────────────
# Current User Dependency
# ─────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
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
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Reject any token that isn't an access token
        # (prevents a refresh/other token being used here)
        if payload.get("type") != "access":
            raise credentials_exception

        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        jti: Optional[str] = payload.get("jti")
        if jti is None:
            raise credentials_exception

        from app.models.token_blacklist import BlacklistedToken
        is_blacklisted = (
            db.query(BlacklistedToken)
            .filter(BlacklistedToken.jti == jti)
            .first()
        )
        if is_blacklisted:
            raise credentials_exception

    except ExpiredSignatureError:
        raise expired_exception

    except JWTError:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception

    user = (
        db.query(User)
        .filter(
            User.id == user_uuid,
            User.is_active == True
        )
        .first()
    )

    if not user:
        raise credentials_exception

    return user


# ─────────────────────────────────────────────
# Role Guard Factory
# ─────────────────────────────────────────────

def require_role(*roles):
    """
    Usage:
        current_user = Depends(require_role("admin"))
        current_user = Depends(require_role("admin", "mess_owner"))
    """

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user.role not in roles:

            allowed_roles = ", ".join(roles)

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {allowed_roles}"
            )

        return current_user

    return role_checker