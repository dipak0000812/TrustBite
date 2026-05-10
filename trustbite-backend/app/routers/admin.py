import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.mess import Mess
from app.models.review import Review
from app.core.security import require_role
from app.schemas.mess import MessOut, MessUpdate
from app.schemas.user import UserOut
from app.services.mess_service import update_mess, get_mess_by_id
from app.services.trust_score import calculate_trust_score
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter(prefix='/api/admin', tags=['Admin'])


class HygieneUpdate(BaseModel):
    hygiene_score: float
    is_fssai_verified: bool | None = None
    fssai_license: str | None = None


class MessApproval(BaseModel):
    is_active: bool


# ── Dashboard Stats ───────────────────────────────────────────────

@router.get('/stats')
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """Admin dashboard overview stats."""
    return {
        'total_messes':   db.query(func.count(Mess.id)).scalar() or 0,
        'active_messes':  db.query(func.count(Mess.id)).filter(Mess.is_active == True).scalar() or 0,
        'pending_messes': db.query(func.count(Mess.id)).filter(Mess.is_active == False).scalar() or 0,
        'total_users':    db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0,
        'total_students': db.query(func.count(User.id)).filter(User.role == 'student', User.is_active == True).scalar() or 0,
        'total_owners':   db.query(func.count(User.id)).filter(User.role == 'mess_owner', User.is_active == True).scalar() or 0,
        'total_reviews':  db.query(func.count(Review.id)).filter(Review.is_active == True).scalar() or 0,
        'avg_trust_score': round(float(
            db.query(func.avg(Mess.trust_score)).filter(Mess.is_active == True, Mess.trust_score.isnot(None)).scalar() or 0
        ), 1),
    }


# ── Mess Management ───────────────────────────────────────────────

@router.get('/messes', response_model=list[MessOut])
def list_all_messes(
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """All messes (active + inactive) for admin review."""
    return db.query(Mess).order_by(Mess.created_at.desc()).all()


@router.get('/messes/pending', response_model=list[MessOut])
def list_pending_messes(
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """Messes awaiting approval (is_active=False)."""
    return db.query(Mess).filter(Mess.is_active == False).order_by(Mess.created_at.desc()).all()


@router.patch('/messes/{mess_id}/approve', response_model=MessOut)
def approve_mess(
    mess_id: uuid.UUID,
    body: MessApproval,
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """Approve or deactivate a mess listing."""
    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        raise HTTPException(status_code=404, detail='Mess not found')
    mess.is_active = body.is_active
    db.commit()
    db.refresh(mess)
    return mess


@router.patch('/messes/{mess_id}/hygiene', response_model=MessOut)
def set_hygiene_score(
    mess_id: uuid.UUID,
    body: HygieneUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """Admin sets hygiene score, optionally verifies FSSAI, recalculates trust score."""
    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        raise HTTPException(status_code=404, detail='Mess not found')

    mess.hygiene_score = Decimal(str(round(body.hygiene_score, 1)))

    if body.is_fssai_verified is not None:
        mess.is_fssai_verified = body.is_fssai_verified
    if body.fssai_license is not None:
        mess.fssai_license = body.fssai_license

    # Recalculate trust score after any admin update
    mess.trust_score = Decimal(str(calculate_trust_score(
        avg_rating=float(mess.avg_rating or 0),
        hygiene_score=float(mess.hygiene_score or 0),
        total_reviews=int(mess.total_reviews or 0),
        is_fssai_verified=bool(mess.is_fssai_verified),
    )))
    db.commit()
    db.refresh(mess)
    return mess


# ── User Management ───────────────────────────────────────────────

@router.get('/users', response_model=list[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """All active users."""
    return db.query(User).filter(User.is_active == True).order_by(User.created_at.desc()).all()


@router.delete('/users/{user_id}', status_code=204)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role('admin')),
):
    """Soft-delete a user account."""
    if str(user_id) == str(current_admin.id):
        raise HTTPException(status_code=400, detail='Cannot deactivate yourself')
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    user.is_active = False
    db.commit()


@router.patch('/users/{user_id}/reactivate')
def reactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """Reactivate a suspended user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    user.is_active = True
    db.commit()
    return {'message': 'User reactivated'}


@router.patch('/reviews/{review_id}/deactivate')
def deactivate_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role('admin')),
):
    """Admin soft-deletes a review (spam/abuse moderation)."""
    review = db.query(Review).filter(Review.id == review_id, Review.is_active == True).first()
    if not review:
        raise HTTPException(status_code=404, detail='Review not found')
    review.is_active = False
    db.commit()
    # Recalculate mess trust score after review removal
    from app.services.mess_service import recalculate_aggregates
    recalculate_aggregates(db, review.mess_id)
    return {'message': 'Review deactivated'}
