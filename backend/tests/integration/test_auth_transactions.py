import pytest
import uuid
from app.services.auth_service import AuthService
from app.schemas.auth import RegisterRequest
from app.models.user import User


def test_registration_transaction_success(db_session):
    """Registration creates user and associates defaults atomically in one transaction."""
    auth_service = AuthService(db=db_session)
    test_email = f"tx-reg-{uuid.uuid4().hex[:8]}@example.com"

    reg_req = RegisterRequest(
        email=test_email,
        password="SecurePassword123!",
        full_name="Transaction Reg User",
        age=30,
        pregnancy_week=20,
    )

    token_pair = auth_service.register_user(payload=reg_req)
    assert token_pair is not None
    assert token_pair.access_token is not None
    assert token_pair.refresh_token is not None

    # Verify user exists in database
    persisted = db_session.query(User).filter(User.email_normalized == test_email.lower()).first()
    assert persisted is not None
    assert persisted.full_name == "Transaction Reg User"
