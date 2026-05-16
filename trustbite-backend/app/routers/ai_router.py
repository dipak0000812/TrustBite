from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.mess import MessOut
from app.services.ai_service import get_ai_suggestions
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix='/api/ai', tags=['AI Suggestions'])


@router.get('/suggestions', response_model=list[MessOut])
def suggestions(
    cuisine:   str | None  = Query(default=None),
    max_price: float | None = Query(default=None),
    is_veg:    bool | None  = Query(default=None),
    min_trust: float        = Query(default=6.0),
    limit:     int          = Query(default=3, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    AI section — GET /api/ai/suggestions
    Returns top N messes ranked by proximity, diet, and student preferences.
    """
    return get_ai_suggestions(db, current_user, cuisine, max_price, is_veg, min_trust, top_n=limit)
