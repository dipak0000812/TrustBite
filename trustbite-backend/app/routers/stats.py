from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.mess import Mess
from app.models.user import User
from app.models.review import Review

router = APIRouter(prefix='/api/stats', tags=['Stats'])


@router.get('/platform')
def platform_stats(db: Session = Depends(get_db)):
    """Landing page stat pills — GET /api/stats/platform"""
    return {
        'total_messes': db.query(func.count(Mess.id)).filter(Mess.is_active == True).scalar() or 0,
        'total_students': db.query(func.count(User.id)).filter(
            User.role == 'student', User.is_active == True
        ).scalar() or 0,
        'total_reviews': db.query(func.count(Review.id)).filter(Review.is_active == True).scalar() or 0,
        'avg_trust_score': round(float(
            db.query(func.avg(Mess.trust_score)).filter(
                Mess.is_active == True, Mess.trust_score.isnot(None)
            ).scalar() or 0
        ), 1),
    }
