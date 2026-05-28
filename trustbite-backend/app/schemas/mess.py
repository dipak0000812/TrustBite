import re
import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator


# ─────────────────────────────────────────────────────────────
# Shared validators (used in both MessCreate and MessUpdate)
# ─────────────────────────────────────────────────────────────

def _validate_name(v):
    if v is not None:
        v = v.strip()
        if not v:
            raise ValueError('Name cannot be blank')
        if len(v) > 200:
            raise ValueError('Name must be 200 characters or fewer')
    return v

def _validate_price(v):
    if v is not None and v < 0:
        raise ValueError('Price cannot be negative')
    return v

def _validate_phone(v):
    if v is not None:
        v = v.strip()
        if not re.match(r'^\+?[\d\s\-]{7,15}$', v):
            raise ValueError('Phone number format is invalid')
    return v


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

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Mess name cannot be blank')
        if len(v) > 200:
            raise ValueError('Mess name must be 200 characters or fewer')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 1000:
                raise ValueError('Description must be 1000 characters or fewer')
        return v

    @field_validator('address')
    @classmethod
    def validate_address(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Address cannot be blank')
        if len(v) > 300:
            raise ValueError('Address must be 300 characters or fewer')
        return v

    @field_validator('city')
    @classmethod
    def validate_city(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('City cannot be blank')
        if len(v) > 100:
            raise ValueError('City must be 100 characters or fewer')
        return v

    @field_validator('pincode')
    @classmethod
    def validate_pincode(cls, v):
        v = v.strip()
        if not re.match(r'^\d{6}$', v):
            raise ValueError('Pincode must be exactly 6 digits')
        return v

    @field_validator('price_per_meal', 'monthly_price', 'weekly_price', mode='before')
    @classmethod
    def validate_prices(cls, v):
        return _validate_price(v)

    @field_validator('latitude')
    @classmethod
    def validate_latitude(cls, v):
        if v is not None and not (-90.0 <= v <= 90.0):
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @field_validator('longitude')
    @classmethod
    def validate_longitude(cls, v):
        if v is not None and not (-180.0 <= v <= 180.0):
            raise ValueError('Longitude must be between -180 and 180')
        return v

    @field_validator('owner_phone')
    @classmethod
    def validate_owner_phone(cls, v):
        return _validate_phone(v)

    @field_validator('cuisine_type')
    @classmethod
    def validate_cuisine_type(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 50:
                raise ValueError('Cuisine type must be 50 characters or fewer')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Tags must be 500 characters or fewer')
        return v

    @field_validator('fssai_license')
    @classmethod
    def validate_fssai_license(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 50:
                raise ValueError('FSSAI license must be 50 characters or fewer')
        return v

    @field_validator('image_url', 'gallery_images')
    @classmethod
    def validate_urls(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 1000:
                raise ValueError('URL field must be 1000 characters or fewer')
        return v

    @field_validator('breakfast_time', 'lunch_time', 'dinner_time')
    @classmethod
    def validate_times(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 50:
                raise ValueError('Time field must be 50 characters or fewer')
        return v


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

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Mess name cannot be blank')
            if len(v) > 200:
                raise ValueError('Mess name must be 200 characters or fewer')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 1000:
                raise ValueError('Description must be 1000 characters or fewer')
        return v

    @field_validator('address')
    @classmethod
    def validate_address(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Address cannot be blank')
            if len(v) > 300:
                raise ValueError('Address must be 300 characters or fewer')
        return v

    @field_validator('price_per_meal', 'monthly_price', 'weekly_price', mode='before')
    @classmethod
    def validate_prices(cls, v):
        return _validate_price(v)

    @field_validator('owner_phone')
    @classmethod
    def validate_owner_phone(cls, v):
        return _validate_phone(v)

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Tags must be 500 characters or fewer')
        return v

    @field_validator('cuisine_type')
    @classmethod
    def validate_cuisine_type(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 50:
                raise ValueError('Cuisine type must be 50 characters or fewer')
        return v

    @field_validator('image_url', 'gallery_images')
    @classmethod
    def validate_urls(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 1000:
                raise ValueError('URL field must be 1000 characters or fewer')
        return v

    @field_validator('breakfast_time', 'lunch_time', 'dinner_time')
    @classmethod
    def validate_times(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 50:
                raise ValueError('Time field must be 50 characters or fewer')
        return v


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