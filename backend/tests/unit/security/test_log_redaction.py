import logging
import io
import pytest
from app.core.logging import SensitiveDataFilter


def test_sensitive_data_filter_masks_passwords_and_tokens():
    """SensitiveDataFilter masks passwords, bearer tokens, and refresh tokens."""
    log_filter = SensitiveDataFilter()

    # Create dummy LogRecords
    record1 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg='User login attempt with password="SuperSecretPassword123!"',
        args=(),
        exc_info=None,
    )
    log_filter.filter(record1)
    assert "SuperSecretPassword123!" not in record1.msg
    assert "[REDACTED]" in record1.msg

    record2 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg="Handling request with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        args=(),
        exc_info=None,
    )
    log_filter.filter(record2)
    assert "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" not in record2.msg
