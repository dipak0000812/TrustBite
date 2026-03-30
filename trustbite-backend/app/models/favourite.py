import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class Favourite(Base):
    __tablename__ = 'favourites'
    __table_args__ = (
        UniqueConstraint('student_id', 'mess_id', name='uq_favourite'),
    )

    id:         Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    mess_id:    Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('messes.id', ondelete='CASCADE'), nullable=False)
    created_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=func.now())

    student: Mapped['User'] = relationship('User', back_populates='favourites')
    mess:    Mapped['Mess'] = relationship('Mess', back_populates='favourites')
