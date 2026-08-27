import pytest
from app.core.exceptions import StorageError
from app.storage.local import LocalStorageService


def test_storage_save_and_read(temp_storage: LocalStorageService):
    content = b"Sample private medical report bytes"
    path = "reports/report_123.pdf"

    saved_rel_path = temp_storage.save(content, path)
    assert "reports/report_123.pdf" in saved_rel_path
    assert temp_storage.exists(path) is True

    read_bytes = temp_storage.read(path)
    assert read_bytes == content


def test_storage_delete(temp_storage: LocalStorageService):
    content = b"Temporary content"
    path = "temp/temp_test.txt"

    temp_storage.save(content, path)
    assert temp_storage.exists(path) is True

    deleted = temp_storage.delete(path)
    assert deleted is True
    assert temp_storage.exists(path) is False

    # Deleting non-existent file returns False
    assert temp_storage.delete(path) is False


def test_storage_path_traversal_prevention(temp_storage: LocalStorageService):
    malicious_path = "../../etc/shadow"
    with pytest.raises(StorageError) as exc_info:
        temp_storage.save(b"malicious", malicious_path)
    assert exc_info.value.code == "INVALID_STORAGE_PATH"


def test_storage_read_non_existent(temp_storage: LocalStorageService):
    with pytest.raises(StorageError) as exc_info:
        temp_storage.read("reports/does_not_exist.pdf")
    assert exc_info.value.code == "FILE_NOT_FOUND"
