import uuid
import hashlib
import logging
from pathlib import Path
from typing import BinaryIO, Optional, Tuple, Set
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import (
    ResourceNotFoundError,
    AuthorizationError,
    StorageError,
    ValidationError,
)
from app.models.file_asset import FileAsset
from app.repositories.file_repository import FileRepository
from app.integrations.storage.service import StorageIntegrationService
from app.integrations.storage.validation import (
    validate_file_content,
    sanitize_filename,
    ALLOWED_REPORT_MIMES,
    ALLOWED_AVATAR_MIMES,
)

logger = logging.getLogger("matrigluco.services.file")
settings = get_settings()

MIME_TO_EXT = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


class FileService:
    """
    Application service managing private file lifecycle:
    Validation -> Opaque Key Generation -> SHA-256 Hashing -> Storage -> Metadata Persistence -> Ownership Enforcement.
    """

    def __init__(
        self,
        db: Session,
        storage_service: Optional[StorageIntegrationService] = None,
    ):
        self.db = db
        self.repo = FileRepository(db)
        self.storage = storage_service or StorageIntegrationService()

    def _generate_storage_key(self, category: str, verified_mime: str) -> str:
        ext = MIME_TO_EXT.get(verified_mime, "bin")
        unique_folder = uuid.uuid4().hex
        unique_file = uuid.uuid4().hex
        if category == "avatar":
            return f"private/avatars/{unique_folder}/{unique_file}.{ext}"
        elif category == "knowledge_document":
            return f"private/knowledge-documents/{unique_folder}/{unique_file}.{ext}"
        elif category == "generated_export":
            return f"generated/exports/{unique_folder}/{unique_file}.{ext}"
        else:
            return f"private/medical-reports/{unique_folder}/{unique_file}.{ext}"

    def store_private_file(
        self,
        user_id: str,
        file_obj: BinaryIO,
        category: str = "medical_report",
        original_filename: Optional[str] = None,
        declared_mime: Optional[str] = None,
    ) -> FileAsset:
        """
        Validates, hashes, stores privately on disk, and persists metadata in file_assets table.
        """
        # Determine allowed MIME types & max size
        if category == "avatar":
            allowed_mimes = ALLOWED_AVATAR_MIMES
            max_size_bytes = 5 * 1024 * 1024  # 5MB
        else:
            allowed_mimes = ALLOWED_REPORT_MIMES
            max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

        verified_mime, size_bytes, _ = validate_file_content(
            file_obj=file_obj,
            declared_mime=declared_mime,
            allowed_mimes=allowed_mimes,
            max_size_bytes=max_size_bytes,
        )

        # Compute SHA-256 while streaming
        hasher = hashlib.sha256()
        file_obj.seek(0)
        while True:
            chunk = file_obj.read(64 * 1024)
            if not chunk:
                break
            hasher.update(chunk)
        sha256_digest = hasher.hexdigest()
        file_obj.seek(0)

        # Generate opaque randomized key
        storage_key = self._generate_storage_key(category, verified_mime)

        # Save to private storage
        stored_path = self.storage.save_file(file_obj, storage_key)

        # Persist FileAsset record
        file_asset = FileAsset(
            user_id=user_id,
            storage_provider="local",
            storage_key=stored_path,
            original_filename=sanitize_filename(original_filename),
            mime_type=verified_mime,
            size_bytes=size_bytes,
            sha256=sha256_digest,
            category=category,
        )
        self.repo.create(file_asset)
        logger.info(
            f"Private file asset '{file_asset.id}' created for user '{user_id}' in category '{category}'."
        )
        return file_asset

    def get_authorized_download(self, user_id: str, file_id: str) -> Tuple[Path, str, str, int]:
        """
        Validates ownership and returns (safe_file_path, original_filename, mime_type, size_bytes).
        Returns 404 if file does not exist, is soft-deleted, or belongs to another user.
        """
        asset = self.repo.get_owned_file(user_id=user_id, file_id=file_id, include_deleted=False)
        if not asset:
            raise ResourceNotFoundError(
                message=f"File '{file_id}' not found.", code="FILE_NOT_FOUND"
            )

        safe_path = self.storage.get_file_path(asset.storage_key)
        if not safe_path.is_file():
            logger.error(
                f"Storage integrity mismatch: FileAsset '{file_id}' missing on disk at '{asset.storage_key}'."
            )
            raise StorageError(
                message="File content is unavailable.", code="FILE_STORAGE_OBJECT_MISSING"
            )

        safe_filename = sanitize_filename(asset.original_filename)
        return safe_path, safe_filename, str(asset.mime_type), int(asset.size_bytes)

    def soft_delete_file(self, user_id: str, file_id: str) -> bool:
        """Soft deletes a file asset, immediately revoking download access."""
        deleted = self.repo.mark_deleted(file_id=file_id, user_id=user_id)
        if not deleted:
            raise ResourceNotFoundError(
                message=f"File '{file_id}' not found.", code="FILE_NOT_FOUND"
            )
        logger.info(f"File asset '{file_id}' soft-deleted by user '{user_id}'.")
        return True
