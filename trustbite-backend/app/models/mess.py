from __future__ import annotations
import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Boolean, DateTime, Numeric, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.menu_item import MenuItem
    from app.models.review import Review
    from app.models.favourite import Favourite

class Mess(Base):
    __tablename__ = 'messes'

    id:               Mapped[uuid.UUID]    = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id:         Mapped[uuid.UUID]    = mapped_column(Uuid(as_uuid=True), ForeignKey('users.id', ondelete='RESTRICT'), nullable=False)
    name:             Mapped[str]          = mapped_column(String(200), nullable=False)
    description:      Mapped[str | None]   = mapped_column(String)
    address:          Mapped[str]          = mapped_column(String, nullable=False)
    city:             Mapped[str]          = mapped_column(String(100), nullable=False)
    pincode:          Mapped[str]          = mapped_column(String(10), nullable=False)
    latitude:         Mapped[Decimal|None] = mapped_column(Numeric(9,6))
    longitude:        Mapped[Decimal|None] = mapped_column(Numeric(9,6))
    cuisine_type:     Mapped[str | None]   = mapped_column(String(50))
    price_per_meal:   Mapped[Decimal]      = mapped_column(Numeric(8,2), nullable=False)
    is_veg:           Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    serves_breakfast: Mapped[bool]         = mapped_column(Boolean, default=False, nullable=False)
    serves_lunch:     Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    serves_dinner:    Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    hygiene_score:    Mapped[Decimal|None] = mapped_column(Numeric(3,1))
    trust_score:      Mapped[Decimal|None] = mapped_column(Numeric(3,1))
    avg_rating:       Mapped[Decimal]      = mapped_column(Numeric(2,1), default=0.0, nullable=False)
    total_reviews:    Mapped[int]          = mapped_column(Integer, default=0, nullable=False)
    image_url:        Mapped[str | None]   = mapped_column(String)
    is_fssai_verified:Mapped[bool]         = mapped_column(Boolean, default=False, nullable=False)
    fssai_license:    Mapped[str | None]   = mapped_column(String(50))
    tags:             Mapped[str | None]   = mapped_column(String)
    
    # New UX Enhancement Fields (Nullable & Backward Compatible)
    gallery_images:   Mapped[str | None]   = mapped_column(String)
    owner_phone:      Mapped[str | None]   = mapped_column(String(15))
    breakfast_time:   Mapped[str | None]   = mapped_column(String(50))
    lunch_time:       Mapped[str | None]   = mapped_column(String(50))
    dinner_time:      Mapped[str | None]   = mapped_column(String(50))
    monthly_price:    Mapped[Decimal|None] = mapped_column(Numeric(8,2))
    weekly_price:     Mapped[Decimal|None] = mapped_column(Numeric(8,2))
    is_active:        Mapped[bool]         = mapped_column(Boolean, default=True, nullable=False)
    created_at:       Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:       Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner:       Mapped['User']            = relationship('User', back_populates='messes')
    menu_items:  Mapped[list['MenuItem']]  = relationship('MenuItem', back_populates='mess', cascade='all, delete-orphan')
    reviews:     Mapped[list['Review']]    = relationship('Review', back_populates='mess', cascade='all, delete-orphan')
    favourites:  Mapped[list['Favourite']] = relationship('Favourite', back_populates='mess', cascade='all, delete-orphan')

    @property
    def owner_name(self) -> str | None:
        if self.owner:
            return self.owner.full_name
        return None
