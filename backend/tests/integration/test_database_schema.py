import pytest
from app.db.base import Base


def test_schema_expected_tables_present():
    """Verifies that all required domain tables exist in the database metadata."""
    metadata_tables = set(Base.metadata.tables.keys())
    required_tables = {
        "users",
        "user_sessions",
        "auth_tokens",
        "consent_records",
        "model_versions",
        "risk_assessments",
        "risk_assessment_features",
        "predictions",
        "doctor_appointments",
        "health_measurements",
        "reports",
        "background_jobs",
        "audit_logs",
        "security_events",
        "chat_conversations",
        "chat_messages",
        "chat_feedbacks",
        "ai_models",
        "knowledge_documents",
        "knowledge_chunks",
    }
    missing = required_tables - metadata_tables
    assert not missing, f"Missing domain tables in SQLAlchemy metadata: {missing}"


def test_metadata_naming_conventions():
    """Verifies that the naming convention is applied to the metadata."""
    assert Base.metadata.naming_convention is not None
    assert "fk" in Base.metadata.naming_convention
    assert "uq" in Base.metadata.naming_convention
    assert "pk" in Base.metadata.naming_convention


def test_user_id_primary_key_char36():
    """Verifies that User entity uses CHAR(36) UUID primary key."""
    user_table = Base.metadata.tables["users"]
    pk_col = user_table.c.id
    assert pk_col.primary_key is True
    assert (
        pk_col.type.length == 36
        or str(pk_col.type).startswith("CHAR(36)")
        or str(pk_col.type).startswith("VARCHAR(36)")
    )
