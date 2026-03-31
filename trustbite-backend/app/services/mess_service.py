import uuid
from decimal import Decimal
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.mess import Mess
from app.models.review import Review
from app.schemas.mess import MessCreate, MessUpdate
from app.services.trust_score import calculate_trust_score


def create_mess(db: Session, data: MessCreate, owner_id: uuid.UUID) -> Mess:
    mess = Mess(**data.model_dump(), owner_id=owner_id)
    db.add(mess)
    db.commit()
    db.refresh(mess)
    return mess


def get_mess_by_id(db: Session, mess_id: uuid.UUID) -> Mess:
    mess = db.query(Mess).filter(Mess.id == mess_id, Mess.is_active == True).first()
    if not mess:
        raise HTTPException(status_code=404, detail='Mess not found')
    return mess


def get_messes(db, city=None, cuisine_type=None, is_veg=None,
               min_trust=None, max_price=None, search=None, skip=0, limit=20):
    stmt = select(Mess).where(Mess.is_active == True)
    if city:
        stmt = stmt.where(Mess.city.ilike(f'%{city}%'))
    if cuisine_type:
        stmt = stmt.where(Mess.cuisine_type == cuisine_type)
    if is_veg is not None:
        stmt = stmt.where(Mess.is_veg == is_veg)
    if min_trust:
        stmt = stmt.where(Mess.trust_score >= min_trust)
    if max_price:
        stmt = stmt.where(Mess.price_per_meal <= max_price)
    if search:
        stmt = stmt.where(Mess.name.ilike(f'%{search}%'))
    stmt = stmt.order_by(Mess.trust_score.desc().nullslast()).offset(skip).limit(min(limit, 100))
    return list(db.scalars(stmt).all())


def get_featured_messes(db: Session, limit: int = 6):
    return list(db.scalars(
        select(Mess)
        .where(Mess.is_active == True)
        .order_by(Mess.trust_score.desc().nullslast())
        .limit(limit)
    ).all())


def update_mess(db, mess_id, data: MessUpdate, current_user):
    mess = get_mess_by_id(db, mess_id)
    # Admin can update any mess; owners can only update their own
    if current_user.role != 'admin' and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail='You do not own this mess')
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(mess, field, value)
    # If hygiene_score was updated, recalculate trust_score
    if data.hygiene_score is not None:
        mess.trust_score = Decimal(str(calculate_trust_score(
            avg_rating=float(mess.avg_rating or 0),
            hygiene_score=float(mess.hygiene_score or 0),
            total_reviews=mess.total_reviews,
            is_fssai_verified=mess.is_fssai_verified,
        )))
    # If is_fssai_verified was updated, recalculate trust_score
    if data.is_fssai_verified is not None:
        mess.trust_score = Decimal(str(calculate_trust_score(
            avg_rating=float(mess.avg_rating or 0),
            hygiene_score=float(mess.hygiene_score or 0),
            total_reviews=mess.total_reviews,
            is_fssai_verified=mess.is_fssai_verified,
        )))
    db.commit()
    db.refresh(mess)
    return mess


def soft_delete_mess(db, mess_id, current_user):
    mess = get_mess_by_id(db, mess_id)
    # Admin can delete any mess; owners can only delete their own
    if current_user.role != 'admin' and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail='You do not own this mess')
    mess.is_active = False
    db.commit()


def get_owner_messes(db: Session, owner_id: uuid.UUID):
    return list(db.scalars(
        select(Mess)
        .where(Mess.owner_id == owner_id, Mess.is_active == True)
        .order_by(Mess.created_at.desc())
    ).all())


def recalculate_aggregates(db: Session, mess_id: uuid.UUID):
    """Called after every review write. Updates avg_rating, total_reviews, trust_score."""
    agg = db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.mess_id == mess_id, Review.is_active == True)
    ).one()
    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        return
    mess.avg_rating = Decimal(str(round(float(agg[0] or 0), 1)))
    mess.total_reviews = int(agg[1])
    mess.trust_score = Decimal(str(calculate_trust_score(
        avg_rating=float(mess.avg_rating),
        hygiene_score=float(mess.hygiene_score or 0),
        total_reviews=mess.total_reviews,
        is_fssai_verified=mess.is_fssai_verified,
    )))
    db.commit()
