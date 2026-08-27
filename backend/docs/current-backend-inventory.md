# Matrigluco Current Backend Inventory & Modernization Baseline

---

## 1. Repository Snapshot

- **Project Root**: `d:\Matrigluco\`
- **Backend Root**: `d:\Matrigluco\backend\`
- **Frontend Root**: `d:\Matrigluco\web\`
- **Architecture Style**: Modular Monolith with Layered Domain Boundaries
- **Runtime Environment**: Python 3.10+ / 3.14 on Windows (Local Dev) & Linux (Production Target)
- **Primary Frameworks**: FastAPI (Web), SQLAlchemy 2.x (ORM), Alembic (Migrations), Redis (Transient Cache/Broker), Celery 5.3+ (Async Tasks), scikit-learn (ML), llama-cpp-python (Local AI).

---

## 2. Backend Entry Points

| Entrypoint | Path | Purpose |
| :--- | :--- | :--- |
| **FastAPI ASGI App** | [`app/main.py`](file:///d:/Matrigluco/backend/app/main.py) | Main HTTP API application factory (`create_app()`), routing, middleware, and lifespan. |
| **Versioned API Gateway** | [`app/api/v1/router.py`](file:///d:/Matrigluco/backend/app/api/v1/router.py) | Canonical `/api/v1` REST routes for all domain services. |
| **Legacy API Gateway** | [`app/api/router.py`](file:///d:/Matrigluco/backend/app/api/router.py) | Backward compatibility layer mounting `/api/` endpoints matching legacy client paths. |
| **Celery Worker App** | [`app/workers/celery_app.py`](file:///d:/Matrigluco/backend/app/workers/celery_app.py) | Background task runtime and queue consumer. |
| **Celery Beat Scheduler** | [`app/workers/schedules.py`](file:///d:/Matrigluco/backend/app/workers/schedules.py) | Periodic scheduled jobs definition (`celery_beat_schedule`). |
| **Alembic CLI** | [`alembic.ini`](file:///d:/Matrigluco/backend/alembic.ini), [`migrations/env.py`](file:///d:/Matrigluco/backend/migrations/env.py) | Authoritative database schema migration execution. |

---

## 3. Current API Routes

### 3.1 Canonical Versioned Routes (`/api/v1/`)

| Method | Path | Source File | Authentication | Persistence | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | `endpoints/auth.py` | Public | MySQL `users`, `auth_sessions`, `audit_logs` | Register new patient account |
| `POST` | `/api/v1/auth/login` | `endpoints/auth.py` | Public | MySQL `auth_sessions`, `security_events` | Authenticate credentials & issue token pair |
| `POST` | `/api/v1/auth/refresh` | `endpoints/auth.py` | Refresh Token | MySQL `auth_sessions`, Redis rate limiter | Atomic token rotation & replay detection |
| `POST` | `/api/v1/auth/logout` | `endpoints/auth.py` | Bearer Token | MySQL `auth_sessions` | Revoke current session |
| `POST` | `/api/v1/auth/logout-all` | `endpoints/auth.py` | Bearer Token | MySQL `auth_sessions` | Revoke all patient sessions |
| `POST` | `/api/v1/auth/change-password` | `endpoints/auth.py` | Bearer Token | MySQL `users`, `auth_sessions` | Update password & revoke other sessions |
| `POST` | `/api/v1/auth/forgot-password` | `endpoints/auth.py` | Public | MySQL `auth_tokens` | Issue one-time password reset token |
| `POST` | `/api/v1/auth/reset-password` | `endpoints/auth.py` | One-Time Token | MySQL `users`, `auth_tokens`, `auth_sessions` | Reset password using verified token |
| `GET` | `/api/v1/users/me` | `endpoints/users.py` | Bearer Token | MySQL `users` | Fetch current user account info |
| `GET` | `/api/v1/profiles/me` | `endpoints/profiles.py` | Bearer Token | MySQL `users` | Fetch patient clinical profile |
| `PATCH` | `/api/v1/profiles/me` | `endpoints/profiles.py` | Bearer Token | MySQL `users`, Redis cache | Update profile & invalidate dashboard cache |
| `GET` | `/api/v1/pregnancies` | `endpoints/pregnancies.py` | Bearer Token | MySQL `users` | List patient pregnancies |
| `POST` | `/api/v1/pregnancies` | `endpoints/pregnancies.py` | Bearer Token | MySQL `users` | Create/update pregnancy record |
| `GET` | `/api/v1/pregnancies/{id}` | `endpoints/pregnancies.py` | Bearer Token | MySQL `users` | Fetch pregnancy detail (IDOR-scoped) |
| `PATCH` | `/api/v1/pregnancies/{id}` | `endpoints/pregnancies.py` | Bearer Token | MySQL `users` | Update pregnancy parameters (IDOR-scoped) |
| `DELETE` | `/api/v1/pregnancies/{id}` | `endpoints/pregnancies.py` | Bearer Token | MySQL `users` | Archive pregnancy (IDOR-scoped) |
| `POST` | `/api/v1/predictions` | `endpoints/predictions.py` | Bearer Token | MySQL `risk_assessments`, `audit_logs` | Run deterministic 8-feature clinical ML inference |
| `GET` | `/api/v1/predictions` | `endpoints/predictions.py` | Bearer Token | MySQL `risk_assessments` | Paginated assessment history (IDOR-scoped) |
| `GET` | `/api/v1/predictions/latest` | `endpoints/predictions.py` | Bearer Token | MySQL `risk_assessments` | Latest assessment (IDOR-scoped) |
| `GET` | `/api/v1/predictions/{id}` | `endpoints/predictions.py` | Bearer Token | MySQL `risk_assessments` | Fetch assessment by public ID (IDOR-scoped) |
| `DELETE` | `/api/v1/predictions/{id}` | `endpoints/predictions.py` | Bearer Token | MySQL `risk_assessments` | Delete assessment (IDOR-scoped) |
| `GET` | `/api/v1/predictions/model-info` | `endpoints/predictions.py` | Bearer Token | MySQL `model_versions` | Active ML model metadata & feature manifest |
| `POST` | `/api/v1/health-measurements` | `endpoints/health_measurements.py` | Bearer Token | MySQL `health_measurements` | Record patient metabolic measurement |
| `GET` | `/api/v1/health-measurements` | `endpoints/health_measurements.py` | Bearer Token | MySQL `health_measurements` | Paginated measurement history (IDOR-scoped) |
| `GET` | `/api/v1/health-measurements/latest` | `endpoints/health_measurements.py` | Bearer Token | MySQL `health_measurements` | Latest measurements per type (IDOR-scoped) |
| `GET` | `/api/v1/dashboard/summary` | `endpoints/dashboard.py` | Bearer Token | MySQL + Redis cache (`300s`) | Aggregated metabolic dashboard summary |
| `POST` | `/api/v1/reports` | `endpoints/reports.py` | Bearer Token | MySQL `medical_reports`, `audit_logs` | Save parsed report & metadata |
| `GET` | `/api/v1/reports` | `endpoints/reports.py` | Bearer Token | MySQL `medical_reports` | List patient reports (IDOR-scoped) |
| `GET` | `/api/v1/reports/{id}` | `endpoints/reports.py` | Bearer Token | MySQL `medical_reports` | Get report detail (IDOR-scoped) |
| `DELETE` | `/api/v1/reports/{id}` | `endpoints/reports.py` | Bearer Token | MySQL `medical_reports` | Delete report (IDOR-scoped) |
| `POST` | `/api/v1/files/upload` | `endpoints/files.py` | Bearer Token | Private Storage (`storage/private/`) | Upload medical file with magic byte checks |
| `GET` | `/api/v1/files/{id}/download` | `endpoints/files.py` | Bearer Token | Private Storage | Authorized private stream download |
| `GET` | `/api/v1/tasks/{job_id}` | `endpoints/tasks.py` | Bearer Token | MySQL `background_jobs` | Poll Celery job status (IDOR-scoped) |
| `GET` | `/api/v1/notifications` | `endpoints/notifications.py` | Bearer Token | MySQL `notifications` | List patient notification inbox (IDOR-scoped) |
| `PATCH` | `/api/v1/notifications/{id}/read` | `endpoints/notifications.py` | Bearer Token | MySQL `notifications` | Mark notification read |
| `PATCH` | `/api/v1/notifications/read-all` | `endpoints/notifications.py` | Bearer Token | MySQL `notifications` | Mark all notifications read |
| `POST` | `/api/v1/consultations` | `endpoints/consultations.py` | Bearer Token | MySQL `doctor_appointments` | Book doctor consultation |
| `GET` | `/api/v1/consultations` | `endpoints/consultations.py` | Bearer Token | MySQL `doctor_appointments` | List patient appointments (IDOR-scoped) |
| `GET` | `/api/v1/consultations/{id}` | `endpoints/consultations.py` | Bearer Token | MySQL `doctor_appointments` | Get consultation detail (IDOR-scoped) |
| `PATCH` | `/api/v1/consultations/{id}` | `endpoints/consultations.py` | Bearer Token | MySQL `doctor_appointments` | Reschedule/update appointment (IDOR-scoped) |
| `DELETE` | `/api/v1/consultations/{id}` | `endpoints/consultations.py` | Bearer Token | MySQL `doctor_appointments` | Cancel appointment (IDOR-scoped) |
| `POST` | `/api/v1/chatbot/conversations` | `endpoints/chatbot.py` | Bearer Token | MySQL `chat_conversations` | Create chat session |
| `GET` | `/api/v1/chatbot/conversations` | `endpoints/chatbot.py` | Bearer Token | MySQL `chat_conversations` | List patient chat sessions (IDOR-scoped) |
| `POST` | `/api/v1/chatbot/conversations/{id}/messages` | `endpoints/chatbot.py` | Bearer Token | MySQL `chat_messages` + llama.cpp | Generate message with local AI & safety guards |
| `POST` | `/api/v1/chatbot/messages/{id}/feedback` | `endpoints/chatbot.py` | Bearer Token | MySQL `chat_feedback` | Submit message feedback |
| `GET` | `/api/v1/health/live` | `endpoints/health.py` | Public | None | Fast process liveness probe |
| `GET` | `/api/v1/health/ready` | `endpoints/health.py` | Public | MySQL, Redis, Storage, ML, AI | Deep infrastructure readiness probe |

### 3.2 Legacy Compatibility Routes (`/api/`)

| Method | Path | Source File | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `app/api/endpoints/auth.py` | Legacy frontend registration compatibility |
| `POST` | `/api/auth/login` | `app/api/endpoints/auth.py` | Legacy frontend login compatibility |
| `POST` | `/api/prediction/predict` | `app/api/endpoints/prediction.py` | Legacy synchronous prediction |
| `POST` | `/api/prediction/save` | `app/api/endpoints/prediction.py` | Legacy prediction saving |
| `GET` | `/api/prediction/history` | `app/api/endpoints/prediction.py` | Legacy prediction history query |
| `POST` | `/api/reports/upload-report` | `app/api/endpoints/reports.py` | Legacy OCR file extraction |
| `POST` | `/api/reports/save-report` | `app/api/endpoints/reports.py` | Legacy report persistence |
| `GET` | `/api/reports/user/{user_id}` | `app/api/endpoints/reports.py` | Legacy user report listing |
| `POST` | `/api/tracking/add` | `app/api/endpoints/tracking.py` | Legacy tracking metrics |
| `GET` | `/api/tracking/user/{user_id}` | `app/api/endpoints/tracking.py` | Legacy tracking history |
| `POST` | `/api/appointments/book` | `app/api/endpoints/appointments.py` | Legacy appointment booking |
| `GET` | `/api/appointments/user/{user_id}`| `app/api/endpoints/appointments.py` | Legacy appointment history |

---

## 4. Current Persistence Architecture

- **Authoritative Database**: MySQL 8.0+ / MariaDB 10.5+ (accessible locally via XAMPP on `127.0.0.1:3306`).
- **ORM**: SQLAlchemy 2.x declarative models ([`app/models/`](file:///d:/Matrigluco/backend/app/models/)).
- **Schema Authority**: Alembic Migrations ([`migrations/versions/`](file:///d:/Matrigluco/backend/migrations/versions/)):
  - `001_authentication_and_sessions`: `users`, `auth_sessions`, `auth_tokens`, `security_audit_events`.
  - `002_ml_and_predictions`: `model_versions`, `risk_assessments`, `risk_assessment_features`, `predictions`.
  - `003_model_governance`: Normalized feature snapshots, imputation tracking, provenance metadata.
  - `004_background_jobs`: `background_jobs` table for Celery task progress tracking.
  - `005_audit_security_consent`: `audit_logs`, `security_events`, `consent_records`.
- **Transient State**: Redis 7+ (Logical DBs: `/0` Cache & Locks, `/1` Celery Broker, `/2` Celery Results).

---

## 5. Supabase Dependency Inventory

### 5.1 Backend Supabase Usage
- **Status**: **100% Extracted & Replaced**.
- No active backend modules import `@supabase` or `supabase-py`.
- Migration script [`scripts/migration/migrate_supabase_to_mysql.py`](file:///d:/Matrigluco/backend/scripts/migration/migrate_supabase_to_mysql.py) exists to import legacy export fixtures into MySQL while preserving public UUIDs.

### 5.2 Frontend Supabase Adapter Layer
- **Status**: The frontend [`web/src/supabaseClient.js`](file:///d:/Matrigluco/web/src/supabaseClient.js) provides a drop-in shim mapping legacy Supabase JS calls (`supabase.auth.signInWithPassword`, `supabase.from('predictions').select()`, `supabase.storage`) directly to FastAPI REST endpoints.
- Direct cloud Supabase network calls are eliminated; all frontend data flows through FastAPI.

---

## 6. Frontend Coupling Matrix

| Feature | Frontend File | Target FastAPI Route | Legacy Shim Used | Cutover Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Sign In / Sign Up** | `web/src/pages/Auth.jsx` | `/api/v1/auth/login`, `/register` | `supabase.auth.signInWithPassword` | Low (Tested via Shim) |
| **Manual Prediction** | `web/src/pages/DiabetesPrediction.jsx` | `/api/v1/predictions` | `supabase.from('predictions').insert` | Low |
| **Report Upload** | `web/src/pages/DiabetesPrediction.jsx` | `/api/v1/files/upload`, `/reports` | `supabase.storage.from().upload` | Low |
| **Dashboard Metrics** | `web/src/pages/Dashboard.jsx` | `/api/v1/dashboard/summary` | `supabase.from('health_tracking')` | Low |
| **Health Tracking** | `web/src/pages/Track.jsx` | `/api/v1/health-measurements` | `supabase.from('health_tracking')` | Low |
| **Consultations** | `web/src/pages/consultations/` | `/api/v1/consultations` | `supabase.from('doctor_appointments')` | Low |

---

## 7. Authentication Baseline

- **Password Hashing**: Argon2id (`time_cost=3`, `memory_cost=65536`, `parallelism=4`).
- **Access Tokens**: Short-lived JWTs (15 minutes expiry, HS256, contains `sub=user_id`, `role`).
- **Refresh Tokens**: Cryptographically secure opaque tokens (`rt_...`), stored as SHA-256 hashes in MySQL `auth_sessions`.
- **Replay Protection**: Token family tracking. Replay of an already-used refresh token revokes the entire token family and logs `AUTH_REFRESH_REUSE_DETECTED`.

---

## 8. ML Artifact Inventory

| Artifact File | Format | Location | Checksum Verified | Feature Count |
| :--- | :--- | :--- | :---: | :---: |
| `model.joblib` | scikit-learn / joblib | `app/ml/artifacts/diabetes-risk/1.0.0/` | Yes | 8 Features |
| `preprocessor.joblib` | scikit-learn / joblib | `app/ml/artifacts/diabetes-risk/1.0.0/` | Yes | StandardScaler |
| `metadata.json` | JSON Manifest | `app/ml/artifacts/diabetes-risk/1.0.0/` | Yes | Metadata contract |

---

## 9. Current Prediction Contract

- **Canonical 8-Feature Contract**:
  1. `pregnancies` (float $\ge 0.0$)
  2. `glucose` (mg/dL, $[40.0, 500.0]$)
  3. `blood_pressure` (mmHg, $[40.0, 250.0]$)
  4. `skin_thickness` (mm, $[5.0, 120.0]$)
  5. `insulin` (µU/mL, $[1.0, 1000.0]$)
  6. `bmi` (kg/m², $[10.0, 80.0]$)
  7. `diabetes_pedigree_function` (score, $[0.05, 3.0]$)
  8. `age` (years, $[15.0, 110.0]$)
- **Risk Thresholds**:
  - `low`: $P < 0.35$
  - `moderate`: $0.35 \le P < 0.65$
  - `high`: $P \ge 0.65$
- **Lineage & Auditability**: Every prediction writes an immutable normalized pre-preprocessor input snapshot to `risk_assessments.input_snapshot_json` and canonical feature provenance rows to `risk_assessment_features`.

---

## 10. Report & OCR Flow

1. **Upload**: Client posts file to `/api/v1/files/upload`. File magic bytes are verified (`%PDF`, `\x89PNG`, `\xff\xd8\xff`).
2. **Private Storage**: Saved with random UUID under `storage/private/medical-reports/{user_id}/{file_id}`.
3. **Consent Check**: `ReportService` verifies active `third_party_ocr_processing` consent record (`ocr-third-party-v1`).
4. **Extraction**: `OCRSpaceClient` parses text; `MedicalReportParser` extracts biomarkers (`glucose`, `bp_systolic`, `hba1c`, `bmi`).
5. **Persistence**: Structured report saved to `medical_reports` table; audit log recorded.

---

## 11. File Storage Flow

- **Root Directory**: `storage/private/` (Git-ignored).
- **Access Control**: Medical files are non-public; downloads require authenticated ownership check (`GET /api/v1/files/{id}/download`).
- **Path Traversal Protection**: `LocalStorageProvider` verifies canonical path resolution stays strictly inside `PRIVATE_STORAGE_ROOT`.

---

## 12. Environment Variable Inventory

| Variable Name | Classification | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | Backend / Public | `Matrigluco` | Application service title |
| `APP_ENV` | Backend / Config | `development` | Environment mode (`development`, `testing`, `production`) |
| `DEBUG` | Backend / Config | `true` | Debug mode (enforced `false` in production) |
| `DATABASE_URL` | Backend / Secret | `mysql+pymysql://...` | Relational database connection string |
| `JWT_SECRET_KEY` | Backend / Secret | `GENERATE_A_LONG_RANDOM_SECRET` | HMAC signing secret for JWT access tokens |
| `REDIS_URL` | Backend / Config | `redis://127.0.0.1:6379/0` | Transient caching & distributed locks Redis URL |
| `CELERY_BROKER_URL`| Backend / Config | `redis://127.0.0.1:6379/1` | Celery task message broker Redis URL |
| `CELERY_RESULT_BACKEND`| Backend / Config| `redis://127.0.0.1:6379/2` | Celery task result backend Redis URL |
| `STORAGE_ROOT` | Backend / Path | `storage` | Base filesystem storage directory |
| `PRIVATE_STORAGE_ROOT`| Backend / Path | `storage/private` | Protected private medical files directory |
| `ML_MODEL_KEY` | Backend / Config | `diabetes-risk` | Active clinical ML model identifier |
| `ML_MODEL_VERSION`| Backend / Config | `1.0.0` | Active clinical ML model version string |
| `AI_ENABLED` | Backend / Config | `false` | Enable/disable offline llama.cpp AI chatbot |
| `AI_MODEL_PATH` | Backend / Path | `storage/ai/models/model.gguf` | Path to quantized GGUF weights |
| `OCR_PROVIDER` | Backend / Config | `ocr_space` | OCR extraction engine provider |
| `OCR_API_KEY` | Backend / Secret | `""` | Optional OCR provider API key |

