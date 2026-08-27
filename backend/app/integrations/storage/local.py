import os
import shutil
from pathlib import Path
from typing import BinaryIO, Union, Optional
from app.core.config import get_settings
from app.core.exceptions import StorageError
from app.integrations.storage.base import StorageProvider

settings = get_settings()


class LocalStorageProvider(StorageProvider):
    """
    Local filesystem implementation of StorageProvider.
    Ensures safe private file access with path traversal prevention.
    """

    def __init__(self, root_dir: Optional[Union[str, Path]] = None):
        self.root_dir = Path(root_dir or settings.STORAGE_ROOT).resolve()

    def _resolve_safe_path(self, relative_path: str) -> Path:
        clean_rel = os.path.normpath(relative_path).lstrip("/\\")
        full_path = (self.root_dir / clean_rel).resolve()
        if not str(full_path).startswith(str(self.root_dir)):
            raise StorageError(
                message=f"Path traversal attempt detected: {relative_path}",
                code="INVALID_STORAGE_PATH",
            )
        return full_path

    def save(self, file_content: Union[bytes, BinaryIO], relative_path: str) -> str:
        safe_path = self._resolve_safe_path(relative_path)
        safe_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            if isinstance(file_content, bytes):
                safe_path.write_bytes(file_content)
            else:
                with open(safe_path, "wb") as buffer:
                    shutil.copyfileobj(file_content, buffer)
            return str(safe_path.relative_to(self.root_dir)).replace("\\", "/")
        except Exception as e:
            raise StorageError(f"Failed to save file '{relative_path}': {e}")

    def read(self, relative_path: str) -> bytes:
        safe_path = self._resolve_safe_path(relative_path)
        if not safe_path.is_file():
            raise StorageError(
                message=f"File not found at '{relative_path}'",
                code="FILE_NOT_FOUND",
            )
        try:
            return safe_path.read_bytes()
        except Exception as e:
            raise StorageError(f"Failed to read file '{relative_path}': {e}")

    def delete(self, relative_path: str) -> bool:
        safe_path = self._resolve_safe_path(relative_path)
        if not safe_path.exists():
            return False
        try:
            if safe_path.is_file():
                safe_path.unlink()
            return True
        except Exception as e:
            raise StorageError(f"Failed to delete file '{relative_path}': {e}")

    def exists(self, relative_path: str) -> bool:
        try:
            safe_path = self._resolve_safe_path(relative_path)
            return safe_path.is_file()
        except StorageError:
            return False

    def get_path(self, relative_path: str) -> Path:
        return self._resolve_safe_path(relative_path)
