import re
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

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Full name cannot be blank')
        if len(v) > 120:
            raise ValueError('Full name must be 120 characters or fewer')
        return v

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        allowed = ('student', 'mess_owner')
        if v not in allowed:
            raise ValueError(
                f"Role must be one of: {', '.join(allowed)}. "
                "Admin accounts cannot be self-registered."
            )
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        errors = []
        if len(v) < 8:
            errors.append('at least 8 characters')
        if not re.search(r'[A-Z]', v):
            errors.append('at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            errors.append('at least one lowercase letter')
        if not re.search(r'\d', v):
            errors.append('at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-\+\=\[\]\/\\]', v):
            errors.append('at least one special character (!@#$%^&* etc.)')
        if errors:
            raise ValueError('Password must contain: ' + ', '.join(errors))
        return v

    @field_validator('college_name')
    @classmethod
    def validate_college_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 200:
                raise ValueError('College name must be 200 characters or fewer')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is not None:
            v = v.strip()
            if not re.match(r'^\+?[\d\s\-]{7,15}$', v):
                raise ValueError('Phone number format is invalid')
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
    is_onboarding_complete: bool = False
    preferences:  dict | None = None
    created_at:   datetime
    model_config = {'from_attributes': True}


class UserUpdate(BaseModel):
    full_name:    str | None = None
    college_name: str | None = None
    phone:        str | None = None
    avatar_url:   str | None = None
    is_onboarding_complete: bool | None = None
    preferences:  dict | None = None

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Full name cannot be blank')
            if len(v) > 120:
                raise ValueError('Full name must be 120 characters or fewer')
        return v

    @field_validator('college_name')
    @classmethod
    def validate_college_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 200:
                raise ValueError('College name must be 200 characters or fewer')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is not None:
            v = v.strip()
            if not re.match(r'^\+?[\d\s\-]{7,15}$', v):
                raise ValueError('Phone number format is invalid')
        return v

    @field_validator('avatar_url')
    @classmethod
    def validate_avatar_url(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Avatar URL must be 500 characters or fewer')
        return v


class TokenOut(BaseModel):
    access_token: str
    token_type:   str = 'bearer'
    user:         UserOut
