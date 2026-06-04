"""add_missing_mess_columns

Revision ID: a9b8c7d6e5f4
Revises: f1a2b3c4d5e6
Create Date: 2026-06-04 19:15:00.000000

Adds columns that are in the Mess model but were never included in any
prior migration: tags, weekly_menu, deleted_at.
All columns are nullable so existing rows are unaffected.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a9b8c7d6e5f4"
down_revision: Union[str, None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add with IF NOT EXISTS guards via try/except to be idempotent
    # (the columns may already exist if the DB was seeded from the model directly)
    bind = op.get_bind()

    # Inspect existing columns
    from sqlalchemy import inspect as sa_inspect
    inspector = sa_inspect(bind)
    existing = {col["name"] for col in inspector.get_columns("messes")}

    if "tags" not in existing:
        op.add_column("messes", sa.Column("tags", sa.String(500), nullable=True))

    if "weekly_menu" not in existing:
        op.add_column("messes", sa.Column("weekly_menu", sa.JSON(), nullable=True))

    if "deleted_at" not in existing:
        op.add_column(
            "messes",
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    op.drop_column("messes", "deleted_at")
    op.drop_column("messes", "weekly_menu")
    op.drop_column("messes", "tags")
