"""add llm_calls table

Revision ID: d6930211c9de
Revises: 2cf1d37e705e
Create Date: 2026-10-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6930211c9de'
down_revision: Union[str, None] = '2cf1d37e705e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('llm_calls',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('task', sa.String(), nullable=False),
    sa.Column('model', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('error_type', sa.String(), nullable=True),
    sa.Column('input_tokens', sa.Integer(), server_default='0', nullable=False),
    sa.Column('cache_read_input_tokens', sa.Integer(), server_default='0', nullable=False),
    sa.Column('cache_creation_input_tokens', sa.Integer(), server_default='0', nullable=False),
    sa.Column('output_tokens', sa.Integer(), server_default='0', nullable=False),
    sa.Column('latency_ms', sa.Integer(), nullable=False),
    sa.Column('cost_usd', sa.Numeric(precision=12, scale=8), nullable=True),
    sa.Column('cache_hit', sa.Boolean(), server_default='false', nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_llm_calls_created_at'), 'llm_calls', ['created_at'], unique=False)
    op.create_index(op.f('ix_llm_calls_id'), 'llm_calls', ['id'], unique=False)
    op.create_index(op.f('ix_llm_calls_task'), 'llm_calls', ['task'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_llm_calls_task'), table_name='llm_calls')
    op.drop_index(op.f('ix_llm_calls_id'), table_name='llm_calls')
    op.drop_index(op.f('ix_llm_calls_created_at'), table_name='llm_calls')
    op.drop_table('llm_calls')
