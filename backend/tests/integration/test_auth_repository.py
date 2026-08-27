import pytest
import uuid
from datetime import datetime, timezone, timedelta
from app.repositories.auth_repository import AuthRepository
from app.models.user import User


def test_auth_repository_session_lifecycle(db_session):
    """AuthRepository creates, looks up, rotates, and revokes sessions cleanly."""
    repo = AuthRepository(db=db_session)
    user_id = str(uuid.uuid4())

    user = User(
        id=user_id,
        email=f"auth-repo-{uuid.uuid4().hex[:6]}@example.com",
        email_normalized=f"auth-repo-{uuid.uuid4().hex[:6]}@example.com",
        password_hash="hash123",
        full_name="Auth Repo User",
        role="user",
    )
    db_session.add(user)
    db_session.commit()

    token_hash = f"hash_{uuid.uuid4().hex}"
    family_id = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=14)

    # Create session
    session = repo.create_session(
        user_id=user_id,
        token_hash=token_hash,
        token_family_id=family_id,
        expires_at=expires_at,
    )
    db_session.commit()
    assert session.id is not None
    assert session.token_hash == token_hash
    assert session.status == "active"

    # Find active session
    found = repo.get_session_by_token_hash_for_update(token_hash=token_hash)
    assert found is not None
    assert found.id == session.id

    # Revoke session
    repo.revoke_session(session=found, reason="test_revocation")
    db_session.commit()

    # Verify session is revoked
    found_after = repo.get_session_by_token_hash_for_update(token_hash=token_hash)
    assert found_after is not None
    assert found_after.status == "revoked"
