"""Audit Logs, Security Events, and Consent Records Schema

Revision ID: 005_audit_security_consent
Revises: 004_background_jobs
Create Date: 2026-08-17 17:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "005_audit_security_consent"
down_revision: Union[str, None] = "004_background_jobs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. audit_logs table
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "actor_user_id",
            sa.String(36),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(50), nullable=True),
        sa.Column("resource_id", sa.String(100), nullable=True),
        sa.Column("outcome", sa.String(30), nullable=False, server_default="success"),
        sa.Column("request_id", sa.String(64), nullable=True),
        sa.Column("safe_metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_audit_logs_public_id", "audit_logs", ["public_id"])
    op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"])
    op.create_index("ix_audit_logs_event_type", "audit_logs", ["event_type"])
    op.create_index("ix_audit_logs_resource_type", "audit_logs", ["resource_type"])
    op.create_index("ix_audit_logs_resource_id", "audit_logs", ["resource_id"])
    op.create_index("ix_audit_logs_request_id", "audit_logs", ["request_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])

    # 2. security_events table
    op.create_table(
        "security_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
        ),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False, server_default="warning"),
        sa.Column("resource_type", sa.String(50), nullable=True),
        sa.Column("resource_id", sa.String(100), nullable=True),
        sa.Column("request_id", sa.String(64), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True),
        sa.Column("user_agent_summary", sa.String(255), nullable=True),
        sa.Column("safe_metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_security_events_public_id", "security_events", ["public_id"])
    op.create_index("ix_security_events_user_id", "security_events", ["user_id"])
    op.create_index("ix_security_events_event_type", "security_events", ["event_type"])
    op.create_index("ix_security_events_severity", "security_events", ["severity"])
    op.create_index("ix_security_events_request_id", "security_events", ["request_id"])
    op.create_index("ix_security_events_ip_hash", "security_events", ["ip_hash"])
    op.create_index("ix_security_events_created_at", "security_events", ["created_at"])

    # 3. consent_records table
    op.create_table(
        "consent_records",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("consent_type", sa.String(100), nullable=False),
        sa.Column("consent_version", sa.String(50), nullable=False),
        sa.Column("accepted_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("withdrawn_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_consent_records_public_id", "consent_records", ["public_id"])
    op.create_index("ix_consent_records_user_id", "consent_records", ["user_id"])
    op.create_index("ix_consent_records_consent_type", "consent_records", ["consent_type"])
    op.create_index("ix_consent_user_type", "consent_records", ["user_id", "consent_type"])


def downgrade() -> None:
    op.drop_table("consent_records")
    op.drop_table("security_events")
    op.drop_table("audit_logs")
