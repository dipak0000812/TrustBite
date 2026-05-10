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
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ─────────────────────────────────────────────
# JWT Helpers
# ─────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({
        "exp": expire
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
        detail="Token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id: Optional[str] = payload.get("sub")

        if user_id is None:
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
    Example:
    current_user = Depends(require_role("admin"))
    """

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user.role not in roles:

            allowed_roles = ", ".join(roles)

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Allowed roles: {allowed_roles}"
            )

        return current_user

    return role_checker