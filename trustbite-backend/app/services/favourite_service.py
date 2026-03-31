import uuid
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.favourite import Favourite
from app.models.mess import Mess
from app.schemas.favourite import FavouriteOut
from app.schemas.mess import MessOut


def add_favourite(db: Session, student_id: uuid.UUID, mess_id: uuid.UUID) -> FavouriteOut:
    # Check if already favourited
    if db.query(Favourite).filter(
        Favourite.student_id == student_id, Favourite.mess_id == mess_id
    ).first():
        raise HTTPException(status_code=409, detail='Already in favourites')

    # Validate mess exists and is active
    mess = db.query(Mess).filter(Mess.id == mess_id, Mess.is_active == True).first()
    if not mess:
        raise HTTPException(status_code=404, detail='Mess not found')

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


def remove_favourite(db: Session, student_id: uuid.UUID, mess_id: uuid.UUID):
    fav = db.query(Favourite).filter(
        Favourite.student_id == student_id, Favourite.mess_id == mess_id
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail='Favourite not found')
    db.delete(fav)
    db.commit()


def get_student_favourites(db: Session, student_id: uuid.UUID):
    favs = (
        db.query(Favourite)
        .options(joinedload(Favourite.mess))
        .filter(Favourite.student_id == student_id)
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
        for f in favs
    ]


def is_favourited(db: Session, student_id: uuid.UUID, mess_id: uuid.UUID) -> bool:
    return db.query(Favourite).filter(
        Favourite.student_id == student_id, Favourite.mess_id == mess_id
    ).first() is not None
