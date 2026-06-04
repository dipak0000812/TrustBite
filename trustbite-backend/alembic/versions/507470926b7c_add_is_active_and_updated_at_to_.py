"""add_is_active_and_updated_at_to_favourites

Revision ID: 507470926b7c
Revises: 7aaef947cb11
Create Date: 2026-06-04 17:56:39.553550

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision: str = '507470926b7c'
down_revision: Union[str, None] = '7aaef947cb11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Add is_active with server_default=True (so existing rows get True)
    op.add_column('favourites', sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False))
    
    # Step 2: Add updated_at, allow NULL initially
    op.add_column('favourites', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Step 3: Populate updated_at for existing rows using created_at
    op.execute("UPDATE favourites SET updated_at = created_at WHERE updated_at IS NULL")
    
    # Step 4: Now make updated_at NOT NULL
    op.alter_column('favourites', 'updated_at', nullable=False)
    
    # Step 5: (Optional) Remove the server_default from is_active to keep it as a regular column
    # This is not strictly required, but removes the default for future inserts.
    # Your SQLAlchemy model already sets default=True, so it's fine either way.
    # op.alter_column('favourites', 'is_active', server_default=None)


def downgrade() -> None:
    op.drop_column('favourites', 'updated_at')
    op.drop_column('favourites', 'is_active')