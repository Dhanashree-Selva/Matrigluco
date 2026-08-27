import uuid


def generate_uuid() -> str:
    """Generates standard RFC 4122 v4 UUID string."""
    return str(uuid.uuid4())


def is_valid_uuid(val: str) -> bool:
    """Validates if a string is a valid UUID."""
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError, TypeError):
        return False
