"""
Favourite service — add, remove, list, and check a student's favourited messes.
"""

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.favourite import Favourite
from app.models.mess import Mess
from app.schemas.favourite import FavouriteOut
from app.schemas.mess import MessOut


def add_favourite(
    db: Session,
    student_id: uuid.UUID,
    mess_id: uuid.UUID,
) -> FavouriteOut:
    """
    Add a mess to the student's favourites.

    If a soft-deleted favourite record already exists for this (student, mess)
    pair, reactivate it rather than creating a duplicate row (which would
    violate the unique constraint).
    """
    existing = (
        db.query(Favourite)
        .filter(Favourite.student_id == student_id, Favourite.mess_id == mess_id)
        .first()
    )

    if existing and existing.is_active:
        raise HTTPException(status_code=409, detail="Already in favourites")

    if existing and not existing.is_active:
        # Reactivate soft-deleted record (MED-10 fix: use timezone-aware datetime)
        existing.is_active = True
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)

        mess = db.query(Mess).filter(Mess.id == mess_id, Mess.is_active == True).first()  # noqa: E712
        if not mess:
            raise HTTPException(status_code=404, detail="Mess not found")

        return FavouriteOut(
            id=existing.id,
            student_id=existing.student_id,
            mess_id=existing.mess_id,
            created_at=existing.created_at,
            mess=MessOut.model_validate(mess),
        )

    # No existing record — create a new favourite
    mess = (
        db.query(Mess)
        .filter(Mess.id == mess_id, Mess.is_active == True)  # noqa: E712
        .first()
    )
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")

    fav = Favourite(student_id=student_id, mess_id=mess_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)

    return FavouriteOut(
        id=fav.id,
        student_id=fav.student_id,
        mess_id=fav.mess_id,
        created_at=fav.created_at,
        mess=MessOut.model_validate(mess),
    )


def remove_favourite(
    db: Session,
    student_id: uuid.UUID,
    mess_id: uuid.UUID,
) -> None:
    """Soft-delete a favourite (set is_active=False)."""
    fav = (
        db.query(Favourite)
        .filter(
            Favourite.student_id == student_id,
            Favourite.mess_id == mess_id,
            Favourite.is_active == True,  # noqa: E712
        )
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Favourite not found")

    fav.is_active = False
    fav.updated_at = datetime.now(timezone.utc)   # MED-10: was datetime.utcnow()
    db.commit()


def get_student_favourites(
    db: Session,
    student_id: uuid.UUID,
) -> list[FavouriteOut]:
    """Return all active favourites for a student, newest first."""
    favourites = (
        db.query(Favourite)
        .options(joinedload(Favourite.mess).joinedload(Mess.owner))
        .filter(Favourite.student_id == student_id, Favourite.is_active == True)  # noqa: E712
        .order_by(Favourite.created_at.desc())
        .all()
    )

    return [
        FavouriteOut(
            id=f.id,
            student_id=f.student_id,
            mess_id=f.mess_id,
            created_at=f.created_at,
            mess=MessOut.model_validate(f.mess) if f.mess else None,
        )
        for f in favourites
    ]


def is_favourited(
    db: Session,
    student_id: uuid.UUID,
    mess_id: uuid.UUID,
) -> bool:
    """Return True if the student has an active favourite for this mess."""
    return (
        db.query(Favourite)
        .filter(
            Favourite.student_id == student_id,
            Favourite.mess_id == mess_id,
            Favourite.is_active == True,  # noqa: E712
        )
        .first()
        is not None
    )