---

## 13. Dependency Inventory

- **Web Runtime**: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `starlette`.
- **Database & ORM**: `sqlalchemy>=2.0`, `alembic`, `pymysql`, `cryptography`.
- **Caching & Tasks**: `redis`, `celery`.
- **Security & Cryptography**: `argon2-cffi`, `pyjwt`, `passlib`.
- **ML & Parsing**: `scikit-learn`, `joblib`, `numpy`, `pandas`, `requests`, `python-multipart`.
- **Local AI (Optional)**: `llama-cpp-python` (in `requirements/ai-local.txt`).
- **Testing & Quality**: `pytest`, `pytest-cov`, `httpx`, `ruff`, `mypy`.

---

## 14. Deployment Inventory

- **Local Development**: Windows 10/11 + XAMPP MySQL + Redis (WSL/Docker/Native) + Uvicorn `--reload` + Celery `--pool=solo`.
- **Production Target**: Linux VM/Container + Managed MySQL + Managed Redis + Supervised Uvicorn (1-2 workers) + Supervised Celery prefork workers + Supervised Celery Beat + Nginx HTTPS reverse proxy.

---

## 15. Security Baseline Review

| Severity | Item | Status / Remediation |
| :--- | :--- | :--- |
| **Critical** | Database Root Guard | `app/db/engine.py` rejects `root` user connection in `APP_ENV=production`. |
| **High** | Cross-User IDOR Protection | Verified via 9-resource test matrix in `test_ownership_security.py`. |
| **High** | Upload Signature Inspection | Magic bytes validated for PDF/PNG/JPEG; random UUID storage keys. |
| **Medium** | Logging Secret Redaction | `SensitiveDataFilter` masks passwords, JWTs, and API keys. |
| **Medium** | Third-Party OCR Consent | `ConsentService` verifies explicit patient consent before external dispatch. |

