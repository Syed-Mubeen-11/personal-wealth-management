"""Add recommendations table with is_read column

Revision ID: m4_001_recommendations
Revises: 
Create Date: 2026-03-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'm4_001_recommendations'
down_revision = None   # set to previous migration ID if one exists
branch_labels = None
depends_on = None


def upgrade():
    # Create recommendations table
    op.create_table(
        'recommendations',
        sa.Column('id',                   sa.Integer(),    nullable=False),
        sa.Column('user_id',              sa.Integer(),    nullable=False),
        sa.Column('title',                sa.String(),     nullable=False),
        sa.Column('recommendation_text',  sa.String(),     nullable=False),
        sa.Column('suggested_allocation', sa.JSON(),       nullable=False),
        sa.Column('is_read',              sa.Boolean(),    nullable=False, server_default=sa.text('false')),
        sa.Column('created_at',           sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at',           sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_recommendations_id',      'recommendations', ['id'],      unique=False)
    op.create_index('ix_recommendations_user_id', 'recommendations', ['user_id'], unique=False)


def downgrade():
    op.drop_index('ix_recommendations_user_id', table_name='recommendations')
    op.drop_index('ix_recommendations_id',      table_name='recommendations')
    op.drop_table('recommendations')
