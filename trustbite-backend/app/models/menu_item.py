from __future__ import annotations
import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Boolean, DateTime, Numeric, Integer, SmallInteger, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.mess import Mess

class MenuItem(Base):
    __tablename__ = 'menu_items'          # ✅ correct spelling

    id:          Mapped[uuid.UUID]    = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mess_id:     Mapped[uuid.UUID]    = mapped_column(Uuid(as_uuid=True), ForeignKey('messes.id', ondelete='CASCADE'), nullable=False)
    name:        Mapped[str]          = mapped_column(String(200), nullable=False)
    description: Mapped[str | None]   = mapped_column(String, nullable=True)   # ✅ nullable
    meal_type:   Mapped[str]          = mapped_column(String(20), nullable=False)
    day_of_week: Mapped[int | None]   = mapped_column(SmallInteger, nullable=True)  # ✅ correct type
    price:       Mapped[Decimal | None] = mapped_column(Numeric(8,2), nullable=True) # ✅ correct annotation
    is_veg:      Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)  # ✅ correct name
    calories:    Mapped[int | None]   = mapped_column(Integer, nullable=True)
    is_active:   Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    deleted_at:  Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)  # ✅ nullable
    created_at:  Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:  Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    mess: Mapped['Mess'] = relationship('Mess', back_populates='menu_items')  # ✅ attribute name