"""
Mess service — business logic for mess CRUD, menu management, and aggregate recalculation.

All HTTPExceptions are raised here for now (see MED-01 in audit — domain exceptions
are the target state; this is a safe interim that preserves existing API behaviour).
"""

import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import func, select, or_
from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem
from app.models.mess import Mess
from app.models.review import Review
from app.schemas.menu_item import MenuItemCreate
from app.schemas.mess import MessCreate, MessUpdate
from app.services.trust_score import calculate_trust_score


# ── Mess CRUD ─────────────────────────────────────────────────────

def create_mess(
    db: Session,
    data: MessCreate,
    owner_id: uuid.UUID,
    *,
    mark_owner_onboarded: bool = False,
) -> Mess:
    """
    Create a new mess listing.

    If `mark_owner_onboarded=True` the owner's is_onboarding_complete flag
    is set within the SAME transaction (ARCH-01 fix — no second commit in router).
    """
    from app.models.user import User

    mess = Mess(
        **data.model_dump(),
        owner_id=owner_id,
        avg_rating=Decimal("0.0"),
        total_reviews=0,
        trust_score=Decimal("0.0"),
        hygiene_score=Decimal("0.0"),
        is_active=True,
    )
    db.add(mess)

    if mark_owner_onboarded:
        owner = db.query(User).filter(User.id == owner_id).first()
        if owner and not owner.is_onboarding_complete:
            owner.is_onboarding_complete = True

    db.commit()
    db.refresh(mess)
    return mess


def get_mess_by_id(
    db: Session,
    mess_id: uuid.UUID,
) -> Mess:
    mess = (
        db.query(Mess)
        .filter(Mess.id == mess_id, Mess.is_active == True)  # noqa: E712
        .first()
    )
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    return mess


def get_messes(
    db: Session,
    city: str | None = None,
    cuisine_type: str | None = None,
    is_veg: bool | None = None,
    min_trust: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Mess]:
    stmt = select(Mess).where(Mess.is_active == True)  # noqa: E712

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
            or_(
                Mess.name.ilike(f"%{search}%"),
                Mess.tags.ilike(f"%{search}%"),
                Mess.cuisine_type.ilike(f"%{search}%"),
            )
        )

    if latitude is not None and longitude is not None:
        stmt = stmt.order_by(
            (func.power(Mess.latitude - latitude, 2) + func.power(Mess.longitude - longitude, 2)).asc().nullslast()
        )
    else:
        stmt = stmt.order_by(Mess.trust_score.desc().nullslast())

    stmt = (
        stmt.offset(skip)
        .limit(min(limit, 100))
    )
    return list(db.scalars(stmt).all())


def get_featured_messes(db: Session, limit: int = 6) -> list[Mess]:
    stmt = (
        select(Mess)
        .where(Mess.is_active == True)  # noqa: E712
        .order_by(Mess.trust_score.desc().nullslast())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_owner_messes(db: Session, owner_id: uuid.UUID) -> list[Mess]:
    stmt = (
        select(Mess)
        .where(Mess.owner_id == owner_id, Mess.is_active == True)  # noqa: E712
        .order_by(Mess.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def update_mess(
    db: Session,
    mess_id: uuid.UUID,
    data: MessUpdate,
    current_user,
) -> Mess:
    mess = get_mess_by_id(db, mess_id)

    if current_user.role != "admin" and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You do not own this mess")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mess, field, value)

    # Note: hygiene_score and is_fssai_verified are NOT in MessUpdate (admin-only via
    # /admin/messes/{id}/hygiene). The trust_score recalculation block that previously
    # checked for those fields has been removed (LOW-02 fix — it was dead code).

    db.commit()
    db.refresh(mess)
    return mess


def soft_delete_mess(
    db: Session,
    mess_id: uuid.UUID,
    current_user,
) -> None:
    mess = get_mess_by_id(db, mess_id)

    if current_user.role != "admin" and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You do not own this mess")

    mess.is_active = False
    db.commit()


# ── Menu item management ──────────────────────────────────────────

def get_menu_items(
    db: Session,
    mess_id: uuid.UUID,
    meal_type: str | None = None,
) -> list[MenuItem]:
    get_mess_by_id(db, mess_id)  # 404 if mess not found

    stmt = (
        select(MenuItem)
        .where(MenuItem.mess_id == mess_id, MenuItem.is_active == True)  # noqa: E712
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
) -> MenuItem:
    mess = get_mess_by_id(db, mess_id)

    if current_user.role != "admin" and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You do not own this mess")

    item = MenuItem(**data.model_dump(), mess_id=mess_id)
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
) -> MenuItem:
    mess = get_mess_by_id(db, mess_id)

    if current_user.role != "admin" and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You do not own this mess")

    item = (
        db.query(MenuItem)
        .filter(
            MenuItem.id == item_id,
            MenuItem.mess_id == mess_id,
            MenuItem.is_active == True,  # noqa: E712
        )
        .first()
    )
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
) -> None:
    mess = get_mess_by_id(db, mess_id)

    if current_user.role != "admin" and str(mess.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You do not own this mess")

    # MED-08 fix: filter is_active=True so already-deleted items return 404,
    # not a silent no-op 204 that falsely implies success.
    item = (
        db.query(MenuItem)
        .filter(
            MenuItem.id == item_id,
            MenuItem.mess_id == mess_id,
            MenuItem.is_active == True,  # noqa: E712  ← was missing before
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    item.is_active = False
    db.commit()


# ── Aggregate recalculation (called by review service + admin) ────

def recalculate_aggregates(db: Session, mess_id: uuid.UUID) -> None:
    """
    Recompute avg_rating, total_reviews, and trust_score.

    Commits the result — intended for use by the admin moderation endpoint
    which operates outside the review transaction lifecycle.
    For use within a review transaction, call review_service._recalculate_aggregates
    instead (no commit).
    """
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
    db.commit()