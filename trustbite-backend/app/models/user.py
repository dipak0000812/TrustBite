from __future__ import annotations
import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.mess import Mess
    from app.models.review import Review
    from app.models.favourite import Favourite

class User(Base):
    __tablename__ = 'users'

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    full_name:     Mapped[str]          = mapped_column(String(120), nullable=False)
    email:         Mapped[str]          = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str]          = mapped_column(String(255), nullable=False)
    role:          Mapped[str]          = mapped_column(String(20),  nullable=False)
    college_name:  Mapped[str | None]   = mapped_column(String(200))
    phone:         Mapped[str | None]   = mapped_column(String(15))
    avatar_url:    Mapped[str | None]   = mapped_column(String)
    is_active:     Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    created_at:    Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:    Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    messes:     Mapped[list['Mess']]      = relationship('Mess', back_populates='owner', lazy='select')
    reviews:    Mapped[list['Review']]    = relationship('Review', back_populates='student', lazy='select')
    favourites: Mapped[list['Favourite']] = relationship('Favourite', back_populates='student', lazy='select')