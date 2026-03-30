import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Boolean, DateTime, Numeric, Integer, SmallInteger, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class MenuItem(Base):
    __tablename__ = 'menu_items'

    id:          Mapped[uuid.UUID]    = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mess_id:     Mapped[uuid.UUID]    = mapped_column(UUID(as_uuid=True), ForeignKey('messes.id', ondelete='CASCADE'), nullable=False)
    name:        Mapped[str]          = mapped_column(String(200), nullable=False)
    description: Mapped[str | None]   = mapped_column(String)
    meal_type:   Mapped[str]          = mapped_column(String(20), nullable=False)
    day_of_week: Mapped[int | None]   = mapped_column(SmallInteger)
    price:       Mapped[Decimal|None] = mapped_column(Numeric(8,2))
    is_veg:      Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    calories:    Mapped[int | None]   = mapped_column(Integer)
    is_active:   Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    created_at:  Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:  Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    mess: Mapped['Mess'] = relationship('Mess', back_populates='menu_items')
