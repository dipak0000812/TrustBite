import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class MenuItemCreate(BaseModel):
    name:        str
    description: str | None = None
    meal_type:   str
    day_of_week: int | None = None
    price:       float | None = None
    is_veg:      bool = True
    calories:    int | None = None


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
