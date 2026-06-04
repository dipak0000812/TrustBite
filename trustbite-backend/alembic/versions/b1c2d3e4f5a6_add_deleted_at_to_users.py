"""add_deleted_at_to_users

Revision ID: b1c2d3e4f5a6
Revises: a9b8c7d6e5f4
Create Date: 2026-06-04 19:20:00.000000

Adds deleted_at (DateTime, nullable) to the users table.
This column is present in the User SQLAlchemy model but was never migrated,
causing INSERT statements to fail with 'column users.deleted_at does not exist'.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, None] = "a9b8c7d6e5f4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from sqlalchemy import inspect as sa_inspect
    bind = op.get_bind()
    inspector = sa_inspect(bind)
    existing = {col["name"] for col in inspector.get_columns("users")}

    if "deleted_at" not in existing:
        op.add_column(
            "users",
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    op.drop_column("users", "deleted_at")
