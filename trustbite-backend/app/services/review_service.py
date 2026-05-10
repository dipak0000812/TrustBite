# app/services/review_service.py

import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.mess import Mess
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut
from app.services.mess_service import recalculate_aggregates


def add_review(
    db: Session,
    mess_id: uuid.UUID,
    student_id: uuid.UUID,
    data: ReviewCreate,
) -> ReviewOut:
    mess = (
        db.query(Mess)
        .filter(
            Mess.id == mess_id,
            Mess.is_active == True,
        )
        .first()
    )

    if not mess:
        raise HTTPException(
            status_code=404,
            detail="Mess not found",
        )

    existing = (
        db.query(Review)
        .filter(
            Review.mess_id == mess_id,
            Review.student_id == student_id,
            Review.is_active == True,
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
    db.commit()

    recalculate_aggregates(db, mess_id)

    db.refresh(review)

    return ReviewOut(
        id=review.id,
        mess_id=review.mess_id,
        student_id=review.student_id,
        student_name=(
            review.student.full_name
            if review.student
            else "Anonymous"
        ),
        rating=review.rating,
        hygiene_rating=review.hygiene_rating,
        comment=review.comment,
        is_active=review.is_active,
        created_at=review.created_at,
    )


def get_mess_reviews(
    db: Session,
    mess_id: uuid.UUID,
    skip: int = 0,
    limit: int = 20,
):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.student))
        .filter(
            Review.mess_id == mess_id,
            Review.is_active == True,
        )
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        ReviewOut(
            id=r.id,
            mess_id=r.mess_id,
            student_id=r.student_id,
            student_name=(
                r.student.full_name
                if r.student
                else "Anonymous"
            ),
            rating=r.rating,
            hygiene_rating=r.hygiene_rating,
            comment=r.comment,
            is_active=r.is_active,
            created_at=r.created_at,
        )
        for r in reviews
    ]


def has_reviewed(
    db: Session,
    student_id: uuid.UUID,
    mess_id: uuid.UUID,
) -> bool:
    existing = (
        db.query(Review)
        .filter(
            Review.student_id == student_id,
            Review.mess_id == mess_id,
            Review.is_active == True,
        )
        .first()
    )

    return existing is not None