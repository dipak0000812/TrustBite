import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.favourite import FavouriteOut
from app.core.security import require_role
from app.services import favourite_service

router = APIRouter(prefix='/api/favourites', tags=['Favourites'])


@router.get('/', response_model=list[FavouriteOut])
def get_favourites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('student')),
):
    """Profile page — GET /api/favourites/"""
    return favourite_service.get_student_favourites(db, current_user.id)


@router.post('/{mess_id}', response_model=FavouriteOut, status_code=201)
def add_favourite(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('student')),
):
    """Heart button — POST /api/favourites/:messId"""
    return favourite_service.add_favourite(db, current_user.id, mess_id)


@router.delete('/{mess_id}', status_code=204)
def remove_favourite(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('student')),
):
    """Remove heart — DELETE /api/favourites/:messId"""
    favourite_service.remove_favourite(db, current_user.id, mess_id)


@router.get('/{mess_id}/check')
def check_favourite(
    mess_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('student')),
):
    """Returns { is_favourited: bool } — used on mess detail mount"""
    return {'is_favourited': favourite_service.is_favourited(db, current_user.id, mess_id)}
