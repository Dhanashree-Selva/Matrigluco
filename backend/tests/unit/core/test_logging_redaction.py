import logging
from app.core.logging import SensitiveDataFilter


def test_sensitive_data_filter_redacts_secrets():
    """SensitiveDataFilter removes passwords, JWTs, Bearer tokens, and API keys."""
    filt = SensitiveDataFilter()

    # 1. Password redaction
    record1 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg='User login attempt with password="SUPER_SECRET_PASSWORD_123"',
        args=(),
        exc_info=None,
    )
    filt.filter(record1)
    assert "SUPER_SECRET_PASSWORD_123" not in record1.msg
    assert "[REDACTED]" in record1.msg

    # 2. Bearer token redaction
    record2 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.do_not_leak_this",
        args=(),
        exc_info=None,
    )
    filt.filter(record2)
    assert "eyJhbGci" not in record2.msg
    assert "[REDACTED]" in record2.msg or "[REDACTED_JWT]" in record2.msg

    # 3. API key redaction
    record3 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg='api_key="SECRET_OCR_API_KEY_XYZ_999"',
        args=(),
        exc_info=None,
    )
    filt.filter(record3)
    assert "SECRET_OCR_API_KEY_XYZ_999" not in record3.msg
    assert "[REDACTED]" in record3.msg
