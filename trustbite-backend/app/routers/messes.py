# app/routers/messes.py

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.user import User
from app.schemas.menu_item import MenuItemCreate, MenuItemOut
from app.schemas.mess import MessCreate, MessOut, MessUpdate
from app.schemas.review import ReviewCreate, ReviewOut
from app.services import mess_service, review_service

router = APIRouter(
    prefix="/api/messes",
    tags=["Messes"]
)


# ─────────────────────────────────────────────────────────────
# PUBLIC ROUTES
# ─────────────────────────────────────────────────────────────

@router.get("/featured", response_model=list[MessOut])
def featured(
    limit: int = Query(default=6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    return mess_service.get_featured_messes(db, limit)


@router.get("/", response_model=list[MessOut])
def list_messes(
    city: str | None = None,
    cuisine_type: str | None = None,
    is_veg: bool | None = None,
    min_trust: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return mess_service.get_messes(
        db,
        city,
        cuisine_type,
        is_veg,
        min_trust,
        max_price,
        search,
        skip,
        limit,
    )


# ─────────────────────────────────────────────────────────────
# OWNER ROUTES
# ─────────────────────────────────────────────────────────────

@router.get("/owner/mine", response_model=list[MessOut])
def owner_messes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner")),
):
    return mess_service.get_owner_messes(
        db,
        current_user.id
    )


@router.get("/{mess_id}", response_model=MessOut)
def get_mess(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    mess = mess_service.get_mess_by_id(db, mess_id)

    if not mess:
        raise HTTPException(
            status_code=404,
            detail="Mess not found"
        )

    return mess


@router.post("/", response_model=MessOut, status_code=201)
def create_mess(
    data: MessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    mess = mess_service.create_mess(
        db,
        data,
        current_user.id
    )
    return MessOut.model_validate(mess)


@router.put("/{mess_id}", response_model=MessOut)
def update_mess(
    mess_id: uuid.UUID,
    data: MessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    return mess_service.update_mess(
        db,
        mess_id,
        data,
        current_user,
    )


@router.delete("/{mess_id}", status_code=204)
def delete_mess(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    mess_service.soft_delete_mess(
        db,
        mess_id,
        current_user,
    )

    return Response(status_code=204)


# ─────────────────────────────────────────────────────────────
# MENU ROUTES
# ─────────────────────────────────────────────────────────────

@router.get("/{mess_id}/menu", response_model=list[MenuItemOut])
def get_menu(
    mess_id: uuid.UUID,
    meal_type: str | None = None,
    db: Session = Depends(get_db),
):
    return mess_service.get_menu_items(
        db,
        mess_id,
        meal_type
    )


@router.post("/{mess_id}/menu", response_model=MenuItemOut, status_code=201)
def add_menu_item(
    mess_id: uuid.UUID,
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    return mess_service.add_menu_item(
        db,
        mess_id,
        data,
        current_user,
    )


@router.put("/{mess_id}/menu/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    mess_id: uuid.UUID,
    item_id: uuid.UUID,
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    return mess_service.update_menu_item(db, mess_id, item_id, data, current_user)


@router.delete("/{mess_id}/menu/{item_id}", status_code=204)
def delete_menu_item(
    mess_id: uuid.UUID,
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    mess_service.delete_menu_item(db, mess_id, item_id, current_user)
    return Response(status_code=204)


# ─────────────────────────────────────────────────────────────
# REVIEW ROUTES
# ─────────────────────────────────────────────────────────────

@router.get("/{mess_id}/reviews", response_model=list[ReviewOut])
def get_reviews(
    mess_id: uuid.UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return review_service.get_mess_reviews(
        db,
        mess_id,
        skip,
        limit,
    )


@router.post("/{mess_id}/reviews", response_model=ReviewOut, status_code=201)
def add_review(
    mess_id: uuid.UUID,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    return review_service.add_review(
        db,
        mess_id,
        current_user.id,
        data,
    )


@router.get("/{mess_id}/has-reviewed")
def has_reviewed(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    return {
        "has_reviewed": review_service.has_reviewed(
            db,
            current_user.id,
            mess_id,
        )
    }


@router.put("/{mess_id}/reviews", response_model=ReviewOut)
def update_review(
    mess_id: uuid.UUID,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    return review_service.update_review(
        db,
        mess_id,
        current_user.id,
        data,
    )