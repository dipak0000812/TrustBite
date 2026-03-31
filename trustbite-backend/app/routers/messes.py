import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.menu_item import MenuItem
from app.schemas.mess import MessCreate, MessUpdate, MessOut
from app.schemas.menu_item import MenuItemCreate, MenuItemOut
from app.schemas.review import ReviewCreate, ReviewOut
from app.core.security import get_current_user, require_role
from app.services import mess_service, review_service

router = APIRouter(prefix='/api/messes', tags=['Messes'])


# ── Public endpoints ──────────────────────────────────────────────

@router.get('/featured', response_model=list[MessOut])
def featured(limit: int = 6, db: Session = Depends(get_db)):
    """Landing page — GET /api/messes/featured"""
    return mess_service.get_featured_messes(db, limit)


@router.get('/owner/mine', response_model=list[MessOut])
def owner_messes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('mess_owner')),
):
    """Owner dashboard — GET /api/messes/owner/mine"""
    return mess_service.get_owner_messes(db, current_user.id)


@router.get('/', response_model=list[MessOut])
def list_messes(
    city:         str | None   = None,
    cuisine_type: str | None   = None,
    is_veg:       bool | None  = None,
    min_trust:    float | None = None,
    max_price:    float | None = None,
    search:       str | None   = None,
    skip:  int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Discovery page — GET /api/messes/ with all filter params"""
    return mess_service.get_messes(db, city, cuisine_type, is_veg, min_trust, max_price, search, skip, limit)


@router.get('/{mess_id}', response_model=MessOut)
def get_mess(mess_id: uuid.UUID, db: Session = Depends(get_db)):
    """Mess detail page — GET /api/messes/:id"""
    return mess_service.get_mess_by_id(db, mess_id)


# ── Menu endpoints ────────────────────────────────────────────────

@router.get('/{mess_id}/menu', response_model=list[MenuItemOut])
def get_menu(mess_id: uuid.UUID, meal_type: str | None = None, db: Session = Depends(get_db)):
    """Mess detail page menu tabs — GET /api/messes/:id/menu"""
    q = db.query(MenuItem).filter(MenuItem.mess_id == mess_id, MenuItem.is_active == True)
    if meal_type:
        q = q.filter(MenuItem.meal_type == meal_type)
    return q.order_by(MenuItem.meal_type, MenuItem.name).all()


@router.post('/{mess_id}/menu', response_model=MenuItemOut, status_code=201)
def add_menu_item(
    mess_id: uuid.UUID,
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('mess_owner', 'admin')),
):
    """Add menu item — POST /api/messes/:id/menu"""
    mess = mess_service.get_mess_by_id(db, mess_id)
    # Ownership check for non-admin
    if current_user.role != 'admin' and str(mess.owner_id) != str(current_user.id):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail='You do not own this mess')
    item = MenuItem(**data.model_dump(), mess_id=mess.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# ── Review endpoints ──────────────────────────────────────────────

@router.get('/{mess_id}/reviews', response_model=list[ReviewOut])
def get_reviews(
    mess_id: uuid.UUID,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Mess detail page reviews — GET /api/messes/:id/reviews"""
    return review_service.get_mess_reviews(db, mess_id, skip, limit)


@router.post('/{mess_id}/reviews', response_model=ReviewOut, status_code=201)
def add_review(
    mess_id: uuid.UUID,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('student')),
):
    """
    Workflow: Submit Review → POST /api/messes/:id/reviews
    After success: review appended, mess avg_rating updated, trust_score recalculated.
    """
    return review_service.add_review(db, mess_id, current_user.id, data)


@router.get('/{mess_id}/has-reviewed')
def has_reviewed(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Called on mess detail mount to show/hide review form."""
    return {'has_reviewed': review_service.has_reviewed(db, current_user.id, mess_id)}


# ── Owner / Admin CRUD ───────────────────────────────────────────

@router.post('/', response_model=MessOut, status_code=201)
def create_mess(
    data: MessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('mess_owner', 'admin')),
):
    """Create mess — POST /api/messes/"""
    return mess_service.create_mess(db, data, current_user.id)


@router.put('/{mess_id}', response_model=MessOut)
def update_mess(
    mess_id: uuid.UUID,
    data: MessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('mess_owner', 'admin')),
):
    """Update mess — PUT /api/messes/:id"""
    return mess_service.update_mess(db, mess_id, data, current_user)


@router.delete('/{mess_id}', status_code=204)
def delete_mess(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('mess_owner', 'admin')),
):
    """Soft delete mess — DELETE /api/messes/:id"""
    mess_service.soft_delete_mess(db, mess_id, current_user)
