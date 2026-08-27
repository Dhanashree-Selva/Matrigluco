import pytest
import uuid
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.risk_assessment import RiskAssessment


def test_user_email_uniqueness(db_session):
    """Attempting to insert two users with the same email violates the unique constraint."""
    user_id_1 = str(uuid.uuid4())
    user_id_2 = str(uuid.uuid4())
    test_email = f"dup-test-{uuid.uuid4().hex[:8]}@example.test"

    user1 = User(
        id=user_id_1,
        email=test_email,
        email_normalized=test_email.lower(),
        password_hash="hash123",
        full_name="Test One",
        role="user",
    )
    db_session.add(user1)
    db_session.commit()

    user2 = User(
        id=user_id_2,
        email=test_email,
        email_normalized=test_email.lower(),
        password_hash="hash456",
        full_name="Test Two",
        role="user",
    )
    db_session.add(user2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_foreign_key_rejection_non_existent_parent(db_session):
    """Attempting to insert a child record with a non-existent parent user raises IntegrityError."""
    fake_user_id = str(uuid.uuid4())

    assessment = RiskAssessment(
        id=str(uuid.uuid4()),
        user_id=fake_user_id,
        probability=0.45,
        risk_band="moderate",
        input_snapshot_json="{}",
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(assessment)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
