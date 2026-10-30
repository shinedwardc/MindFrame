"""add eval_run_id to llm_calls

Revision ID: 9e1c7d5b2a40
Revises: 4b8e2f1a9c3d
Create Date: 2026-10-20 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9e1c7d5b2a40'
down_revision: Union[str, None] = '4b8e2f1a9c3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('llm_calls', sa.Column('eval_run_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_llm_calls_eval_run_id'), 'llm_calls', ['eval_run_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_llm_calls_eval_run_id'), table_name='llm_calls')
    op.drop_column('llm_calls', 'eval_run_id')
