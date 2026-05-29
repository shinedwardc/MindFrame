"""Add emotions to journal_entries

Revision ID: b2f4a1c9d3e7
Revises: 8d890757e20a
Create Date: 2026-05-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2f4a1c9d3e7'
down_revision: Union[str, None] = '8d890757e20a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('journal_entries', sa.Column('emotions', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('journal_entries', 'emotions')
