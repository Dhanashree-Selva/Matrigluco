import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserUpdate
from app.core.exceptions import ResourceNotFoundError
from app.core.security import get_password_hash

logger = logging.getLogger("matrigluco.services.user")


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def get_user_by_id(self, user_id: str) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundError(resource="User", identifier=user_id)
        return UserResponse.model_validate(user)

    def update_user(self, user_id: str, payload: UserUpdate) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundError(resource="User", identifier=user_id)

        data = payload.model_dump(exclude_unset=True)
        if "password" in data and data["password"]:
            data["password_hash"] = get_password_hash(data.pop("password"))

        updated = self.user_repo.update(user, data)
        return UserResponse.model_validate(updated)
