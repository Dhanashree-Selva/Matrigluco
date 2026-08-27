import hashlib


def sha256_hash(data: str) -> str:
    """Computes hex digest of SHA-256 hash."""
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def sha256_file(file_bytes: bytes) -> str:
    """Computes SHA-256 checksum for binary file content."""
    return hashlib.sha256(file_bytes).hexdigest()
