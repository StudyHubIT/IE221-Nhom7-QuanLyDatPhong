"""create pages table

Revision ID: 20260727_0001
Revises:
Create Date: 2026-07-27 21:20:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260727_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_pages_id", "pages", ["id"])


def downgrade() -> None:
    op.drop_index("ix_pages_id", table_name="pages")
    op.drop_table("pages")
