from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Integer,
    Numeric, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from sqlalchemy_json import MutableJson

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.review import Review
    from app.models.favourite import Favourite
    from app.models.menu_item import MenuItem


class Mess(Base):
    __tablename__ = "messes"

    # ── Primary key ───────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Ownership ─────────────────────────────────────────────────
    owner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # ── Core listing fields ───────────────────────────────────────
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    pincode: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    cuisine_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # ── Pricing ───────────────────────────────────────────────────
    price_per_meal: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    monthly_price: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    weekly_price: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)

    # ── Meal service flags ────────────────────────────────────────
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    serves_breakfast: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    serves_lunch: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    serves_dinner: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Meal timing (human-readable strings, e.g. "8am – 10am") ──
    breakfast_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    lunch_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dinner_time: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # ── Trust & quality metrics (computed fields) ─────────────────
    hygiene_score: Mapped[Decimal | None] = mapped_column(Numeric(3, 1), nullable=True)
    trust_score: Mapped[Decimal | None] = mapped_column(
        Numeric(3, 1), nullable=True, index=True
    )
    avg_rating: Mapped[Decimal] = mapped_column(
        Numeric(2, 1), nullable=False, default=Decimal("0.0")
    )
    total_reviews: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # ── Media ─────────────────────────────────────────────────────
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    gallery_images: Mapped[str | None] = mapped_column(String, nullable=True)

    # ── Compliance ────────────────────────────────────────────────
    is_fssai_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fssai_license: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # ── Contact & discovery ───────────────────────────────────────
    owner_phone: Mapped[str | None] = mapped_column(String(15), nullable=True)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── Weekly menu (structured JSON) ─────────────────────────────
    weekly_menu: Mapped[dict | None] = mapped_column(MutableJson, nullable=True)

    # ── Lifecycle ─────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, index=True
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Audit timestamps ──────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────
    owner: Mapped["User"] = relationship("User", back_populates="messes")
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="mess", lazy="select"
    )
    favourites: Mapped[list["Favourite"]] = relationship(
        "Favourite", back_populates="mess", lazy="select"
    )
    menu_items: Mapped[list["MenuItem"]] = relationship(
        "MenuItem", back_populates="mess", lazy="select"
    )