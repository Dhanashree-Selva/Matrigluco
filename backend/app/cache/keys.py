"""
Centralized Redis Key Factory for MatriGluco.

Enforces:
1. 'matrigluco:' namespace prefix on all keys.
2. Scoped idempotency and rate-limiting keys.
3. SHA-256 hashing for sensitive rate limit identities (e.g. emails).
4. No sensitive secrets or full medical payloads inside key names.
"""

import hashlib
from typing import Optional


def _hash_identifier(raw_identifier: str) -> str:
    """Generates deterministic SHA-256 hex digest for sensitive identifiers."""
    return hashlib.sha256(raw_identifier.strip().lower().encode("utf-8")).hexdigest()


# ─── Application Dashboard & Summary Keys ─────────────────────────────────────


def user_dashboard_key(user_id: str) -> str:
    """Transient user dashboard summary key."""
    return f"matrigluco:v1:dashboard:user:{user_id}"


def user_summary_key(user_id: str) -> str:
    """Transient user health summary key."""
    return f"matrigluco:v1:user:{user_id}:summary"


# ─── Rate Limiting Keys ───────────────────────────────────────────────────────


def rate_limit_key(scope: str, raw_identifier: str) -> str:
    """
    Constructs privacy-preserving rate limit key using SHA-256 hashed identity.
    e.g. 'matrigluco:rate:login:<sha256>'
    """
    ident_hash = _hash_identifier(raw_identifier)
    return f"matrigluco:rate:{scope}:{ident_hash}"


# ─── Idempotency Keys ─────────────────────────────────────────────────────────


def idempotency_key(scope: str, user_id: str, client_key: str) -> str:
    """
    Constructs user-scoped idempotency key to prevent cross-user collisions.
    e.g. 'matrigluco:idempotency:user:{user_id}:{scope}:{client_key}'
    """
    return f"matrigluco:idempotency:user:{user_id}:{scope}:{client_key}"


# ─── Distributed Lock Keys ────────────────────────────────────────────────────


def distributed_lock_key(resource_type: str, resource_id: str) -> str:
    """
    Constructs distributed concurrency lock key.
    e.g. 'matrigluco:lock:report:{report_id}'
    """
    return f"matrigluco:lock:{resource_type}:{resource_id}"


# ─── Transient Chat Context Keys ──────────────────────────────────────────────


def chat_context_key(conversation_id: str) -> str:
    """
    Constructs transient session chat context key in Redis DB /0.
    Reconstructable at any time from MySQL chat_messages.
    """
    return f"matrigluco:chat:{conversation_id}:context"
