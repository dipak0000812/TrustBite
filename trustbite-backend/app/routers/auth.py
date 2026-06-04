"""
Authentication router — /api/auth/*

Endpoints:
  POST /register        — create a new student / mess_owner account
  POST /login           — issue access + refresh tokens
  POST /refresh         — exchange a valid refresh token for a new access token
  POST /logout          — blacklist the current access token
  GET  /me              — return the authenticated user's profile
  GET  /profile         — alias for /me
  PUT  /profile         — update mutable profile fields
  PUT  /change-password — change authenticated user's password
  GET  /users           — admin-only: list all active users (paginated)
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import ExpiredSignatureError, JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import (
    _decode_token,
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    require_role,
    verify_password,
)
from app.db.database import get_db
from app.models.token_blacklist import BlacklistedToken
from app.models.user import User
from app.schemas.user import UserOut, UserRegister, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# 'admin' is intentionally excluded — admin accounts must be created
# directly in the database or via a protected internal endpoint.
ALLOWED_ROLES = ["student", "mess_owner"]

# ── Helpers ───────────────────────────────────────────────────────

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Write HttpOnly cookies for both tokens."""
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86_400,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Expire both auth cookies on logout."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")


# ── Rate limiter (imported from app state set up in main.py) ──────
def _get_limiter():
    from app.main import limiter
    return limiter


# ── Register ──────────────────────────────────────────────────────

@router.post("/register", status_code=201)
@limiter.limit("5/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Rate-limited to 5 requests/minute per IP to deter automated sign-ups.
    """
    try:
        email = data.email.lower().strip()

        if data.role not in ALLOWED_ROLES:
            raise HTTPException(status_code=400, detail="Invalid role selected")

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(
            full_name=data.full_name.strip(),
            email=email,
            password_hash=hash_password(data.password),
            role=data.role,
            college_name=data.college_name,
            phone=data.phone,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "message": "User registered successfully",
            "data": UserOut.model_validate(user),
        }

    except HTTPException:
        raise
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")


# ── Login ─────────────────────────────────────────────────────────

@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authenticate and issue tokens.

    - Returns access + refresh tokens in the JSON body (for API / mobile clients).
    - Also sets HttpOnly cookies (for browser clients — mitigates XSS token theft).
    - Rate-limited to 5 attempts/minute per IP.

    Frontend must send: Content-Type: application/x-www-form-urlencoded
    """
    email = form.username.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email, User.is_active == True)  # noqa: E712
        .first()
    )

    # Use a single generic message to prevent user-enumeration
    _auth_failed = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )

    if not user:
        raise _auth_failed

    try:
        if not verify_password(form.password, user.password_hash):
            raise _auth_failed
    except Exception:
        raise _auth_failed

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    # Set HttpOnly cookies (browser clients)
    _set_auth_cookies(response, access_token, refresh_token)

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": UserOut.model_validate(user),
        },
    }


# ── Refresh ───────────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str | None = None


@router.post("/refresh")
def refresh_token_endpoint(
    response: Response,
    request: Request,
    cookie_token: str | None = Cookie(alias="refresh_token", default=None),
    db: Session = Depends(get_db),
    body: RefreshRequest = RefreshRequest(),
):
    """
    Exchange a valid refresh token for a new access token.

    Accepts the refresh token from (in priority order):
      1. HttpOnly `refresh_token` cookie  → browser clients
      2. JSON body { "refresh_token": "..." } → mobile / API clients
    """
    token = cookie_token or (body.refresh_token if body else None)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    user, payload = _decode_token(token, expected_type="refresh", db=db)

    new_access = create_access_token({"sub": str(user.id), "role": user.role})

    # Update only the access-token cookie; leave refresh cookie untouched
    response.set_cookie(
        key="access_token",
        value=f"Bearer {new_access}",
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {
        "success": True,
        "data": {
            "access_token": new_access,
            "token_type": "bearer",
        },
    }


# ── Logout ────────────────────────────────────────────────────────

def _blacklist_token_from_request(request: Request, db) -> None:
    """
    Extract the access token from Authorization header or cookie,
    decode it, and insert its jti into the blacklisted_tokens table.
    Safe to call even if the token is already expired or missing.
    """
    auth_header = request.headers.get("Authorization", "")
    raw_token = auth_header.removeprefix("Bearer ").strip()

    if not raw_token:
        raw_token = (request.cookies.get("access_token") or "").removeprefix("Bearer ").strip()

    if not raw_token:
        return

    try:
        payload = jwt.decode(
            raw_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        jti = payload.get("jti")
        exp_ts = payload.get("exp")
        if jti and exp_ts:
            expires_at = datetime.fromtimestamp(exp_ts, tz=timezone.utc)
            already = db.query(BlacklistedToken).filter(BlacklistedToken.jti == jti).first()
            if not already:
                db.add(BlacklistedToken(jti=jti, expires_at=expires_at))
                db.commit()
    except (JWTError, ExpiredSignatureError):
        pass  # Already invalid — logout still succeeds


@router.post("/logout", status_code=200)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Logout: blacklist the access token's JTI + clear HttpOnly cookies.

    The blacklist is checked on every authenticated request (see _decode_token),
    so this ends the session server-side regardless of token expiry time.
    Works for both Bearer-header clients (mobile/SPA) and cookie clients (browser).
    """
    _blacklist_token_from_request(request, db)
    _clear_auth_cookies(response)
    return {"success": True, "message": "Logged out and token invalidated"}


@router.post("/logout-full", status_code=200)
def logout_with_blacklist(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alias for /logout — kept for backward compatibility."""
    _blacklist_token_from_request(request, db)
    _clear_auth_cookies(response)
    return {"success": True, "message": "Logged out and token invalidated"}


# ── Profile ───────────────────────────────────────────────────────

@router.get("/me", response_model=UserOut)
@router.get("/profile", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's own profile."""
    return UserOut.model_validate(current_user)


@router.put("/profile", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update mutable profile fields.

    Fields intentionally excluded: role, email, password_hash, is_active.
    A user must never be able to escalate their own privileges via this endpoint.
    """
    MUTABLE_FIELDS = {
        "full_name", "college_name", "phone",
        "avatar_url", "is_onboarding_complete", "preferences",
    }

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field not in MUTABLE_FIELDS:
            raise HTTPException(
                status_code=400,
                detail=f"Field '{field}' cannot be updated via this endpoint.",
            )
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


# ── Password change ───────────────────────────────────────────────

class _PasswordChange:
    """Internal schema (no pydantic import needed at top level)."""
    pass


from pydantic import BaseModel  # noqa: E402


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


@router.put("/change-password", status_code=200)
def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change the authenticated user's password.

    Requires the current password to be supplied as proof of identity.
    The new password must pass the same strength policy as registration.
    """
    from app.schemas.user import UserRegister  # re-use the password validator

    # Validate new password strength via Pydantic
    try:
        UserRegister.model_validate({
            "full_name": "x",
            "email": "x@x.com",
            "password": data.new_password,
            "role": "student",
        })
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"success": True, "message": "Password changed successfully"}


# ── Admin: list users ─────────────────────────────────────────────

from fastapi import Query  # noqa: E402


@router.get("/users")
def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Admin-only: list all active users with pagination."""
    users = (
        db.query(User)
        .filter(User.is_active == True)  # noqa: E712
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "success": True,
        "message": "Users fetched successfully",
        "data": [UserOut.model_validate(u) for u in users],
    }