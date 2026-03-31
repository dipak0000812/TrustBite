import uuid
from datetime import datetime
from pydantic import BaseModel
from app.schemas.mess import MessOut


class FavouriteOut(BaseModel):
    id:         uuid.UUID
    student_id: uuid.UUID
    mess_id:    uuid.UUID
    created_at: datetime
    mess:       MessOut | None = None
    model_config = {'from_attributes': True}
