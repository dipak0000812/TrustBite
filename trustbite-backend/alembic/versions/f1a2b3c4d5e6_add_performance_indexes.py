"""add_performance_indexes_and_fix_review_unique_constraint

Revision ID: f1a2b3c4d5e6
Revises: 507470926b7c
Create Date: 2026-06-04 19:00:00.000000

Changes
-------
HIGH-06: Add the indexes that were missing from the initial schema.
  - messes: (is_active, trust_score) composite — covers the default ORDER BY query
  - messes: city — covers the primary search filter
  - messes: owner_id — covers /owner/mine
  - reviews: mess_id — covers every review fetch by mess
  - reviews: student_id — covers per-student review lookup
  - favourites: student_id — covers /favourites/ list

MED-06: Replace the non-partial UniqueConstraint on reviews(student_id, mess_id)
  with a partial unique index that only applies to ACTIVE reviews.
  This allows a student to re-review a mess after their previous review
  was soft-deleted by an admin, while still preventing duplicate active reviews.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "507470926b7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── HIGH-06: Performance indexes ────────────────────────────────

    # Composite index: the most common query is
    #   WHERE is_active = TRUE ORDER BY trust_score DESC
    op.create_index(
        "ix_messes_active_trust",
        "messes",
        ["is_active", "trust_score"],
    )

    # Single-column indexes for individual filters
    op.create_index("ix_messes_city",     "messes",     ["city"])
    op.create_index("ix_messes_owner_id", "messes",     ["owner_id"])
    op.create_index("ix_reviews_mess_id", "reviews",    ["mess_id"])
    op.create_index("ix_reviews_student_id", "reviews", ["student_id"])
    op.create_index("ix_favourites_student_id", "favourites", ["student_id"])

    # ── MED-06: Partial unique index for reviews ─────────────────────
    # Drop the old non-partial unique constraint, then recreate as a
    # PostgreSQL partial index (WHERE is_active = TRUE).
    # This allows re-reviewing after admin soft-delete while still
    # preventing two simultaneous active reviews.
    #
    # NOTE: SQLite does not support partial indexes — skip on SQLite.
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.drop_constraint(
            "uq_one_review_per_student_mess",
            "reviews",
            type_="unique",
        )
        op.execute(
            """
            CREATE UNIQUE INDEX uq_one_active_review_per_student_mess
            ON reviews (student_id, mess_id)
            WHERE is_active = TRUE
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP INDEX IF EXISTS uq_one_active_review_per_student_mess")
        op.create_unique_constraint(
            "uq_one_review_per_student_mess",
            "reviews",
            ["student_id", "mess_id"],
        )

    op.drop_index("ix_favourites_student_id", table_name="favourites")
    op.drop_index("ix_reviews_student_id",    table_name="reviews")
    op.drop_index("ix_reviews_mess_id",       table_name="reviews")
    op.drop_index("ix_messes_owner_id",       table_name="messes")
    op.drop_index("ix_messes_city",           table_name="messes")
    op.drop_index("ix_messes_active_trust",   table_name="messes")
