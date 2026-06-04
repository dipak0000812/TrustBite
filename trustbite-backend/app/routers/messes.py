"""
Messes router — /api/messes/*

Route ordering is intentional: static-path routes (/featured, /owner/mine, /upload)
MUST be registered before wildcard-path routes (/{mess_id}) to prevent shadowing.
Do NOT reorder without reading the HIGH-10 note in the audit report.
"""

import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.user import User
from app.schemas.menu_item import MenuItemCreate, MenuItemOut
from app.schemas.mess import MessCreate, MessOut, MessUpdate
from app.schemas.review import ReviewCreate, ReviewOut
from app.services import mess_service, review_service

router = APIRouter(prefix="/api/messes", tags=["Messes"])


# ─────────────────────────────────────────────────────────────────
# STATIC-PATH ROUTES  (must come before /{mess_id})
# ─────────────────────────────────────────────────────────────────

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
        db, city, cuisine_type, is_veg, min_trust, max_price, search, skip, limit
    )


@router.get("/owner/mine", response_model=list[MessOut])
def owner_messes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner")),
):
    return mess_service.get_owner_messes(db, current_user.id)


@router.post("/upload", response_model=dict)
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    """
    Upload a mess image.

    Security controls:
    - Allowed formats: JPEG, PNG, WebP — validated by actual magic bytes, NOT
      the client-supplied Content-Type header (which is trivially spoofable).
    - Maximum size: 5 MB — enforced before any file I/O.
    - Filename: always a fresh UUID — never uses the client-supplied filename.
    """
    MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

    # Read the entire file content first so we can inspect magic bytes
    contents = file.file.read(MAX_SIZE_BYTES + 1)

    # ── Size check ────────────────────────────────────────────────
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum allowed size is 5 MB.",
        )

    # ── Magic-byte validation (HIGH-04) ───────────────────────────
    # We inspect the actual file header bytes, not the client-supplied
    # Content-Type header (which is trivially spoofable).
    # imghdr was removed in Python 3.13, so we use a small inline lookup.
    _MAGIC: list[tuple[bytes, str, str]] = [
        (b"\xff\xd8\xff",       "jpeg", ".jpg"),
        (b"\x89PNG\r\n\x1a\n", "png",  ".png"),
        (b"RIFF",              "webp", ".webp"),  # needs extra check below
    ]

    detected_type: str | None = None
    file_ext: str | None = None
    for magic, img_type, ext in _MAGIC:
        if contents[:len(magic)] == magic:
            # WebP: bytes 8-12 must also be b"WEBP"
            if img_type == "webp" and contents[8:12] != b"WEBP":
                continue
            detected_type = img_type
            file_ext = ext
            break

    if detected_type is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file. Upload JPEG, PNG, or WebP only.",
        )

    # ── Save with UUID filename ───────────────────────────────────
    os.makedirs("static/uploads", exist_ok=True)
    safe_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join("static/uploads", safe_name)

    with open(file_path, "wb") as buf:
        buf.write(contents)

    return {"url": f"/static/uploads/{safe_name}", "success": True}


# ─────────────────────────────────────────────────────────────────
# WILDCARD-PATH ROUTES  (/{mess_id} — must come AFTER static routes)
# ─────────────────────────────────────────────────────────────────

@router.get("/{mess_id}", response_model=MessOut)
def get_mess(mess_id: uuid.UUID, db: Session = Depends(get_db)):
    return mess_service.get_mess_by_id(db, mess_id)


@router.post("/", response_model=MessOut, status_code=201)
def create_mess(
    data: MessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    """
    Create a mess listing.

    For mess_owners: also marks onboarding as complete within the same
    transaction — no second commit in the router (ARCH-01 fix).
    """
    should_onboard = (
        current_user.role == "mess_owner"
        and not current_user.is_onboarding_complete
    )
    return mess_service.create_mess(
        db, data, current_user.id, mark_owner_onboarded=should_onboard
    )


@router.put("/{mess_id}", response_model=MessOut)
def update_mess(
    mess_id: uuid.UUID,
    data: MessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    return mess_service.update_mess(db, mess_id, data, current_user)


@router.delete("/{mess_id}", status_code=204)
def delete_mess(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    mess_service.soft_delete_mess(db, mess_id, current_user)
    return Response(status_code=204)


# ─────────────────────────────────────────────────────────────────
# MENU ROUTES
# ─────────────────────────────────────────────────────────────────

@router.get("/{mess_id}/menu", response_model=list[MenuItemOut])
def get_menu(
    mess_id: uuid.UUID,
    meal_type: str | None = None,
    db: Session = Depends(get_db),
):
    return mess_service.get_menu_items(db, mess_id, meal_type)


@router.post("/{mess_id}/menu", response_model=MenuItemOut, status_code=201)
def add_menu_item(
    mess_id: uuid.UUID,
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mess_owner", "admin")),
):
    return mess_service.add_menu_item(db, mess_id, data, current_user)


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


# ─────────────────────────────────────────────────────────────────
# REVIEW ROUTES
# ─────────────────────────────────────────────────────────────────

@router.get("/{mess_id}/reviews", response_model=list[ReviewOut])
def get_reviews(
    mess_id: uuid.UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return review_service.get_mess_reviews(db, mess_id, skip, limit)


@router.post("/{mess_id}/reviews", response_model=ReviewOut, status_code=201)
def add_review(
    mess_id: uuid.UUID,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    return review_service.add_review(db, mess_id, current_user.id, data)


@router.get("/{mess_id}/has-reviewed")
def has_reviewed(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    return {"has_reviewed": review_service.has_reviewed(db, current_user.id, mess_id)}


@router.put("/{mess_id}/reviews", response_model=ReviewOut)
def update_review(
    mess_id: uuid.UUID,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    return review_service.update_review(db, mess_id, current_user.id, data)