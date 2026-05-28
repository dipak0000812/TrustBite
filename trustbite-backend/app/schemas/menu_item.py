import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator


class MenuItemCreate(BaseModel):
    name:        str
    description: str | None = None
    meal_type:   str
    day_of_week: int | None = None
    price:       float | None = None
    is_veg:      bool = True
    calories:    int | None = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Name cannot be blank')
        if len(v) > 200:
            raise ValueError('Name must be 200 characters or fewer')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Description must be 500 characters or fewer')
        return v

    @field_validator('meal_type')
    @classmethod
    def validate_meal_type(cls, v):
        v = v.strip().lower()
        allowed = {'breakfast', 'lunch', 'dinner', 'snacks'}
        if v not in allowed:
            raise ValueError(f"Meal type must be one of: {', '.join(allowed)}")
        return v

    @field_validator('day_of_week')
    @classmethod
    def validate_day_of_week(cls, v):
        if v is not None and v not in range(7):
            raise ValueError('Day of week must be between 0 (Monday) and 6 (Sunday)')
        return v

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        if v is not None and v < 0:
            raise ValueError('Price cannot be negative')
        return v

    @field_validator('calories')
    @classmethod
    def validate_calories(cls, v):
        if v is not None and v < 0:
            raise ValueError('Calories cannot be negative')
        return v


class MenuItemOut(BaseModel):
    id:          uuid.UUID
    mess_id:     uuid.UUID
    name:        str
    description: str | None = None
    meal_type:   str
    day_of_week: int | None = None
    price:       Decimal | None = None
    is_veg:      bool
    calories:    int | None = None
    is_active:   bool
    created_at:  datetime
    model_config = {'from_attributes': True}
