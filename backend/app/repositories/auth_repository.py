import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.auth import UserSession, AuthToken


class AuthRepository:
    """
    Data repository for managing refresh token sessions and one-time authentication tokens.
    Provides row-locking queries (`FOR UPDATE`) for atomic rotation and replay prevention.
    """

    def __init__(self, db: Session):
        self.db = db

    # ── Refresh Token Sessions ────────────────────────────────────────────────

    def create_session(
        self,
        user_id: str,
        token_hash: str,
        token_family_id: str,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_hash: Optional[str] = None,
    ) -> UserSession:
        session = UserSession(
            user_id=str(user_id),
            token_hash=token_hash,
            token_family_id=token_family_id,
            status="active",
            expires_at=expires_at,
            last_used_at=datetime.now(timezone.utc),
            user_agent=user_agent,
            ip_hash=ip_hash,
        )
        self.db.add(session)
        self.db.flush()
        return session

    def get_session_by_token_hash_for_update(self, token_hash: str) -> Optional[UserSession]:
        """Locks session row FOR UPDATE to safely prevent concurrent double-refresh."""
        stmt = select(UserSession).where(UserSession.token_hash == token_hash).with_for_update()
        return self.db.scalars(stmt).first()

    def get_session_by_public_id_and_user_id(
        self, public_id: str, user_id: str
    ) -> Optional[UserSession]:
        stmt = select(UserSession).where(
            UserSession.public_id == str(public_id),
            UserSession.user_id == str(user_id),
        )
        return self.db.scalars(stmt).first()

    def list_active_sessions_for_user(self, user_id: str) -> List[UserSession]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(UserSession)
            .where(
                UserSession.user_id == str(user_id),
                UserSession.status == "active",
                UserSession.expires_at > now,
            )
            .order_by(UserSession.last_used_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def rotate_session(
        self,
        old_session: UserSession,
        new_token_hash: str,
        new_expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_hash: Optional[str] = None,
    ) -> UserSession:
        """
        Atomically marks old session rotated and creates the replacement session
        in the same token family.
        """
        now = datetime.now(timezone.utc)
        old_session.status = "rotated"
        old_session.revoked_at = now
        old_session.revocation_reason = "rotation"
        old_session.last_used_at = now
        self.db.add(old_session)

        new_session = UserSession(
            user_id=old_session.user_id,
            token_hash=new_token_hash,
            token_family_id=old_session.token_family_id,
            status="active",
            expires_at=new_expires_at,
            last_used_at=now,
            user_agent=user_agent or old_session.user_agent,
            ip_hash=ip_hash or old_session.ip_hash,
        )
        self.db.add(new_session)
        self.db.flush()
        return new_session

    def revoke_session(self, session: UserSession, reason: str = "logout") -> None:
        now = datetime.now(timezone.utc)
        session.status = "revoked"
        session.revoked_at = now
        session.revocation_reason = reason
        session.last_used_at = now
        self.db.add(session)

    def revoke_family(self, token_family_id: str, reason: str = "refresh_reuse") -> int:
        """Revokes all sessions in a token family upon reuse detection."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(UserSession)
            .where(
                UserSession.token_family_id == token_family_id,
                UserSession.status.in_(["active", "rotated"]),
            )
            .values(
                status="compromised" if reason == "refresh_reuse" else "revoked",
                revoked_at=now,
                revocation_reason=reason,
            )
        )
        result = self.db.execute(stmt)
        return result.rowcount or 0

    def revoke_all_user_sessions(self, user_id: str, reason: str = "logout_all") -> int:
        now = datetime.now(timezone.utc)
        stmt = (
            update(UserSession)
            .where(
                UserSession.user_id == str(user_id),
                UserSession.status.in_(["active", "rotated"]),
            )
            .values(
                status="revoked",
                revoked_at=now,
                revocation_reason=reason,
            )
        )
        result = self.db.execute(stmt)
        return result.rowcount or 0

    # ── One-Time Auth Tokens (Reset / Verification) ───────────────────────────

    def create_auth_token(
        self,
        user_id: str,
        token_hash: str,
        token_type: str,
        expires_at: datetime,
    ) -> AuthToken:
        auth_token = AuthToken(
            user_id=str(user_id),
            token_hash=token_hash,
            token_type=token_type,
            expires_at=expires_at,
        )
        self.db.add(auth_token)
        self.db.flush()
        return auth_token

    def get_auth_token_by_hash_for_update(
        self,
        token_hash: str,
        token_type: str,
    ) -> Optional[AuthToken]:
        stmt = (
            select(AuthToken)
            .where(
                AuthToken.token_hash == token_hash,
                AuthToken.token_type == token_type,
            )
            .with_for_update()
        )
        return self.db.scalars(stmt).first()

    def consume_auth_token(self, auth_token: AuthToken) -> None:
        now = datetime.now(timezone.utc)
        auth_token.consumed_at = now
        self.db.add(auth_token)

    def revoke_auth_tokens_for_user(self, user_id: str, token_type: str) -> None:
        now = datetime.now(timezone.utc)
        stmt = (
            update(AuthToken)
            .where(
                AuthToken.user_id == str(user_id),
                AuthToken.token_type == token_type,
                AuthToken.consumed_at.is_(None),
                AuthToken.revoked_at.is_(None),
            )
            .values(revoked_at=now)
        )
        self.db.execute(stmt)
