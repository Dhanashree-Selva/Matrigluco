"""Durable Background Jobs Tracking Schema

Revision ID: 004_background_jobs
Revises: 003_model_governance
Create Date: 2026-08-17 16:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "004_background_jobs"
down_revision: Union[str, None] = "003_model_governance"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "background_jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("job_type", sa.String(50), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("progress_percent", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("progress_message", sa.String(255), nullable=True),
        sa.Column("celery_task_id", sa.String(100), nullable=True),
        sa.Column("resource_type", sa.String(50), nullable=True),
        sa.Column("resource_id", sa.String(36), nullable=True),
        sa.Column("error_code", sa.String(50), nullable=True),
        sa.Column("error_message", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("queued_at", sa.DateTime(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("failed_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_background_jobs_public_id", "background_jobs", ["public_id"])
    op.create_index("ix_background_jobs_user_id", "background_jobs", ["user_id"])
    op.create_index("ix_background_jobs_status", "background_jobs", ["status"])
    op.create_index("ix_background_jobs_job_type", "background_jobs", ["job_type"])
    op.create_index("ix_background_jobs_celery_task_id", "background_jobs", ["celery_task_id"])
    op.create_index("ix_background_jobs_created_at", "background_jobs", ["created_at"])
    op.create_index("ix_background_jobs_user_status", "background_jobs", ["user_id", "status"])


def downgrade() -> None:
    op.drop_table("background_jobs")
