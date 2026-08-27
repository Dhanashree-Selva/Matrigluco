import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_opaque_token,
    hash_token,
    validate_password_strength,
)
from app.core.exceptions import (
    ConflictError,
    InvalidCredentialsError,
    AccountDisabledError,
    InvalidRefreshTokenError,
    RefreshTokenExpiredError,
    RefreshTokenReuseDetectedError,
    InvalidCurrentPasswordError,
    InvalidAuthTokenError,
    ExpiredAuthTokenError,
    ConsumedAuthTokenError,
    SessionNotFoundError,
)
from app.models.user import User
from app.models.auth import UserSession
from app.repositories.user_repository import UserRepository
from app.repositories.auth_repository import AuthRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenPairResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SessionResponse,
    SessionListResponse,
)
from app.schemas.user import UserResponse

logger = logging.getLogger("matrigluco.services.auth")
settings = get_settings()


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensures datetime object is UTC-aware for accurate expiry comparisons."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


class AuthService:
    """
    Authoritative authentication service managing user registration, Argon2 credential verification,
    JWT access token issuance, atomic refresh token rotation, token-family reuse detection,
    one-time password reset/verification workflows, and security audit logging.
    """

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.auth_repo = AuthRepository(db)
        self.audit_repo = AuditRepository(db)

    # ── User Registration ─────────────────────────────────────────────────────

    def register_user(
        self,
        payload: RegisterRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenPairResponse:
        validate_password_strength(payload.password)
        normalized_email = payload.email.strip().lower()

        existing = self.user_repo.get_by_email_normalized(normalized_email)
        if existing:
            raise ConflictError(message=f"A user with email '{normalized_email}' already exists.")

        try:
            password_hash = get_password_hash(payload.password)
            user = self.user_repo.create_user(
                email=normalized_email,
                password_hash=password_hash,
                full_name=payload.full_name,
                expected_due_date=payload.expected_due_date,
                phone=payload.phone,
                role="user",
                status="active",
            )

            # Issue initial credential pair
            access_token = create_access_token(user_id=user.id, role=user.role)
            raw_refresh = generate_opaque_token("rt_")
            refresh_hash = hash_token(raw_refresh)
            family_id = str(uuid.uuid4())
            expires_at = datetime.now(timezone.utc) + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )

            ip_hash = hash_token(ip_address) if ip_address else None
            self.auth_repo.create_session(
                user_id=user.id,
                token_hash=refresh_hash,
                token_family_id=family_id,
                expires_at=expires_at,
                user_agent=user_agent,
                ip_hash=ip_hash,
            )

            self.audit_repo.record_event(
                event_type="AUTH_REGISTER",
                user_id=user.id,
                details={"email": normalized_email, "role": user.role},
                ip_address=ip_address,
                user_agent=user_agent,
            )

            self.db.commit()

            return TokenPairResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                refresh_token=raw_refresh,
                user=UserResponse.model_validate(user).model_dump(),
            )
        except Exception:
            self.db.rollback()
            raise

    # ── User Authentication (Login) ───────────────────────────────────────────

    def authenticate_user(
        self,
        payload: LoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenPairResponse:
        normalized_email = payload.email.strip().lower()
        user = self.user_repo.get_by_email_normalized(normalized_email)

        if not user or not verify_password(payload.password, user.password_hash):
            self.audit_repo.record_event(
                event_type="AUTH_LOGIN_FAILURE",
                user_id=user.id if user else None,
                details={"attempted_email": normalized_email, "reason": "invalid_credentials"},
                ip_address=ip_address,
                user_agent=user_agent,
            )
            self.db.commit()
            raise InvalidCredentialsError()

        if user.status == "disabled":
            self.audit_repo.record_event(
                event_type="AUTH_ACCOUNT_DISABLED_LOGIN_ATTEMPT",
                user_id=user.id,
                details={"email": normalized_email},
                ip_address=ip_address,
                user_agent=user_agent,
            )
            self.db.commit()
            raise AccountDisabledError()

        try:
            self.user_repo.update_last_login(user.id)

            access_token = create_access_token(user_id=user.id, role=user.role)
            raw_refresh = generate_opaque_token("rt_")
            refresh_hash = hash_token(raw_refresh)
            family_id = str(uuid.uuid4())
            expires_at = datetime.now(timezone.utc) + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )

            ip_hash = hash_token(ip_address) if ip_address else None
            self.auth_repo.create_session(
                user_id=user.id,
                token_hash=refresh_hash,
                token_family_id=family_id,
                expires_at=expires_at,
                user_agent=user_agent,
                ip_hash=ip_hash,
            )

            self.audit_repo.record_event(
                event_type="AUTH_LOGIN_SUCCESS",
                user_id=user.id,
                details={"email": normalized_email, "family_id": family_id},
                ip_address=ip_address,
                user_agent=user_agent,
            )

            self.db.commit()

            return TokenPairResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                refresh_token=raw_refresh,
                user=UserResponse.model_validate(user).model_dump(),
            )
        except Exception:
            self.db.rollback()
            raise

    # ── Refresh Token Rotation with Reuse Detection ───────────────────────────

    def refresh_tokens(
        self,
        raw_refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenPairResponse:
        refresh_hash = hash_token(raw_refresh_token)

        try:
            session = self.auth_repo.get_session_by_token_hash_for_update(refresh_hash)
            if not session:
                raise InvalidRefreshTokenError(message="Invalid or unrecognized refresh token.")

            # ── Token Reuse Detection ──
            if session.status in ["rotated", "revoked", "compromised"]:
                # Token has already been used or revoked — probable token compromise!
                revoked_count = self.auth_repo.revoke_family(
                    session.token_family_id,
                    reason="refresh_reuse",
                )
                self.audit_repo.record_event(
                    event_type="AUTH_REFRESH_REUSE_DETECTED",
                    user_id=session.user_id,
                    details={
                        "token_family_id": session.token_family_id,
                        "session_public_id": session.public_id,
                        "revoked_sessions": revoked_count,
                    },
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                self.db.commit()
                logger.warning(
                    f"Security Alert: Refresh token reuse detected for user {session.user_id} in family {session.token_family_id}!"
                )
                raise RefreshTokenReuseDetectedError()

            # Verify expiration
            now = datetime.now(timezone.utc)
            session_exp = ensure_utc(session.expires_at)
            if session_exp and session_exp < now:
                self.auth_repo.revoke_session(session, reason="expired")
                self.db.commit()
                raise RefreshTokenExpiredError()

            user = self.user_repo.get_by_id(session.user_id)
            if not user or user.status == "disabled":
                raise AccountDisabledError()

            # Atomic rotation: issue new opaque refresh token and revoke old token
            new_raw_refresh = generate_opaque_token("rt_")
            new_refresh_hash = hash_token(new_raw_refresh)
            new_expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            ip_hash = hash_token(ip_address) if ip_address else None

            self.auth_repo.rotate_session(
                old_session=session,
                new_token_hash=new_refresh_hash,
                new_expires_at=new_expires_at,
                user_agent=user_agent,
                ip_hash=ip_hash,
            )

            new_access_token = create_access_token(user_id=user.id, role=user.role)

            self.audit_repo.record_event(
                event_type="AUTH_REFRESH",
                user_id=user.id,
                details={"token_family_id": session.token_family_id},
                ip_address=ip_address,
                user_agent=user_agent,
            )

            self.db.commit()

            return TokenPairResponse(
                access_token=new_access_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                refresh_token=new_raw_refresh,
                user=UserResponse.model_validate(user).model_dump(),
            )
        except Exception:
            self.db.rollback()
            raise

    # ── Session Management (Logout / Logout-All) ──────────────────────────────

    def logout(self, raw_refresh_token: str) -> None:
        try:
            refresh_hash = hash_token(raw_refresh_token)
            session = self.auth_repo.get_session_by_token_hash_for_update(refresh_hash)
            if session and session.status == "active":
                self.auth_repo.revoke_session(session, reason="logout")
                self.audit_repo.record_event(
                    event_type="AUTH_LOGOUT",
                    user_id=session.user_id,
                    details={"session_public_id": session.public_id},
                )
                self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def logout_all(self, user_id: str) -> None:
        try:
            revoked_count = self.auth_repo.revoke_all_user_sessions(user_id, reason="logout_all")
            self.audit_repo.record_event(
                event_type="AUTH_LOGOUT_ALL",
                user_id=user_id,
                details={"revoked_count": revoked_count},
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def list_user_sessions(self, user_id: str) -> SessionListResponse:
        sessions = self.auth_repo.list_active_sessions_for_user(user_id)
        session_responses = [
            SessionResponse(
                id=s.public_id,
                created_at=s.created_at,
                last_used_at=s.last_used_at,
                expires_at=s.expires_at,
                user_agent=s.user_agent,
                status=s.status,
            )
            for s in sessions
        ]
        return SessionListResponse(sessions=session_responses, total=len(session_responses))

    def revoke_user_session(self, user_id: str, session_public_id: str) -> None:
        session = self.auth_repo.get_session_by_public_id_and_user_id(
            public_id=session_public_id,
            user_id=user_id,
        )
        if not session:
            raise SessionNotFoundError()

        try:
            self.auth_repo.revoke_session(session, reason="user_revoked")
            self.audit_repo.record_event(
                event_type="AUTH_SESSION_REVOKED",
                user_id=user_id,
                details={"session_public_id": session.public_id},
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    # ── Password Modification & Recovery ──────────────────────────────────────

    def change_password(self, user_id: str, payload: ChangePasswordRequest) -> None:
        validate_password_strength(payload.new_password)
        try:
            user = self.user_repo.get_by_id(user_id)
            if not user or not verify_password(payload.current_password, user.password_hash):
                raise InvalidCurrentPasswordError()

            new_password_hash = get_password_hash(payload.new_password)
            self.user_repo.update_password_hash(user.id, new_password_hash)

            # Invalidate all active refresh sessions upon password change
            self.auth_repo.revoke_all_user_sessions(user.id, reason="password_change")

            self.audit_repo.record_event(
                event_type="AUTH_PASSWORD_CHANGED",
                user_id=user.id,
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def forgot_password(self, payload: ForgotPasswordRequest) -> None:
        """
        Initiates password reset workflow. Non-enumerating: always succeeds publicly.
        """
        normalized_email = payload.email.strip().lower()
        user = self.user_repo.get_by_email_normalized(normalized_email)
        if not user or user.status == "disabled":
            return

        try:
            # Revoke existing pending password reset tokens
            self.auth_repo.revoke_auth_tokens_for_user(user.id, "password_reset")

            raw_token = generate_opaque_token("rst_")
            token_hash = hash_token(raw_token)
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

            self.auth_repo.create_auth_token(
                user_id=user.id,
                token_hash=token_hash,
                token_type="password_reset",
                expires_at=expires_at,
            )

            self.audit_repo.record_event(
                event_type="AUTH_PASSWORD_RESET_REQUESTED",
                user_id=user.id,
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def reset_password(self, payload: ResetPasswordRequest) -> None:
        validate_password_strength(payload.new_password)
        token_hash = hash_token(payload.token)

        try:
            auth_token = self.auth_repo.get_auth_token_by_hash_for_update(
                token_hash, "password_reset"
            )
            if not auth_token:
                raise InvalidAuthTokenError(message="Invalid or unrecognized password reset token.")

            if auth_token.consumed_at is not None:
                raise ConsumedAuthTokenError(
                    message="This password reset token has already been consumed."
                )

            if auth_token.revoked_at is not None:
                raise InvalidAuthTokenError(message="This password reset token has been revoked.")

            now = datetime.now(timezone.utc)
            token_exp = ensure_utc(auth_token.expires_at)
            if token_exp and token_exp < now:
                raise ExpiredAuthTokenError(message="This password reset token has expired.")

            user = self.user_repo.get_by_id(auth_token.user_id)
            if not user or user.status == "disabled":
                raise AccountDisabledError()

            new_password_hash = get_password_hash(payload.new_password)
            self.user_repo.update_password_hash(user.id, new_password_hash)
            self.auth_repo.consume_auth_token(auth_token)

            # Invalidate all active sessions upon password reset
            self.auth_repo.revoke_all_user_sessions(user.id, reason="password_reset")

            self.audit_repo.record_event(
                event_type="AUTH_PASSWORD_RESET_COMPLETED",
                user_id=user.id,
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    # ── Email Verification ────────────────────────────────────────────────────

    def verify_email(self, token: str) -> None:
        token_hash = hash_token(token)
        try:
            auth_token = self.auth_repo.get_auth_token_by_hash_for_update(
                token_hash, "email_verification"
            )
            if not auth_token:
                raise InvalidAuthTokenError(
                    message="Invalid or unrecognized email verification token."
                )

            if auth_token.consumed_at is not None:
                raise ConsumedAuthTokenError(
                    message="This verification token has already been consumed."
                )

            now = datetime.now(timezone.utc)
            token_exp = ensure_utc(auth_token.expires_at)
            if token_exp and token_exp < now:
                raise ExpiredAuthTokenError(message="This email verification token has expired.")

            self.user_repo.mark_email_verified(auth_token.user_id)
            self.auth_repo.consume_auth_token(auth_token)

            self.audit_repo.record_event(
                event_type="AUTH_EMAIL_VERIFIED",
                user_id=auth_token.user_id,
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def resend_verification(self, email: str) -> None:
        """
        Generates and dispatches a new email verification token if user exists and is unverified.
        Non-enumerating: safe for public invocation without disclosing user existence.
        """
        normalized_email = email.strip().lower()
        user = self.user_repo.get_by_email_normalized(normalized_email)
        if not user or user.status == "disabled" or user.email_verified_at is not None:
            return

        try:
            # Revoke existing pending verification tokens
            self.auth_repo.revoke_auth_tokens_for_user(user.id, "email_verification")

            raw_token = generate_opaque_token("vfy_")
            token_hash = hash_token(raw_token)
            expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

            self.auth_repo.create_auth_token(
                user_id=user.id,
                token_hash=token_hash,
                token_type="email_verification",
                expires_at=expires_at,
            )

            self.audit_repo.record_event(
                event_type="AUTH_EMAIL_VERIFICATION_RESENT",
                user_id=user.id,
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise
