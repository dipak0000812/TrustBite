import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator


class MessCreate(BaseModel):
    name:             str
    description:      str | None = None
    address:          str
    city:             str
    pincode:          str
    latitude:         float | None = None
    longitude:        float | None = None
    cuisine_type:     str | None = None
    price_per_meal:   float
    is_veg:           bool = True
    serves_breakfast: bool = False
    serves_lunch:     bool = True
    serves_dinner:    bool = True
    image_url:        str | None = None
    fssai_license:    str | None = None
    tags:             str | None = None
    gallery_images:   str | None = None
    owner_phone:      str | None = None
    breakfast_time:   str | None = None
    lunch_time:       str | None = None
    dinner_time:      str | None = None
    monthly_price:    float | None = None
    weekly_price:     float | None = None
    weekly_menu:      dict | None = None
    # NOTE: is_fssai_verified removed from MessCreate too.
    # Owner cannot self-declare FSSAI on registration.
    # Admin sets this after verification. Same reason as MessUpdate.


class MessUpdate(BaseModel):
    name:              str | None = None
    description:       str | None = None
    address:           str | None = None
    price_per_meal:    float | None = None
    is_veg:            bool | None = None
    serves_breakfast:  bool | None = None
    serves_lunch:      bool | None = None
    serves_dinner:     bool | None = None
    image_url:         str | None = None
    tags:              str | None = None
    gallery_images:    str | None = None
    owner_phone:       str | None = None
    breakfast_time:    str | None = None
    lunch_time:        str | None = None
    dinner_time:       str | None = None
    monthly_price:     float | None = None
    weekly_price:      float | None = None
    weekly_menu:       dict | None = None
    # hygiene_score    → admin only, in AdminMessUpdate
    # is_fssai_verified → admin only, in AdminMessUpdate
    # trust_score      → system computed, never in any input schema
    # avg_rating        → system computed, never in any input schema


class AdminMessUpdate(BaseModel):
    """
    Fields only admins can modify on a mess.
    This schema must ONLY be used on admin-protected endpoints.
    Never reuse this on owner-facing routes.
    """
    hygiene_score:     float | None = None
    is_fssai_verified: bool | None = None
    is_active:         bool | None = None

    @field_validator('hygiene_score')
    @classmethod
    def validate_hygiene_score(cls, v):
        if v is not None and not (0.0 <= v <= 10.0):
            raise ValueError('Hygiene score must be between 0.0 and 10.0')
        return v


class MessOut(BaseModel):
    id:               uuid.UUID
    owner_id:         uuid.UUID
    name:             str
    description:      str | None = None
    address:          str
    city:             str
    pincode:          str
    latitude:         Decimal | None = None
    longitude:        Decimal | None = None
    cuisine_type:     str | None = None
    price_per_meal:   Decimal
    is_veg:           bool
    serves_breakfast: bool
    serves_lunch:     bool
    serves_dinner:    bool
    hygiene_score:    Decimal | None = None
    trust_score:      Decimal | None = None
    avg_rating:       Decimal
    total_reviews:    int
    image_url:        str | None = None
    is_fssai_verified: bool
    fssai_license:    str | None = None
    tags:             str | None = None
    gallery_images:   str | None = None
    owner_name:       str | None = None
    owner_phone:      str | None = None
    breakfast_time:   str | None = None
    lunch_time:       str | None = None
    dinner_time:      str | None = None
    monthly_price:    Decimal | None = None
    weekly_price:     Decimal | None = None
    weekly_menu:      dict | None = None
    is_active:        bool
    created_at:       datetime
    model_config = {'from_attributes': True}