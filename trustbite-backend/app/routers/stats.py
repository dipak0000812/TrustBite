"""
Platform stats router — /api/stats/*

Results are cached in-process for 5 minutes so the landing page
stats pills don't hammer the database on every page load (HIGH-05).
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.mess import Mess
from app.models.review import Review
from app.models.user import User

router = APIRouter(prefix="/api/stats", tags=["Stats"])

# ── Simple in-process cache (no Redis dependency required) ────────
_STATS_TTL = timedelta(minutes=5)
_stats_cache: dict[str, Any] = {}


def _cache_get(key: str):
    entry = _stats_cache.get(key)
    if entry and datetime.now(timezone.utc) - entry["ts"] < _STATS_TTL:
        return entry["data"]
    return None


def _cache_set(key: str, data: Any) -> None:
    _stats_cache[key] = {"data": data, "ts": datetime.now(timezone.utc)}


# ─────────────────────────────────────────────────────────────────

@router.get("/platform")
def platform_stats(db: Session = Depends(get_db)):
    """
    Landing page stat pills — GET /api/stats/platform

    Cached for 5 minutes. Runs 4 DB queries consolidated below.
    """
    cached = _cache_get("platform_stats")
    if cached:
        return cached

    data = {
        "total_messes": (
            db.query(func.count(Mess.id))
            .filter(Mess.is_active == True)  # noqa: E712
            .scalar() or 0
        ),
        "total_students": (
            db.query(func.count(User.id))
            .filter(User.role == "student", User.is_active == True)  # noqa: E712
            .scalar() or 0
        ),
        "total_reviews": (
            db.query(func.count(Review.id))
            .filter(Review.is_active == True)  # noqa: E712
            .scalar() or 0
        ),
        "avg_trust_score": round(
            float(
                db.query(func.avg(Mess.trust_score))
                .filter(Mess.is_active == True, Mess.trust_score.isnot(None))  # noqa: E712
                .scalar() or 0
            ),
            1,
        ),
    }

    _cache_set("platform_stats", data)
    return data
