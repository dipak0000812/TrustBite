import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


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
    is_fssai_verified: bool = False
    fssai_license:    str | None = None
    tags:             str | None = None
    gallery_images:   str | None = None
    owner_phone:      str | None = None
    breakfast_time:   str | None = None
    lunch_time:       str | None = None
    dinner_time:      str | None = None
    monthly_price:    float | None = None
    weekly_price:     float | None = None


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
    hygiene_score:     float | None = None
    is_fssai_verified: bool | None = None
    tags:              str | None = None
    gallery_images:    str | None = None
    owner_phone:       str | None = None
    breakfast_time:    str | None = None
    lunch_time:        str | None = None
    dinner_time:       str | None = None
    monthly_price:     float | None = None
    weekly_price:      float | None = None


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
    is_active:        bool
    created_at:       datetime
    model_config = {'from_attributes': True}
