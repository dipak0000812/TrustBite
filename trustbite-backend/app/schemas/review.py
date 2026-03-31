import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    rating:         int
    hygiene_rating: int | None = None
    comment:        str | None = None

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if v not in range(1, 6):
            raise ValueError('Rating must be 1–5')
        return v


class ReviewOut(BaseModel):
    id:             uuid.UUID
    mess_id:        uuid.UUID
    student_id:     uuid.UUID
    student_name:   str | None = None
    rating:         int
    hygiene_rating: int | None = None
    comment:        str | None = None
    is_active:      bool
    created_at:     datetime
    model_config = {'from_attributes': True}
