# MatriGluco Backend Security Architecture & Threat Model

---

## 1. Local Authentication & Authorization Architecture

### 1.1 Password Hashing & Policy
- **Cryptographic Standard**: Argon2id via `pwdlib[argon2]` / `argon2-cffi`.
- **Parameters**: `time_cost=3`, `memory_cost=65536` (64 MiB), `parallelism=4`.
- **Zero Raw Password Rule**: Raw passwords exist only in memory during the minimal validation/hashing cycle; never persisted, never logged, never placed into audit logs, security events, Redis, or Celery.
- **Migrated Users (`password_hash IS NULL`)**: Migrated accounts without an application-owned Argon2 hash are strictly rejected from empty/default password logins; must be activated via the secure one-time account activation / password reset flow.

### 1.2 Access Tokens (JWT)
- **Format**: Signed JSON Web Token (HS256).
- **Lifetime**: 15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES=15`).
- **Subject (`sub`)**: Authoritative User UUID string (`users.id`).
- **Claims**: `sub`, `role`, `type="access"`, `jti` (unique UUID), `iat`, `exp`.
- **Validation**: Strict signature verification, expiration check, and `type == "access"` enforcement. Tokens with `alg=none` or invalid signatures are rejected.

### 1.3 Refresh Tokens & Session Rotation
- **Format**: High-entropy opaque random strings (`secrets.token_urlsafe(48)`), NOT JWTs.
- **Storage**: Only SHA-256 hex digests are persisted in `user_sessions.token_hash`. Raw refresh tokens are returned to the client once upon issuance and never stored.
- **Rotation Lifecycle**: Every successful refresh atomically revokes the old session, creates a new session in the same `token_family_id`, and issues a new token pair.
- **Replay & Reuse Detection**: If an already rotated or revoked refresh token is presented, the system detects replay, triggers an `AUTH_REFRESH_REUSE_DETECTED` security event, and immediately revokes all active sessions in the compromised token family.
- **Revocation**:
  - `POST /api/v1/auth/logout`: Revokes the current session.
  - `POST /api/v1/auth/logout-all`: Revokes all active refresh sessions for the authenticated user.
  - Password reset automatically revokes all active refresh sessions for the user.

### 1.4 Account Recovery & Email Verification
- **One-Time Opaque Tokens**: Generated with `secrets.token_urlsafe(48)`, stored only as SHA-256 hashes in `auth_tokens`.
- **Forgot Password**: Generates one-time `password_reset` token with 30-minute expiration. Returns generic public responses to prevent user enumeration.
- **Reset Password**: Validates token hash, consumes token (single use), establishes new Argon2 password hash, and revokes all active refresh sessions.
- **Email Verification**: One-time `email_verification` token marks `email_verified_at` and transitions user status to active.

### 1.5 Ownership & Authorization Scoping
- **Actor Identity**: Derived strictly from verified JWT `sub` via `get_current_user` dependency.
- **Zero Frontend Ownership**: Request payloads cannot supply `user_id` for ownership; all user-scoped SQL queries enforce `WHERE user_id = :authenticated_user_id AND id = :resource_id`.
- **IDOR Protection**: Guessed IDs belonging to other users return `404 Not Found` to prevent resource existence disclosure.

---

## 2. Threat Model & Safeguards

| Threat | Target Surface | Technical Safeguard Implemented | Verification Test |
| :--- | :--- | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | `/predictions`, `/reports`, `/files`, `/consultations`, `/notifications`, `/pregnancies`, `/tasks`, `/chatbot` | Backend derives actor ownership strictly from verified JWT `sub` identity. SQL queries enforce `WHERE user_id = actor.id`. Cross-user access returns `404 Not Found`. | `tests/api/test_ownership_security.py` |
| **Privilege Escalation via Database** | MySQL / MariaDB engine connection | Production startup strictly rejects running as MySQL `root`. Runtime accounts (`matrigluco_app`) receive only least-privilege DML grants on `matrigluco.*`. | `tests/unit/test_config.py`, `app/db/engine.py` |
| **Malicious File Upload / Path Traversal** | `/api/v1/files/upload` | Enforces `MAX_UPLOAD_SIZE_MB`, inspects magic byte signatures (`%PDF`, `\x89PNG`, `\xff\xd8\xff`), generates random UUID keys, and verifies canonical path remains strictly inside `PRIVATE_STORAGE_ROOT`. | `tests/unit/security/test_upload_validation.py`, `tests/unit/test_storage.py` |
| **Credential / Token Leakage in Logs** | HTTP Middleware & Application Loggers | `SensitiveDataFilter` actively redacts passwords, Bearer access tokens, refresh token hashes, API keys, and sensitive medical report text. | `tests/unit/security/test_log_redaction.py` |
| **Brute Force & Credential Stuffing** | `/api/v1/auth/login`, `/refresh`, `/forgot-password` | Redis sliding window rate counters with SHA-256 identity hashing. Exceeded limits return `429 Too Many Requests`. | `tests/unit/cache/test_rate_limits.py`, `tests/api/test_auth.py` |
| **Refresh Token Replay & Theft** | `/api/v1/auth/refresh` | Token-family tracking with atomic single-use rotation. Replay detection revokes entire family and persists `AUTH_REFRESH_REUSE_DETECTED` security event. | `tests/integration/test_auth_sessions.py`, `tests/integration/test_security_events.py` |
| **Mass Assignment** | Pydantic Request DTOs | Request schemas configure `model_config = ConfigDict(extra="forbid")`, rejecting unauthorized field injections (e.g. `user_id`, `role`, `status`). | `tests/api/test_profiles.py`, `tests/api/test_health_measurements.py` |
| **Missing Third-Party OCR Consent** | `/api/v1/reports` processing pipeline | External OCR transmission is gated by active `ConsentRecord` (`third_party_ocr_processing`, `ocr-third-party-v1`). Missing consent safely aborts with `OCR_CONSENT_MISSING`. | `tests/integration/test_consent.py` |

---

## 3. Audit & Security Event Taxonomy

### Audit Events (`audit_logs`)
- `AUTH_REGISTER`: New user account creation.
- `AUTH_LOGIN_SUCCEEDED`: Successful credential verification and token issuance.
- `AUTH_LOGOUT`: Explicit session revocation.
- `AUTH_LOGOUT_ALL`: User-initiated revocation of all active refresh sessions.
- `AUTH_PASSWORD_CHANGED`: Authenticated password change.
- `AUTH_PASSWORD_RESET`: Password recovery completion via one-time token.
- `AUTH_EMAIL_VERIFIED`: Email verification token consumed.

### Security Events (`security_events`)
- `AUTH_LOGIN_FAILURE`: Invalid credentials attempt.
- `AUTH_REFRESH_REUSE_DETECTED`: Replay of an already rotated/revoked refresh token.
- `AUTH_INVALID_TOKEN`: Malformed, expired, or tampered access token presentation.
- `AUTHORIZATION_DENIED`: Cross-user resource access attempt or unauthorized privilege escalation.

---

## 4. Hardened Security Headers
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (enforced in `APP_ENV=production`)

---

## 5. Database Least-Privilege Grants
```sql
-- Production application user provisioning
CREATE USER IF NOT EXISTS 'matrigluco_app'@'localhost' IDENTIFIED BY 'StrongAppPasswordHere!';
GRANT SELECT, INSERT, UPDATE, DELETE ON matrigluco.* TO 'matrigluco_app'@'localhost';
FLUSH PRIVILEGES;
```
