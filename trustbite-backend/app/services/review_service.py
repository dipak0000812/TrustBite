"""
Review service — add, fetch, update, and check reviews.
All DB writes for a review + aggregate recalculation happen in a
single atomic transaction (no double-commit race window).
"""

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.mess import Mess
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut


# ── Internal aggregate helper ────────────────────────────────────

def _recalculate_aggregates(db: Session, mess_id: uuid.UUID) -> None:
    """
    Recompute avg_rating, total_reviews, and trust_score for a mess.

    Must be called INSIDE an open transaction — it uses db.flush()
    internally and relies on the caller to commit.
    """
    from app.services.trust_score import calculate_trust_score
    from decimal import Decimal

    agg = db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id),
        ).where(
            Review.mess_id == mess_id,
            Review.is_active == True,  # noqa: E712
        )
    ).one()

    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        return

    avg_rating = round(float(agg[0] or 0), 1)
    total_reviews = int(agg[1] or 0)

    mess.avg_rating = Decimal(str(avg_rating))
    mess.total_reviews = total_reviews
    mess.trust_score = Decimal(
        str(
            calculate_trust_score(
                avg_rating=avg_rating,
                hygiene_score=float(mess.hygiene_score or 0),
                total_reviews=total_reviews,
                is_fssai_verified=bool(mess.is_fssai_verified),
            )
        )
    )
    # Do NOT commit here — the caller owns the transaction boundary.


def _build_review_out(review: Review) -> ReviewOut:
    return ReviewOut(
        id=review.id,
        mess_id=review.mess_id,
        student_id=review.student_id,
        student_name=(
            review.student.full_name if review.student else "Anonymous"
        ),
        rating=review.rating,
        hygiene_rating=review.hygiene_rating,
        comment=review.comment,
        is_active=review.is_active,
        created_at=review.created_at,
    )


# ── Public service functions ──────────────────────────────────────

def add_review(
    db: Session,
    mess_id: uuid.UUID,
    student_id: uuid.UUID,
    data: ReviewCreate,
) -> ReviewOut:
    """
    Add a new review for a mess.

    Raises 404 if the mess is not found/active.
    Raises 409 if the student has already reviewed this mess.

    The review insert and the aggregate recalculation are committed
    together in a single transaction — no double-commit race window.
    """
    mess = (
        db.query(Mess)
        .filter(Mess.id == mess_id, Mess.is_active == True)  # noqa: E712
        .first()
    )
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")

    existing = (
        db.query(Review)
        .filter(
            Review.mess_id == mess_id,
            Review.student_id == student_id,
            Review.is_active == True,  # noqa: E712
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You have already reviewed this mess",
        )

    review = Review(
        mess_id=mess_id,
        student_id=student_id,
        rating=data.rating,
        hygiene_rating=data.hygiene_rating,
        comment=data.comment,
    )
    db.add(review)
    db.flush()  # write review to DB within transaction — gets an id

    # Recalculate aggregates while still inside the SAME transaction
    _recalculate_aggregates(db, mess_id)

    db.commit()          # single commit — review + scores are atomic
    db.refresh(review)   # reload to get server-set timestamps

    return _build_review_out(review)


def get_mess_reviews(
    db: Session,
    mess_id: uuid.UUID,
    skip: int = 0,
    limit: int = 20,
) -> list[ReviewOut]:
    reviews = (
        db.query(Review)
        .options(joinedload(Review.student))
        .filter(
            Review.mess_id == mess_id,
            Review.is_active == True,  # noqa: E712
        )
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_build_review_out(r) for r in reviews]


def has_reviewed(
    db: Session,
    student_id: uuid.UUID,
    mess_id: uuid.UUID,
) -> bool:
    return (
        db.query(Review)
        .filter(
            Review.student_id == student_id,
            Review.mess_id == mess_id,
            Review.is_active == True,  # noqa: E712
        )
        .first()
        is not None
    )


def update_review(
    db: Session,
    mess_id: uuid.UUID,
    student_id: uuid.UUID,
    data: ReviewCreate,
) -> ReviewOut:
    """
    Update an existing review.

    The review update and aggregate recalculation are committed
    together in a single transaction.
    """
    review = (
        db.query(Review)
        .filter(
            Review.mess_id == mess_id,
            Review.student_id == student_id,
            Review.is_active == True,  # noqa: E712
        )
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.rating = data.rating
    review.hygiene_rating = data.hygiene_rating
    review.comment = data.comment

    db.flush()  # stage within transaction
    _recalculate_aggregates(db, mess_id)
    db.commit()
    db.refresh(review)

    return _build_review_out(review)


# ── Public alias used by mess_service.recalculate_aggregates ──────
# (kept for backward compat with admin router import)
def recalculate_aggregates(db: Session, mess_id: uuid.UUID) -> None:
    """Public wrapper: recalculate + commit (used by admin moderation)."""
    _recalculate_aggregates(db, mess_id)
    db.commit()