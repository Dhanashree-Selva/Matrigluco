import pytest
import uuid
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from app.models.user import User


def test_transaction_atomic_rollback_on_failure(db_session):
    """Multi-step transaction rolls back all changes if an operation fails."""
    user_id_1 = str(uuid.uuid4())
    user_id_2 = str(uuid.uuid4())
    test_email = f"tx-test-{uuid.uuid4().hex[:8]}@example.test"

    # Step 1: Add valid user
    user1 = User(
        id=user_id_1,
        email=test_email,
        email_normalized=test_email.lower(),
        password_hash="hash123",
        full_name="Transaction Test Valid",
        role="user",
    )
    db_session.add(user1)

    # Step 2: Add duplicate user in same transaction (will trigger unique constraint IntegrityError)
    user2 = User(
        id=user_id_2,
        email=test_email,
        email_normalized=test_email.lower(),
        password_hash="hash456",
        full_name="Transaction Test Duplicate",
        role="user",
    )
    db_session.add(user2)

    # Commit should fail atomically
    with pytest.raises(IntegrityError):
        db_session.commit()

    # Rollback transaction
    db_session.rollback()

    # Verify user1 was NOT partially committed
    persisted_user = db_session.query(User).filter(User.id == user_id_1).first()
    assert persisted_user is None


def test_session_isolation_and_rollback(test_engine):
    """Rolled back transaction in one session leaves no persistent artifacts for other sessions."""
    SessionFactory = sessionmaker(bind=test_engine)
    db1 = SessionFactory()
    db2 = SessionFactory()
    user_id = str(uuid.uuid4())
    test_email = f"iso-test-{uuid.uuid4().hex[:8]}@example.test"

    try:
        user = User(
            id=user_id,
            email=test_email,
            email_normalized=test_email.lower(),
            password_hash="hash123",
            full_name="Isolation Test",
            role="user",
        )
        db1.add(user)
        # Explicit rollback before commit
        db1.rollback()

        # Session 2 should see nothing
        persisted_in_db2 = db2.query(User).filter(User.id == user_id).first()
        assert persisted_in_db2 is None

    finally:
        db1.close()
        db2.close()
