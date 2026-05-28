from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserOut, TokenOut, UserUpdate
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# 'admin' is intentionally excluded — admin accounts must be created
# directly in the database or via a protected internal endpoint.
# Never expose admin self-registration through any public API route.
ALLOWED_ROLES = ["student", "mess_owner"]


@router.post("/register", status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Register new user
    """

    try:
        email = data.email.lower().strip()

        if data.role not in ALLOWED_ROLES:
            raise HTTPException(
                status_code=400,
                detail="Invalid role selected"
            )

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

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
            "data": UserOut.model_validate(user)
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Database error occurred"
        )


@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login endpoint

    IMPORTANT:
    Frontend must send:
    application/x-www-form-urlencoded
    """

    email = form.username.lower().strip()

    user = (
        db.query(User)
        .filter(
            User.email == email,
            User.is_active == True
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    try:
        if not verify_password(form.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
        }
    )

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": UserOut.model_validate(user)
        }
    }


@router.get('/me', response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.put("/profile", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Explicit whitelist of fields a user can update on their own profile.
    # role, email, password_hash, is_active are intentionally excluded —
    # a user must never be able to escalate their own privileges.
    MUTABLE_FIELDS = {
        "full_name", "college_name", "phone",
        "avatar_url", "is_onboarding_complete", "preferences"
    }

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field not in MUTABLE_FIELDS:
            # Should never happen given the schema, but be explicit
            raise HTTPException(
                status_code=400,
                detail=f"Field '{field}' cannot be updated via this endpoint."
            )
        setattr(current_user, field, value)

    db.commit()

    db.refresh(current_user)
    
    return UserOut.model_validate(current_user)


@router.get("/users")
def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """
    Admin-only endpoint
    """

    users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "success": True,
        "message": "Users fetched successfully",
        "data": [UserOut.model_validate(user) for user in users]
    }