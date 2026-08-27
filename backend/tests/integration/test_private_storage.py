import io
import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.file_service import FileService
from app.repositories.file_repository import FileRepository
from app.core.exceptions import ResourceNotFoundError, ValidationError, StorageError


def test_file_service_store_and_authorized_download(db_session: Session, test_user_a: User):
    """FileService correctly validates, hashes, stores privately, and authorizes download."""
    service = FileService(db_session)
    content = b"%PDF-1.4 Mock Lab Report Content for User A"
    file_obj = io.BytesIO(content)

    # 1. Store
    asset = service.store_private_file(
        user_id=test_user_a.id,
        file_obj=file_obj,
        category="medical_report",
        original_filename="user_a_report.pdf",
        declared_mime="application/pdf",
    )
    assert asset.id is not None
    assert asset.user_id == test_user_a.id
    assert asset.mime_type == "application/pdf"
    assert asset.size_bytes == len(content)
    assert len(asset.sha256) == 64
    assert "private/medical-reports/" in asset.storage_key
    assert "user_a_report.pdf" not in asset.storage_key  # Opaque randomized key

    # 2. Authorize download as owner
    safe_path, filename, mime, size = service.get_authorized_download(
        user_id=test_user_a.id, file_id=asset.id
    )
    assert safe_path.is_file()
    assert safe_path.read_bytes() == content
    assert filename == "user_a_report.pdf"
    assert mime == "application/pdf"
    assert size == len(content)


def test_file_service_cross_user_denied(db_session: Session, test_user_a: User, test_user_b: User):
    """User B cannot download User A's file (ResourceNotFoundError / 404)."""
    service = FileService(db_session)
    content = b"%PDF-1.4 User A Confidential Report"
    file_obj = io.BytesIO(content)

    asset = service.store_private_file(
        user_id=test_user_a.id,
        file_obj=file_obj,
        category="medical_report",
        original_filename="confidential.pdf",
    )

    with pytest.raises(ResourceNotFoundError):
        service.get_authorized_download(user_id=test_user_b.id, file_id=asset.id)


def test_file_service_soft_delete(db_session: Session, test_user_a: User):
    """Soft-deleted file immediately denies download access."""
    service = FileService(db_session)
    content = b"%PDF-1.4 Report to be Deleted"
    file_obj = io.BytesIO(content)

    asset = service.store_private_file(
        user_id=test_user_a.id,
        file_obj=file_obj,
        category="medical_report",
    )

    # Soft delete
    assert service.soft_delete_file(user_id=test_user_a.id, file_id=asset.id) is True

    # Download fails
    with pytest.raises(ResourceNotFoundError):
        service.get_authorized_download(user_id=test_user_a.id, file_id=asset.id)
