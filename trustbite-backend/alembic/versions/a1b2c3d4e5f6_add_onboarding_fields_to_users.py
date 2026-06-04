"""add_onboarding_fields_to_users

Adds is_onboarding_complete (BOOLEAN, default false) and preferences (JSONB)
columns to the users table.

These columns exist in the SQLAlchemy User model but were never added via
a migration, causing all PUT /api/auth/profile onboarding calls to fail
with a 500 (column does not exist in PostgreSQL).

This migration is inserted between e3aa0fb3e812 and 7aaef947cb11 so that
the subsequent migration (which alters is_onboarding_complete nullable) has
a column to operate on.

Revision ID: a1b2c3d4e5f6
Revises: e3aa0fb3e812
Create Date: 2026-06-03 21:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'e3aa0fb3e812'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_onboarding_complete — defaults to false for all existing users
    op.add_column(
        'users',
        sa.Column(
            'is_onboarding_complete',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
        )
    )

    # Add preferences as a JSONB column — nullable, no default
    op.add_column(
        'users',
        sa.Column(
            'preferences',
            sa.JSON(),
            nullable=True,
        )
    )


def downgrade() -> None:
    op.drop_column('users', 'preferences')
    op.drop_column('users', 'is_onboarding_complete')
