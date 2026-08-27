from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO, Union


class StorageService(ABC):
    """
    Abstract interface for private file persistence (Local filesystem / Cloud Object Storage).
    Enforces private access by default for healthcare and clinical documents.
    """

    @abstractmethod
    def save(self, file_content: Union[bytes, BinaryIO], relative_path: str) -> str:
        """Saves file content to relative storage path and returns the resolved identifier/path."""
        pass

    @abstractmethod
    def read(self, relative_path: str) -> bytes:
        """Reads raw binary content of a stored file."""
        pass

    @abstractmethod
    def delete(self, relative_path: str) -> bool:
        """Deletes a stored file. Returns True if deleted, False if not found."""
        pass

    @abstractmethod
    def exists(self, relative_path: str) -> bool:
        """Checks whether a stored file exists."""
        pass

    @abstractmethod
    def get_path(self, relative_path: str) -> Path:
        """Resolves the safe local path of the file."""
        pass
