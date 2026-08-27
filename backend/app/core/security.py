import hashlib
import hmac
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt
from jwt.exceptions import PyJWTError, ExpiredSignatureError, InvalidTokenError
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends

from app.core.config import get_settings
from app.core.exceptions import (
    InvalidAccessTokenError,
    ExpiredAccessTokenError,
    AuthenticationRequiredError,
)

settings = get_settings()

# Initialize Argon2id password hasher with configured cryptographic parameters
ph = PasswordHasher(
    time_cost=settings.ARGON2_TIME_COST,
    memory_cost=settings.ARGON2_MEMORY_COST,
    parallelism=settings.ARGON2_PARALLELISM,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# ─── Password Security (Argon2id + Bcrypt Fallback) ───────────────────────────


def get_password_hash(password: str) -> str:
    """Generates a cryptographically strong Argon2id password hash."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies plain password against Argon2 hash, with automatic fallback to bcrypt.
    """
    if not hashed_password or not plain_password:
        return False

    # Check for Argon2 hash format
    if hashed_password.startswith("$argon2"):
        try:
            return ph.verify(hashed_password, plain_password)
        except VerifyMismatchError:
            return False
        except Exception:
            return False

    # Fallback for existing legacy bcrypt hashes
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def validate_password_strength(password: str) -> None:
    """
    Enforces password length policy (min 8 characters, max 128 characters).
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if len(password) > 128:
        raise ValueError("Password cannot exceed 128 characters.")


# ─── JWT Access Token Management ──────────────────────────────────────────────


def create_access_token(
    user_id: str,
    role: str = "user",
    extra_claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Creates a signed, short-lived JWT access token containing standard identity claims.
    """
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    claims = {
        "sub": str(user_id),
        "role": str(role),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
        "type": "access",
    }

    if extra_claims:
        claims.update(extra_claims)

    return jwt.encode(
        claims,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT access token's signature, algorithm, expiration, and token type.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["sub", "exp", "iat", "type"]},
        )
        if payload.get("type") != "access":
            raise InvalidAccessTokenError(message="Invalid token type: expected access token.")
        return payload
    except ExpiredSignatureError:
        raise ExpiredAccessTokenError(message="Authentication access token has expired.")
    except (PyJWTError, Exception) as exc:
        raise InvalidAccessTokenError(message=f"Could not validate access credentials: {exc}")


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Safe token decode returning None on error for compatibility."""
    try:
        return decode_access_token(token)
    except Exception:
        return None


# ─── Opaque Token Generation & Hashing ────────────────────────────────────────


def generate_opaque_token(prefix: str = "rt_") -> str:
    """
    Generates a cryptographically secure, high-entropy opaque token (e.g. for refresh or reset tokens).
    """
    return f"{prefix}{secrets.token_urlsafe(48)}"


def hash_token(token: str) -> str:
    """
    Produces deterministic SHA-256 hex digest of an opaque token for indexed database storage.
    Raw tokens are never persisted in the database.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


hash_opaque_token = hash_token


def constant_time_compare(val1: str, val2: str) -> bool:
    """Performs constant-time string comparison to prevent timing attacks."""
    return hmac.compare_digest(val1.encode("utf-8"), val2.encode("utf-8"))


# ─── Fast Dependency Helpers ──────────────────────────────────────────────────


def get_current_user_id(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """Extracts subject user_id from Bearer token if valid, otherwise None."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        return payload.get("sub")
    except Exception:
        return None
