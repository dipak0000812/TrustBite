import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    full_name:    str
    email:        EmailStr
    password:     str
    role:         str = 'student'
    college_name: str | None = None
    phone:        str | None = None

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ('student', 'mess_owner'):
            raise ValueError('Role must be student or mess_owner')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


class UserOut(BaseModel):
    id:           uuid.UUID
    full_name:    str
    email:        str
    role:         str
    college_name: str | None = None
    phone:        str | None = None
    avatar_url:   str | None = None
    is_active:    bool
    created_at:   datetime
    model_config = {'from_attributes': True}


class TokenOut(BaseModel):
    access_token: str
    token_type:   str = 'bearer'
    user:         UserOut
