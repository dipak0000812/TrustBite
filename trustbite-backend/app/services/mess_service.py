# app/services/mess_service.py

import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem
from app.models.mess import Mess
from app.models.review import Review
from app.schemas.menu_item import MenuItemCreate
from app.schemas.mess import MessCreate, MessUpdate
from app.services.trust_score import calculate_trust_score


def create_mess(
    db: Session,
    data: MessCreate,
    owner_id: uuid.UUID,
) -> Mess:
    mess = Mess(
        **data.model_dump(),
        owner_id=owner_id,
        avg_rating=0.0,
        total_reviews=0,
        trust_score=0.0,
        hygiene_score=0.0,
        is_active=True
    )

    db.add(mess)
    db.commit()
    db.refresh(mess)

    return mess


def get_mess_by_id(
    db: Session,
    mess_id: uuid.UUID,
) -> Mess:
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

    return mess


def get_messes(
    db: Session,
    city: str | None = None,
    cuisine_type: str | None = None,
    is_veg: bool | None = None,
    min_trust: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 20,
):
    stmt = select(Mess).where(Mess.is_active == True)

    if city:
        stmt = stmt.where(Mess.city.ilike(f"%{city}%"))

    if cuisine_type:
        stmt = stmt.where(Mess.cuisine_type == cuisine_type)

    if is_veg is not None:
        stmt = stmt.where(Mess.is_veg == is_veg)

    if min_trust is not None:
        stmt = stmt.where(Mess.trust_score >= min_trust)

    if max_price is not None:
        stmt = stmt.where(Mess.price_per_meal <= max_price)

    if search:
        stmt = stmt.where(
            Mess.name.ilike(f"%{search}%")
        )

    stmt = (
        stmt.order_by(Mess.trust_score.desc().nullslast())
        .offset(skip)
        .limit(min(limit, 100))
    )

    return list(db.scalars(stmt).all())


def get_featured_messes(
    db: Session,
    limit: int = 6,
):
    stmt = (
        select(Mess)
        .where(Mess.is_active == True)
        .order_by(Mess.trust_score.desc().nullslast())
        .limit(limit)
    )

    return list(db.scalars(stmt).all())


def update_mess(
    db: Session,
    mess_id: uuid.UUID,
    data: MessUpdate,
    current_user,
):
    mess = get_mess_by_id(db, mess_id)

    if (
        current_user.role != "admin"
        and str(mess.owner_id) != str(current_user.id)
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not own this mess",
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(mess, field, value)

    if (
        "hygiene_score" in update_data
        or "is_fssai_verified" in update_data
    ):
        mess.trust_score = Decimal(
            str(
                calculate_trust_score(
                    avg_rating=float(mess.avg_rating or 0),
                    hygiene_score=float(mess.hygiene_score or 0),
                    total_reviews=mess.total_reviews,
                    is_fssai_verified=mess.is_fssai_verified,
                )
            )
        )

    db.commit()
    db.refresh(mess)

    return mess


def soft_delete_mess(
    db: Session,
    mess_id: uuid.UUID,
    current_user,
):
    mess = get_mess_by_id(db, mess_id)

    if (
        current_user.role != "admin"
        and str(mess.owner_id) != str(current_user.id)
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not own this mess",
        )

    mess.is_active = False

    db.commit()


def get_owner_messes(
    db: Session,
    owner_id: uuid.UUID,
):
    stmt = (
        select(Mess)
        .where(
            Mess.owner_id == owner_id,
            Mess.is_active == True,
        )
        .order_by(Mess.created_at.desc())
    )

    return list(db.scalars(stmt).all())


def get_menu_items(
    db: Session,
    mess_id: uuid.UUID,
    meal_type: str | None = None,
):
    get_mess_by_id(db, mess_id)

    stmt = (
        select(MenuItem)
        .where(
            MenuItem.mess_id == mess_id,
            MenuItem.is_active == True,
        )
        .order_by(MenuItem.created_at.desc())
    )

    if meal_type:
        stmt = stmt.where(MenuItem.meal_type == meal_type)

    return list(db.scalars(stmt).all())


def add_menu_item(
    db: Session,
    mess_id: uuid.UUID,
    data: MenuItemCreate,
    current_user,
):
    mess = get_mess_by_id(db, mess_id)

    if (
        current_user.role != "admin"
        and str(mess.owner_id) != str(current_user.id)
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not own this mess",
        )

    item = MenuItem(
        **data.model_dump(),
        mess_id=mess_id,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def update_menu_item(
    db: Session,
    mess_id: uuid.UUID,
    item_id: uuid.UUID,
    data: MenuItemCreate,
    current_user,
):
    mess = get_mess_by_id(db, mess_id)
    if current_user.role != "admin" and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You do not own this mess")

    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.mess_id == mess_id,
        MenuItem.is_active == True,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


def delete_menu_item(
    db: Session,
    mess_id: uuid.UUID,
    item_id: uuid.UUID,
    current_user,
):
    mess = get_mess_by_id(db, mess_id)
    if current_user.role != "admin" and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You do not own this mess")

    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.mess_id == mess_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    item.is_active = False
    db.commit()


def recalculate_aggregates(
    db: Session,
    mess_id: uuid.UUID,
):
    agg = db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id),
        ).where(
            Review.mess_id == mess_id,
            Review.is_active == True,
        )
    ).one()

    mess = (
        db.query(Mess)
        .filter(Mess.id == mess_id)
        .first()
    )

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
                is_fssai_verified=mess.is_fssai_verified,
            )
        )
    )

    db.commit()