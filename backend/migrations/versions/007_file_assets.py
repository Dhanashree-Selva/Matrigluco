"""Private File Assets Schema

Revision ID: 007_file_assets
Revises: 006_health_measurements
Create Date: 2026-08-17 20:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "007_file_assets"
down_revision: Union[str, None] = "006_health_measurements"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "file_assets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("storage_provider", sa.String(50), nullable=False, server_default="local"),
        sa.Column("storage_key", sa.String(500), nullable=False),
        sa.Column("original_filename", sa.String(255), nullable=True),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("sha256", sa.String(64), nullable=False),
        sa.Column("category", sa.String(50), nullable=False, server_default="medical_report"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("storage_provider", "storage_key", name="uq_file_assets_provider_key"),
    )
    op.create_index("ix_file_assets_user_id", "file_assets", ["user_id"])
    op.create_index("ix_file_assets_storage_key", "file_assets", ["storage_key"])
    op.create_index("ix_file_assets_sha256", "file_assets", ["sha256"])
    op.create_index("ix_file_assets_category", "file_assets", ["category"])
    op.create_index("ix_file_assets_deleted_at", "file_assets", ["deleted_at"])


def downgrade() -> None:
    op.drop_table("file_assets")
