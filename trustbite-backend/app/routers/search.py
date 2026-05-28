from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.mess import MessOut
from app.services.mess_service import get_messes

router = APIRouter(prefix='/api/search', tags=['Search'])


@router.get('/', response_model=list[MessOut])
def search(
    q:            str | None   = Query(default=None, max_length=100),
    city:         str | None   = Query(default=None, max_length=100),
    cuisine_type: str | None   = Query(default=None, max_length=50),
    is_veg:       bool | None  = None,
    max_price:    float | None = None,
    min_trust:    float | None = None,
    skip:         int          = Query(default=0, ge=0),
    limit:        int          = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Global search — GET /api/search/?q=X"""
    return get_messes(db, city, cuisine_type, is_veg, min_trust, max_price, search=q, skip=skip, limit=limit)
