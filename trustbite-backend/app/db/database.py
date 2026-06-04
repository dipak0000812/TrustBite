"""
Database session factory and FastAPI dependency.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.db_utils import resolve_db_url_to_ipv4

resolved_url = resolve_db_url_to_ipv4(settings.DATABASE_URL)

_is_sqlite = resolved_url.startswith("sqlite")

if _is_sqlite:
    engine = create_engine(
        resolved_url,
        connect_args={"check_same_thread": False},
        # Never echo SQL in production — leaks table/column names and query patterns.
        echo=settings.DEBUG and not (settings.ENVIRONMENT.lower() == "production"),
    )
else:
    engine = create_engine(
        resolved_url,
        pool_pre_ping=True,
        # Keep pool_size small on Neon free tier (max 20 total connections).
        # With e.g. 4 Gunicorn workers × pool_size(3) + max_overflow(2) = 20 connections max.
        pool_size=3,
        max_overflow=2,
        pool_timeout=10,
        pool_recycle=300,  # recycle connections older than 5 min (avoids stale sockets)
        # Never echo SQL in production.
        echo=settings.DEBUG and not (settings.ENVIRONMENT.lower() == "production"),
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)


def get_db():
    """
    FastAPI dependency — yields a SQLAlchemy session.

    Rolls back on any unhandled exception so partial writes never
    silently commit, then closes the session in the finally block.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
