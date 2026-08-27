from typing import List
from app.core.exceptions import AuthorizationError
from app.core.constants import UserRole


def check_role_permission(user_role: str, allowed_roles: List[str]) -> None:
    """Verifies that the user role matches at least one allowed role."""
    if user_role not in allowed_roles:
        raise AuthorizationError(
            message=f"Access forbidden: role '{user_role}' lacks required permissions."
        )


def is_admin_role(user_role: str) -> bool:
    """Returns True if the role is admin."""
    return user_role == UserRole.ADMIN
