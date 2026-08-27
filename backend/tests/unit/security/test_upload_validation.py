import pytest
from app.utils.files import validate_file_content, sanitize_filename, generate_unique_file_id
from app.core.exceptions import ValidationError


def test_valid_file_signatures():
    """Valid PDF, PNG, and JPEG magic bytes pass validation."""
    valid_pdf = b"%PDF-1.4 sample content"
    valid_png = b"\x89PNG\r\n\x1a\n sample content"
    valid_jpeg = b"\xff\xd8\xff\xe0 sample content"

    assert validate_file_content(valid_pdf) == "application/pdf"
    assert validate_file_content(valid_png) == "image/png"
    assert validate_file_content(valid_jpeg) == "image/jpeg"


def test_fake_extension_rejected():
    """Text/HTML content with disguised extension is rejected."""
    fake_pdf = b"<html><body>Not a real PDF</body></html>"
    with pytest.raises(ValidationError) as exc:
        validate_file_content(fake_pdf)
    assert exc.value.code == "INVALID_FILE_SIGNATURE"


def test_oversized_file_rejected():
    """File exceeding maximum allowed size is rejected."""
    oversized = b"%PDF" + b"0" * (11 * 1024 * 1024)  # 11 MB
    with pytest.raises(ValidationError) as exc:
        validate_file_content(oversized, max_size_bytes=10 * 1024 * 1024)
    assert exc.value.code == "FILE_TOO_LARGE"


def test_filename_sanitization_and_unique_key():
    """Dangerous filenames with traversal are stripped and unique random keys generated."""
    evil_name = "../../etc/passwd.pdf"
    cleaned = sanitize_filename(evil_name)
    assert "/" not in cleaned
    assert ".." not in cleaned

    unique_key, ext = generate_unique_file_id("patient_lab_report.pdf")
    assert ext == "pdf"
    assert unique_key.endswith(".pdf")
    assert len(unique_key) > 30  # UUID format
