from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserOut, TokenOut
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix='/api/auth', tags=['Auth'])


@router.post('/register', response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Workflow: Register Page → POST /api/auth/register
    Success:  201 Created → navigate('/login')
    Conflict: 409 'Email already registered'
    """
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=409, detail='Email already registered')
    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        college_name=data.college_name,
        phone=data.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post('/login', response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Workflow: Login Page → POST /api/auth/login
    IMPORTANT: FastAPI OAuth2 form expects 'username' field (not email).
    Frontend must send multipart/form-data with username + password.
    """
    user = db.query(User).filter(User.email == form.username, User.is_active == True).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Incorrect email or password')
    token = create_access_token({'sub': str(user.id), 'role': user.role})
    return TokenOut(
        access_token=token,
        token_type='bearer',
        user=UserOut.model_validate(user),
    )


@router.get('/me', response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Used on every protected page mount to validate token is still valid."""
    return current_user


@router.get('/users', response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin endpoint — GET /api/auth/users — full user list with roles."""
    from app.core.security import require_role
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Access denied. Required: admin')
    return db.query(User).filter(User.is_active == True).order_by(User.created_at.desc()).all()