---

## 16. Behavior-Preservation Requirements

1. **Authentication**: Patients can register, log in, refresh tokens, and log out with Argon2id and JWT verification.
2. **Clinical Risk Assessment**: Deterministic 8-feature ML prediction remains exact and reproducible without feature mutation.
3. **Medical Reports**: Report uploads, biomarker parsing, and private stream downloads function seamlessly.
4. **Health Tracking & Dashboard**: Patient measurements aggregate cleanly into dashboard summaries.
5. **Doctor Consultations & Notifications**: Booking and inbox workflows remain responsive.
6. **Backward Compatibility**: Legacy `/api` endpoints and the frontend shim continue functioning for existing UI workflows.

---

## 17. Modernization Risk Register

| Risk | Evidence | Potential Impact | Mitigation Implemented |
| :--- | :--- | :--- | :--- |
| **Database Privileges** | XAMPP defaults to `root` | Accidental production root deployment | Startup guard raises `RuntimeError` if root in production |
| **AI Memory Bloat** | Multi-worker GGUF duplication | Out-Of-Memory on small hosts | Documented 1-worker baseline when `AI_ENABLED=true` |
| **OCR Privacy** | Third-party cloud transmission | Patient data disclosure | Consent record check gates all OCR dispatches |
| **Celery Queue Starvation**| 4 distinct queues | Unconsumed analytics tasks | Configured `--queues=default,reports,notifications,analytics` |

---

## 18. Rollback Baseline

- **Current Git HEAD**: Verified stable baseline.
- **Database Migrations**: Alembic revisions 001 through 005 are reversible via `alembic downgrade`.
- **Clean State Restore**: Re-running `.\scripts.ps1 verify` confirms full environment readiness.
