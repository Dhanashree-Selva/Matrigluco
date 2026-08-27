import uuid
import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.file_asset import FileAsset
from app.repositories.file_repository import FileRepository


def test_file_repository_crud(db_session: Session, test_user_a: User):
    """FileRepository creates, retrieves, scopes by owner, and soft deletes."""
    repo = FileRepository(db_session)
    asset_id = str(uuid.uuid4())
    key = f"private/medical-reports/{uuid.uuid4().hex}/test.pdf"

    asset = FileAsset(
        id=asset_id,
        user_id=test_user_a.id,
        storage_provider="local",
        storage_key=key,
        original_filename="test_report.pdf",
        mime_type="application/pdf",
        size_bytes=1024,
        sha256="a" * 64,
        category="medical_report",
    )
    repo.create(asset)
    db_session.commit()

    # Get by ID
    found = repo.get(asset_id)
    assert found is not None
    assert found.user_id == test_user_a.id

    # Get owned file
    owned = repo.get_owned_file(user_id=test_user_a.id, file_id=asset_id)
    assert owned is not None

    # Get owned file by wrong user returns None
    wrong = repo.get_owned_file(user_id="wrong-user-id", file_id=asset_id)
    assert wrong is None

    # Soft delete
    assert repo.mark_deleted(file_id=asset_id, user_id=test_user_a.id) is True
    db_session.commit()

    # Excluded from active queries
    assert (
        repo.get_owned_file(user_id=test_user_a.id, file_id=asset_id, include_deleted=False) is None
    )
    # Included when explicitly requested
    assert (
        repo.get_owned_file(user_id=test_user_a.id, file_id=asset_id, include_deleted=True)
        is not None
    )
