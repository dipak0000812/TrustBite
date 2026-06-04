"""
Admin router — /api/admin/*

All endpoints require the 'admin' role.
"""

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.security import require_role
from app.db.database import get_db
from app.models.mess import Mess
from app.models.review import Review
from app.models.user import User
from app.schemas.mess import MessOut, MessUpdate
from app.schemas.user import UserOut
from app.services.mess_service import get_mess_by_id, recalculate_aggregates
from app.services.trust_score import calculate_trust_score

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ── Request schemas ───────────────────────────────────────────────

class HygieneUpdate(BaseModel):
    hygiene_score: float
    is_fssai_verified: bool | None = None
    fssai_license: str | None = None


class MessApproval(BaseModel):
    is_active: bool


# ── In-process stats cache (5-minute TTL) ─────────────────────────
_STATS_TTL = timedelta(minutes=5)
_stats_cache: dict[str, Any] = {}


def _cache_get(key: str):
    entry = _stats_cache.get(key)
    if entry and datetime.now(timezone.utc) - entry["ts"] < _STATS_TTL:
        return entry["data"]
    return None


def _cache_set(key: str, data: Any) -> None:
    _stats_cache[key] = {"data": data, "ts": datetime.now(timezone.utc)}


# ── Dashboard stats ───────────────────────────────────────────────

@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """
    Admin dashboard overview.  Cached for 5 minutes (HIGH-05).
    Previously made 8 separate DB queries; now cached after the first call.
    """
    cached = _cache_get("admin_stats")
    if cached:
        return cached

    data = {
        "total_messes": db.query(func.count(Mess.id)).scalar() or 0,
        "active_messes": (
            db.query(func.count(Mess.id)).filter(Mess.is_active == True).scalar() or 0  # noqa: E712
        ),
        "pending_messes": (
            db.query(func.count(Mess.id)).filter(Mess.is_active == False).scalar() or 0  # noqa: E712
        ),
        "total_users": (
            db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0  # noqa: E712
        ),
        "total_students": (
            db.query(func.count(User.id))
            .filter(User.role == "student", User.is_active == True)  # noqa: E712
            .scalar() or 0
        ),
        "total_owners": (
            db.query(func.count(User.id))
            .filter(User.role == "mess_owner", User.is_active == True)  # noqa: E712
            .scalar() or 0
        ),
        "total_reviews": (
            db.query(func.count(Review.id)).filter(Review.is_active == True).scalar() or 0  # noqa: E712
        ),
        "avg_trust_score": round(
            float(
                db.query(func.avg(Mess.trust_score))
                .filter(Mess.is_active == True, Mess.trust_score.isnot(None))  # noqa: E712
                .scalar() or 0
            ),
            1,
        ),
    }

    _cache_set("admin_stats", data)
    return data


# ── Mess management ───────────────────────────────────────────────

@router.get("/messes", response_model=list[MessOut])
def list_all_messes(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """All messes (active + inactive) for admin review."""
    return (
        db.query(Mess)
        .options(joinedload(Mess.owner))
        .order_by(Mess.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/messes/pending", response_model=list[MessOut])
def list_pending_messes(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Messes awaiting approval (is_active=False)."""
    return (
        db.query(Mess)
        .options(joinedload(Mess.owner))
        .filter(Mess.is_active == False)  # noqa: E712
        .order_by(Mess.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.patch("/messes/{mess_id}/approve", response_model=MessOut)
def approve_mess(
    mess_id: uuid.UUID,
    body: MessApproval,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Approve or deactivate a mess listing."""
    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    mess.is_active = body.is_active
    db.commit()
    db.refresh(mess)
    _stats_cache.clear()  # invalidate admin stats cache
    return mess


@router.patch("/messes/{mess_id}/hygiene", response_model=MessOut)
def set_hygiene_score(
    mess_id: uuid.UUID,
    body: HygieneUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Admin sets hygiene score, optionally verifies FSSAI, recalculates trust score."""
    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")

    mess.hygiene_score = Decimal(str(round(body.hygiene_score, 1)))

    if body.is_fssai_verified is not None:
        mess.is_fssai_verified = body.is_fssai_verified
    if body.fssai_license is not None:
        mess.fssai_license = body.fssai_license

    mess.trust_score = Decimal(
        str(
            calculate_trust_score(
                avg_rating=float(mess.avg_rating or 0),
                hygiene_score=float(mess.hygiene_score or 0),
                total_reviews=int(mess.total_reviews or 0),
                is_fssai_verified=bool(mess.is_fssai_verified),
            )
        )
    )
    db.commit()
    db.refresh(mess)
    return mess


# ── User management ───────────────────────────────────────────────

@router.get("/users", response_model=list[UserOut])
def list_all_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """All active users."""
    return (
        db.query(User)
        .filter(User.is_active == True)  # noqa: E712
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.delete("/users/{user_id}", status_code=204)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("admin")),
):
    """Soft-delete a user account."""
    if str(user_id) == str(current_admin.id):
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    _stats_cache.clear()


@router.patch("/users/{user_id}/reactivate")
def reactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Reactivate a suspended user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    _stats_cache.clear()
    return {"message": "User reactivated"}


# ── Review moderation ─────────────────────────────────────────────

@router.patch("/reviews/{review_id}/deactivate")
def deactivate_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Admin soft-deletes a review (spam/abuse moderation)."""
    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.is_active == True)  # noqa: E712
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_active = False
    db.commit()
    recalculate_aggregates(db, review.mess_id)
    _stats_cache.clear()
    return {"message": "Review deactivated"}
