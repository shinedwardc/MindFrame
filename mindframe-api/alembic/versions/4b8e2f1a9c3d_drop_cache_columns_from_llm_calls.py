"""drop cache columns from llm_calls

Revision ID: 4b8e2f1a9c3d
Revises: d6930211c9de
Create Date: 2026-10-20 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b8e2f1a9c3d'
down_revision: Union[str, None] = 'd6930211c9de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('llm_calls', 'cache_hit')
    op.drop_column('llm_calls', 'cache_creation_input_tokens')
    op.drop_column('llm_calls', 'cache_read_input_tokens')


def downgrade() -> None:
    op.add_column('llm_calls', sa.Column('cache_read_input_tokens', sa.Integer(), server_default='0', nullable=False))
    op.add_column('llm_calls', sa.Column('cache_creation_input_tokens', sa.Integer(), server_default='0', nullable=False))
    op.add_column('llm_calls', sa.Column('cache_hit', sa.Boolean(), server_default='false', nullable=False))
