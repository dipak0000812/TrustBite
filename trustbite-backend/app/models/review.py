from __future__ import annotations
import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import SmallInteger, Text, Boolean, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.mess import Mess

class Review(Base):
    __tablename__ = 'reviews'
    __table_args__ = (
        UniqueConstraint('student_id', 'mess_id', name='uq_one_review_per_student_mess'),
    )

    id:             Mapped[uuid.UUID]  = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mess_id:        Mapped[uuid.UUID]  = mapped_column(Uuid(as_uuid=True), ForeignKey('messes.id', ondelete='CASCADE'), nullable=False)
    student_id:     Mapped[uuid.UUID]  = mapped_column(Uuid(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    rating:         Mapped[int]        = mapped_column(SmallInteger, nullable=False)
    hygiene_rating: Mapped[int | None] = mapped_column(SmallInteger)
    comment:        Mapped[str | None] = mapped_column(Text)
    is_active:      Mapped[bool]       = mapped_column(Boolean, default=True, nullable=False)
    created_at:     Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:     Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    mess:    Mapped['Mess'] = relationship('Mess', back_populates='reviews')
    student: Mapped['User'] = relationship('User', back_populates='reviews')
