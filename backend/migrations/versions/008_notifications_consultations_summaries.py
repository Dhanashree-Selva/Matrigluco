"""Notifications, Preferences, and Daily Health Summaries Schema

Revision ID: 008_notifications_summaries
Revises: 007_file_assets
Create Date: 2026-08-17 21:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "008_notifications_summaries"
down_revision: Union[str, None] = "007_file_assets"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Notifications Table ──
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", sa.String(50), nullable=False, server_default="system"),
        sa.Column("resource_type", sa.String(50), nullable=True),
        sa.Column("resource_id", sa.String(36), nullable=True),
        sa.Column("dedupe_key", sa.String(255), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("email_status", sa.String(50), nullable=False, server_default="not_requested"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("dedupe_key", name="uq_notifications_dedupe_key"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_notification_type", "notifications", ["notification_type"])
    op.create_index("ix_notifications_dedupe_key", "notifications", ["dedupe_key"])
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"])
    op.create_index("ix_notifications_created_at", "notifications", ["created_at"])

    # ── 2. Notification Preferences Table ──
    op.create_table(
        "notification_preferences",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "consultation_reminders_enabled", sa.Boolean(), nullable=False, server_default="1"
        ),
        sa.Column("risk_notifications_enabled", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column(
            "daily_summary_notifications_enabled", sa.Boolean(), nullable=False, server_default="1"
        ),
        sa.Column("email_notifications_enabled", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", name="uq_notification_preferences_user_id"),
    )
    op.create_index("ix_notification_preferences_user_id", "notification_preferences", ["user_id"])

    # ── 3. Daily Health Summaries Table ──
    op.create_table(
        "daily_health_summaries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("summary_date", sa.String(10), nullable=False),
        sa.Column("summary_version", sa.String(20), nullable=False, server_default="1.0.0"),
        sa.Column("measurement_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("summary_payload", sa.JSON(), nullable=True),
        sa.Column("generated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint(
            "user_id", "summary_date", "summary_version", name="uq_daily_summaries_user_date_ver"
        ),
    )
    op.create_index("ix_daily_health_summaries_user_id", "daily_health_summaries", ["user_id"])
    op.create_index(
        "ix_daily_health_summaries_summary_date", "daily_health_summaries", ["summary_date"]
    )


def downgrade() -> None:
    op.drop_table("daily_health_summaries")
    op.drop_table("notification_preferences")
    op.drop_table("notifications")
