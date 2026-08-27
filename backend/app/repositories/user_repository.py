from typing import Optional, List, Any
from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import User


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_id(self, user_id: Any, db: Optional[Session] = None) -> Optional[User]:
        session = db or self.db
        stmt = select(User).where(User.id == str(user_id))
        return session.scalars(stmt).first()

    def get_by_public_id(self, public_id: str) -> Optional[User]:
        stmt = select(User).where(User.public_id == str(public_id))
        return self.db.scalars(stmt).first()

    def get_by_email_normalized(self, email: str) -> Optional[User]:
        norm = email.strip().lower()
        stmt = select(User).where((User.email_normalized == norm) | (User.email == norm))
        return self.db.scalars(stmt).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.get_by_email_normalized(email)

    def create_user(
        self,
        email: str,
        password_hash: str,
        full_name: Optional[str] = None,
        expected_due_date: Optional[str] = None,
        phone: Optional[str] = None,
        role: str = "user",
        status: str = "active",
    ) -> User:
        norm_email = email.strip().lower()
        user = User(
            email=norm_email,
            email_normalized=norm_email,
            password_hash=password_hash,
            full_name=full_name,
            expected_due_date=expected_due_date,
            phone=phone,
            role=role,
            status=status,
        )
        self.db.add(user)
        self.db.flush()
        return user

    def update_password_hash(self, user_id: str, new_password_hash: str) -> None:
        stmt = (
            update(User)
            .where(User.id == str(user_id))
            .values(
                password_hash=new_password_hash,
                password_changed_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
        )
        self.db.execute(stmt)

    def update_last_login(self, user_id: str) -> None:
        stmt = (
            update(User)
            .where(User.id == str(user_id))
            .values(last_login_at=datetime.now(timezone.utc))
        )
        self.db.execute(stmt)

    def mark_email_verified(self, user_id: str) -> None:
        stmt = (
            update(User)
            .where(User.id == str(user_id))
            .values(
                email_verified_at=datetime.now(timezone.utc),
                status="active",
                updated_at=datetime.now(timezone.utc),
            )
        )
        self.db.execute(stmt)

    def update_status(self, user_id: str, status: str) -> None:
        stmt = (
            update(User)
            .where(User.id == str(user_id))
            .values(status=status, updated_at=datetime.now(timezone.utc))
        )
        self.db.execute(stmt)
