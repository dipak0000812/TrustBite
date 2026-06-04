"""
Scheduled background tasks for TrustBite.

Tasks:
  - cleanup_expired_tokens: deletes expired rows from blacklisted_tokens
    every hour so the table doesn't grow unboundedly and slow down the
    jti-lookup query that runs on every authenticated request.
"""

import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def cleanup_expired_tokens() -> int:
    """
    Delete all blacklisted_tokens rows whose expires_at is in the past.

    Returns the number of rows deleted.
    Safe to run under any load — uses a single bulk DELETE.
    """
    from app.db.database import SessionLocal
    from app.models.token_blacklist import BlacklistedToken

    deleted = 0
    try:
        with SessionLocal() as db:
            result = (
                db.query(BlacklistedToken)
                .filter(BlacklistedToken.expires_at < datetime.now(timezone.utc))
                .delete(synchronize_session=False)
            )
            db.commit()
            deleted = result
            if deleted > 0:
                logger.info("cleanup_expired_tokens: purged %d expired rows", deleted)
    except Exception as exc:
        logger.error("cleanup_expired_tokens: failed — %s", str(exc))

    return deleted
