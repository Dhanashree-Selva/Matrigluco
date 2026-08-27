"""Authentication and Session Management Schema

Revision ID: 001_auth_sessions
Revises:
Create Date: 2026-08-17 12:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_auth_sessions"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create / Update Users Table ──
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("email_normalized", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("role", sa.String(50), nullable=False, server_default="user"),
        sa.Column("status", sa.String(50), nullable=False, server_default="active"),
        sa.Column("expected_due_date", sa.String(50), nullable=True),
        sa.Column("pregnancy_week", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("previous_pregnancies", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("blood_group", sa.String(10), nullable=True),
        sa.Column("emergency_contact", sa.String(100), nullable=True),
        sa.Column("email_verified_at", sa.DateTime(), nullable=True),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("password_changed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_users_public_id", "users", ["public_id"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_email_normalized", "users", ["email_normalized"])

    # ── 2. Create User Sessions Table ──
    op.create_table(
        "user_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("token_family_id", sa.String(36), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="active"),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("last_used_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("revocation_reason", sa.String(100), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_user_sessions_public_id", "user_sessions", ["public_id"])
    op.create_index("ix_user_sessions_user_id", "user_sessions", ["user_id"])
    op.create_index("ix_user_sessions_token_hash", "user_sessions", ["token_hash"])
    op.create_index("ix_user_sessions_token_family_id", "user_sessions", ["token_family_id"])
    op.create_index("ix_user_sessions_expires_at", "user_sessions", ["expires_at"])

    # ── 3. Create Auth Tokens Table (Reset & Verification) ──
    op.create_table(
        "auth_tokens",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("token_type", sa.String(50), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("consumed_at", sa.DateTime(), nullable=True),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_auth_tokens_public_id", "auth_tokens", ["public_id"])
    op.create_index("ix_auth_tokens_user_id", "auth_tokens", ["user_id"])
    op.create_index("ix_auth_tokens_token_hash", "auth_tokens", ["token_hash"])
    op.create_index("ix_auth_tokens_token_type", "auth_tokens", ["token_type"])
    op.create_index("ix_auth_tokens_expires_at", "auth_tokens", ["expires_at"])

    # ── 4. Create Security Audit Events Table ──
    op.create_table(
        "security_audit_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
        ),
        sa.Column("ip_address", sa.String(100), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_security_audit_events_event_type", "security_audit_events", ["event_type"])
    op.create_index("ix_security_audit_events_user_id", "security_audit_events", ["user_id"])
    op.create_index("ix_security_audit_events_created_at", "security_audit_events", ["created_at"])


def downgrade() -> None:
    op.drop_table("security_audit_events")
    op.drop_table("auth_tokens")
    op.drop_table("user_sessions")
    op.drop_table("users")
