import re
from typing import BinaryIO, Optional, Tuple, Set
from app.core.exceptions import ValidationError

# Magic signatures
PDF_MAGIC = b"%PDF-"
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
JPEG_MAGIC = b"\xff\xd8\xff"
WEBP_RIFF = b"RIFF"
WEBP_WEBP = b"WEBP"

ALLOWED_REPORT_MIMES = {"application/pdf", "image/jpeg", "image/png"}
ALLOWED_AVATAR_MIMES = {"image/jpeg", "image/png", "image/webp"}


def detect_file_type_from_bytes(header: bytes) -> Optional[str]:
    """Detects MIME type from magic byte signature."""
    if header.startswith(PDF_MAGIC):
        return "application/pdf"
    if header.startswith(PNG_MAGIC):
        return "image/png"
    if header.startswith(JPEG_MAGIC):
        return "image/jpeg"
    if header.startswith(WEBP_RIFF) and len(header) >= 12 and header[8:12] == WEBP_WEBP:
        return "image/webp"
    return None


def validate_file_content(
    file_obj: BinaryIO,
    declared_mime: Optional[str],
    allowed_mimes: Set[str],
    max_size_bytes: int,
) -> Tuple[str, int, bytes]:
    """
    Validates file content:
    - Reads initial chunk to detect magic signature
    - Enforces streaming size limit
    - Rejects empty files
    - Rejects mismatched MIME types
    - Returns verified MIME type, total size in bytes, and the read header bytes
    """
    header = file_obj.read(512)
    if not header or len(header) == 0:
        raise ValidationError(message="Uploaded file is empty.", code="FILE_EMPTY")

    detected_mime = detect_file_type_from_bytes(header)
    if not detected_mime or detected_mime not in allowed_mimes:
        raise ValidationError(
            message=f"File type not supported or signature mismatch. Detected: {detected_mime or 'unknown'}",
            code="FILE_TYPE_UNSUPPORTED",
        )

    if declared_mime and declared_mime in allowed_mimes and declared_mime != detected_mime:
        # Client declared a different allowed MIME than actual content
        raise ValidationError(
            message=f"Declared content type '{declared_mime}' does not match actual signature '{detected_mime}'.",
            code="FILE_TYPE_MISMATCH",
        )

    # Count total size while streaming
    total_size = len(header)
    chunk_size = 64 * 1024
    while True:
        chunk = file_obj.read(chunk_size)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > max_size_bytes:
            raise ValidationError(
                message=f"File size exceeds maximum limit of {max_size_bytes // (1024 * 1024)}MB.",
                code="FILE_TOO_LARGE",
            )

    # Rewind stream
    file_obj.seek(0)
    return detected_mime, total_size, header


def sanitize_filename(filename: Optional[str]) -> str:
    """Sanitizes untrusted original filename for safe Content-Disposition headers."""
    if not filename:
        return "download.bin"
    # Remove path separators and null bytes
    cleaned = re.sub(r"[\r\n\0/\\]", "_", filename)
    # Remove non-ascii or control characters
    cleaned = re.sub(r"[^\w\.\-\_ ]", "_", cleaned).strip()
    return cleaned[:100] or "download.bin"
