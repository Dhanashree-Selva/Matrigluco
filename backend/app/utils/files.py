import re
import uuid
from pathlib import Path
from typing import Tuple, List, Optional
from app.core.exceptions import ValidationError

FILE_SIGNATURES = {
    "application/pdf": [b"%PDF"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/jpeg": [b"\xff\xd8\xff"],
}


def sanitize_filename(filename: str) -> str:
    """Strips path characters and normalizes file basename."""
    base = Path(filename).name
    # Replace non-alphanumeric (except dots, dashes, underscores)
    cleaned = re.sub(r"[^\w.\-]", "_", base)
    return cleaned


def generate_unique_file_id(original_filename: str) -> Tuple[str, str]:
    """
    Generates UUID file key and safe extension.
    Returns (unique_identifier, extension)
    """
    ext = Path(original_filename).suffix.lstrip(".").lower() or "bin"
    file_id = str(uuid.uuid4())
    return f"{file_id}.{ext}", ext


def validate_file_content(
    content: bytes,
    allowed_types: Optional[List[str]] = None,
    max_size_bytes: int = 10 * 1024 * 1024,
) -> str:
    """
    Validates file size and inspects file magic byte signatures.
    Returns detected valid MIME type.
    """
    if len(content) == 0:
        raise ValidationError(message="Uploaded file is empty.", code="EMPTY_FILE")

    if len(content) > max_size_bytes:
        raise ValidationError(
            message=f"File exceeds maximum allowed size ({max_size_bytes // (1024 * 1024)} MB).",
            code="FILE_TOO_LARGE",
        )

    allowed = allowed_types or ["application/pdf", "image/png", "image/jpeg"]

    detected_mime = None
    for mime, signatures in FILE_SIGNATURES.items():
        for sig in signatures:
            if content.startswith(sig):
                detected_mime = mime
                break
        if detected_mime:
            break

    if not detected_mime or detected_mime not in allowed:
        raise ValidationError(
            message="Invalid file content signature. Disallowed or corrupted file format.",
            code="INVALID_FILE_SIGNATURE",
        )

    return detected_mime
