"""initial

Revision ID: 001
Revises: 
Create Date: 2025-10-29 11:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('type', sa.Enum('ACTIVITY', 'APPOINTMENT', 'IDEA', 'NOTE', 'TODO_ORGANIZE', name='itemtype'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('start_time', sa.String(), nullable=True),
        sa.Column('end_time', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('TODO', 'IN_PROGRESS', 'DONE', 'NEW', 'TO_EVALUATE', 'IN_DEVELOPMENT', 'ARCHIVED', name='itemstatus'), nullable=True),
        sa.Column('priority', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='priority'), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('categories', sa.JSON(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('original_text', sa.Text(), nullable=True),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('search_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_items_start_date'), 'items', ['start_date'], unique=False)
    op.create_index(op.f('ix_items_type'), 'items', ['type'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_items_type'), table_name='items')
    op.drop_index(op.f('ix_items_start_date'), table_name='items')
    op.drop_table('items')
