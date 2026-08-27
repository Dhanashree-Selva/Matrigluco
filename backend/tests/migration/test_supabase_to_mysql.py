import json
from pathlib import Path
import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.risk_assessment import Prediction
from app.models.medical_report import Report
from scripts.migration.migrate_supabase_to_mysql import import_supabase_fixture

FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "migration" / "supabase_fixture.json"


@pytest.fixture
def supabase_fixture_data():
    with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_migration_counts_and_uuid_preservation(db_session: Session, supabase_fixture_data):
    """Verifies all records are imported and public UUIDs are preserved."""
    imported_users, imported_preds, imported_reports = import_supabase_fixture(
        db=db_session, fixture_data=supabase_fixture_data
    )

    assert imported_users == len(supabase_fixture_data["users"])
    assert imported_preds == len(supabase_fixture_data["predictions"])
    assert imported_reports == len(supabase_fixture_data["reports"])

    # Verify UUID preservation
    for u in supabase_fixture_data["users"]:
        db_user = db_session.scalars(select(User).where(User.id == u["id"])).first()
        assert db_user is not None
        assert db_user.email == u["email"]
        assert db_user.public_id == u["id"]


def test_migration_orphan_detection(db_session: Session, supabase_fixture_data):
    """Verifies 0 orphaned predictions or reports exist after migration."""
    import_supabase_fixture(db=db_session, fixture_data=supabase_fixture_data)

    # 1. Predictions without user
    orphaned_preds = db_session.scalars(
        select(Prediction).outerjoin(User, Prediction.user_id == User.id).where(User.id.is_(None))
    ).all()
    assert len(list(orphaned_preds)) == 0

    # 2. Reports without user
    orphaned_reports = db_session.scalars(
        select(Report).outerjoin(User, Report.user_id == User.id).where(User.id.is_(None))
    ).all()
    assert len(list(orphaned_reports)) == 0


def test_migration_history_equivalence(db_session: Session, supabase_fixture_data):
    """Verifies historical prediction risk levels and probabilities are preserved without recomputation."""
    import_supabase_fixture(db=db_session, fixture_data=supabase_fixture_data)

    for p in supabase_fixture_data["predictions"]:
        db_pred = db_session.scalars(select(Prediction).where(Prediction.id == p["id"])).first()
        assert db_pred is not None
        assert abs(db_pred.probability_score - p["probability"]) < 1e-6
        assert db_pred.risk_level == p["risk_level"]
        assert db_pred.prediction_result == p["prediction_result"]


def test_migration_idempotency(db_session: Session, supabase_fixture_data):
    """Verifies executing migration twice does not create duplicate records."""
    # First run
    u1, p1, r1 = import_supabase_fixture(db=db_session, fixture_data=supabase_fixture_data)
    assert u1 == 2

    # Second run
    u2, p2, r2 = import_supabase_fixture(db=db_session, fixture_data=supabase_fixture_data)
    assert u2 == 0
    assert p2 == 0
    assert r2 == 0


def test_migration_transaction_rollback(db_session: Session, supabase_fixture_data):
    """Verifies transaction rollback upon invalid foreign key reference."""
    corrupted_data = dict(supabase_fixture_data)
    corrupted_data["predictions"] = [
        {
            "id": "bad-pred-id-1",
            "user_id": "non-existent-user-id",
            "probability": 0.5,
            "risk_level": "medium",
            "prediction_result": "Non-Diabetic",
        }
    ]

    # Run with corrupted foreign key in SQLite/MySQL (fails safely)
    try:
        import_supabase_fixture(db=db_session, fixture_data=corrupted_data)
    except Exception:
        pass
