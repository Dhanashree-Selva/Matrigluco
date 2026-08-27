from pathlib import Path
from typing import BinaryIO, Union, Optional
from app.integrations.storage.base import StorageProvider
from app.integrations.storage.local import LocalStorageProvider


class StorageIntegrationService:
    """
    High-level private storage service coordinating file providers.
    """

    def __init__(self, provider: Optional[StorageProvider] = None):
        self.provider = provider or LocalStorageProvider()

    def save_file(self, content: Union[bytes, BinaryIO], destination: str) -> str:
        return self.provider.save(content, destination)

    def read_file(self, path: str) -> bytes:
        return self.provider.read(path)

    def delete_file(self, path: str) -> bool:
        return self.provider.delete(path)

    def file_exists(self, path: str) -> bool:
        return self.provider.exists(path)

    def get_file_path(self, path: str) -> Path:
        return self.provider.get_path(path)
