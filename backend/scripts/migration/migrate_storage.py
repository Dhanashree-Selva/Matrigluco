"""
Transfers uploaded files to private local storage structure.
"""

from pathlib import Path
from app.integrations.storage.service import StorageIntegrationService


def migrate_storage_files():
    storage = StorageIntegrationService()
    print("Storage migration initialized. Target directory:", storage.provider.root_dir)


if __name__ == "__main__":
    migrate_storage_files()
