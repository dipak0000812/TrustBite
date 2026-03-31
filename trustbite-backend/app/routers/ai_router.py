from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.mess import MessOut
from app.services.ai_service import get_ai_suggestions

router = APIRouter(prefix='/api/ai', tags=['AI Suggestions'])


@router.get('/suggestions', response_model=list[MessOut])
def suggestions(
    cuisine:   str | None  = Query(default=None),
    max_price: float | None = Query(default=None),
    is_veg:    bool | None  = Query(default=None),
    min_trust: float        = Query(default=6.0),
    limit:     int          = Query(default=3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    """
    AI section — GET /api/ai/suggestions
    Returns top N messes ranked by cosine similarity to preference vector.
    """
    return get_ai_suggestions(db, cuisine, max_price, is_veg, min_trust, top_n=limit)
