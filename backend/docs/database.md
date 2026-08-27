# MatriGluco Database Architecture, Persistence Contract, and Schema Specification

---

## 1. Primary Engine & Connection Management

- **Database Engine**: MySQL 8.0+ / MariaDB 10.5+ (accessible locally via XAMPP on `127.0.0.1:3306`).
- **SQLAlchemy Dialect & Driver**: `mysql+pymysql` (Synchronous SQLAlchemy 2.x ORM only; zero `AsyncSession` / `aiomysql`).
- **Character Set & Collation**: `utf8mb4` with `utf8mb4_unicode_ci` for full multibyte Unicode support.
- **Connection Pooling**:
  - `DB_POOL_SIZE`: 10 connections (configurable).
  - `DB_MAX_OVERFLOW`: 20 connections.
  - `DB_POOL_RECYCLE_SECONDS`: 1800 seconds (prevents MySQL stale server connection drops).
  - `DB_POOL_PRE_PING`: `True` (connection liveness check before checkout).
- **Least-Privilege Database Account**:
  - Dedicated application runtime user: `matrigluco_app`.
  - **Production Root Guard**: Application startup actively crashes if connected with `root` user in `APP_ENV=production`.

---

## 2. Declarative Base & Naming Conventions

All SQLAlchemy models inherit from `app.db.base.Base`, with deterministic metadata naming conventions:

```python
NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}
```

---

## 3. Entity-Relationship Model & Domain Tables

```text
users
 ├── 1:N auth_sessions (Rotating refresh token hashes & family tracking)
 ├── 1:N auth_tokens (Hashed one-time password reset & verification tokens)
 ├── 1:N consent_records (Third-party OCR & data processing consent history)
 ├── 1:N risk_assessments (Deterministic 8-feature clinical ML predictions)
 │    └── 1:N risk_assessment_features (Queryable feature provenance & normalization)
 ├── 1:N predictions (Legacy compatibility table)
 ├── 1:N health_measurements (Time-series glucose, blood pressure, BMI telemetry)
 ├── 1:N medical_reports / reports (Lab report biomarker extraction & file metadata)
 ├── 1:N doctor_appointments / consultations (Telehealth & clinic consultations)
 ├── 1:N background_jobs (Celery asynchronous job tracking & progress)
 ├── 1:N chat_conversations (Offline local llama.cpp AI chat sessions)
 │    ├── 1:N chat_messages (Multi-turn chat history)
 │    └── 1:N chat_feedbacks (Clinical response ratings)
 ├── 1:N audit_logs (Append-only business event audit history)
 └── 1:N security_events (Security anomalies & failed auth attempts)

model_versions
 └── 1:N risk_assessments (Enforces immutable model version referential integrity)

ai_models
 └── 1:N chat_conversations (Registered offline GGUF local AI weights)

knowledge_documents
 └── 1:N knowledge_chunks (Clinical guideline embeddings for local RAG retrieval)
```

---

## 4. Table Specifications & Constraints Matrix

| Table Name | Primary Key | Foreign Keys | Key Constraints & Indexes | Delete / Cascade Policy |
| :--- | :--- | :--- | :--- | :--- |
| **`users`** | `id CHAR(36)` | None | `email UNIQUE`, `role`, `is_active`, `is_verified` | Authoritative root entity |
| **`auth_sessions`** | `id CHAR(36)` | `user_id -> users.id` | `refresh_token_hash UNIQUE`, `token_family_id`, `expires_at`, `status` | `CASCADE` on user deletion |
| **`auth_tokens`** | `id CHAR(36)` | `user_id -> users.id` | `token_hash UNIQUE`, `token_type`, `expires_at` | `CASCADE` on user deletion |
| **`consent_records`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, consent_type)` composite lookup, `consent_version` | Retained on user delete (`SET NULL` / archive) |
| **`model_versions`** | `id CHAR(36)` | None | `(model_key, version) UNIQUE`, `model_sha256`, `is_active` | `RESTRICT` (cannot delete active model with assessments) |
| **`risk_assessments`** | `id CHAR(36)` | `user_id -> users.id`<br>`model_version_id -> model_versions.id` | `(user_id, created_at)` index, `probability [0.0, 1.0]`, `risk_band` | Soft-archived / Historical clinical record |
| **`risk_assessment_features`** | `id CHAR(36)` | `risk_assessment_id -> risk_assessments.id` | `(risk_assessment_id, feature_name) UNIQUE`<br>`(risk_assessment_id, feature_order) UNIQUE` | `CASCADE` with parent assessment |
| **`predictions`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, created_at)` index | Legacy compatibility table |
| **`health_measurements`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, metric_type, measured_at)` composite index | Retained on user archive |
| **`medical_reports`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, created_at)` index, `status` | Private file metadata preserved |
| **`reports`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, created_at)` index | Legacy compatibility table |
| **`doctor_appointments`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, appointment_date)` index, `status` | Retained for appointment audit |
| **`background_jobs`** | `id CHAR(36)` | `user_id -> users.id` | `celery_task_id`, `(user_id, status)`, `progress_percent [0, 100]` | Retained for reconciliation |
| **`chat_conversations`** | `id CHAR(36)` | `user_id -> users.id`<br>`model_id -> ai_models.id` | `(user_id, updated_at)` index | `CASCADE` to child messages & feedback |
| **`chat_messages`** | `id CHAR(36)` | `conversation_id -> chat_conversations.id` | `(conversation_id, created_at)` index | `CASCADE` with conversation |
| **`chat_feedbacks`** | `id CHAR(36)` | `conversation_id -> chat_conversations.id` | `(conversation_id, message_index)` index | `CASCADE` with conversation |
| **`audit_logs`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, created_at)`, `action`, `request_id` | `ON DELETE SET NULL` (Audit log is immutable) |
| **`security_events`** | `id CHAR(36)` | `user_id -> users.id` | `(user_id, created_at)`, `event_type`, `severity` | `ON DELETE SET NULL` (Security history preserved) |

---

## 5. Architectural Invariants

### 5.1. Transaction Ownership & Service Boundaries
- **Services own transactions**: A service coordinates multi-step business operations (e.g. creating report $\rightarrow$ saving file metadata $\rightarrow$ enqueuing Celery job $\rightarrow$ invalidating cache), committing only upon complete workflow success and rolling back upon failure.
- **Repositories flush**: Repository persistence methods (`create`, `update`, `delete`) add and flush to the session without independent commits, allowing the service to manage atomicity.

### 5.2. Authenticated IDOR Scoping
- User-owned queries must never trust arbitrary request body or query parameters (`?user_id=123`).
- Repositories enforce ownership directly in SQL:
  ```python
  stmt = select(RiskAssessment).where(
      RiskAssessment.id == assessment_id, RiskAssessment.user_id == current_user.id
  )
  ```

### 5.3. Binary File Storage Separation
- Medical report binary bytes (`.pdf`, `.png`, `.jpg`) are **never stored as BLOBs in MySQL**.
- MySQL stores file metadata (`file_asset_id`, `storage_key`, `size_bytes`, `sha256`, `mime_type`), while encrypted binary bytes reside in protected filesystem storage (`storage/private/`).

### 5.4. UTC Datetime Normalization
- All timestamps written to the database are converted to timezone-aware UTC prior to persistence.
- MySQL `DATETIME` columns store timestamps assuming UTC standard.

---

## 6. Alembic Schema Migrations Lineage

All schema evolution is managed through Alembic (`migrations/versions/`):

1. **`001_authentication_and_sessions.py`**:
   Creates `users`, `auth_sessions`, `auth_tokens`, `security_audit_events`.
2. **`002_ml_and_predictions.py`**:
   Creates `model_versions`, `risk_assessments`, `risk_assessment_features`, `predictions`.
3. **`003_model_governance.py`**:
   Adds imputation tracking columns, model provenance, and feature schema constraints.
4. **`004_background_jobs.py`**:
   Creates `background_jobs` table for asynchronous Celery task tracking.
5. **`005_audit_security_consent.py`**:
   Creates `audit_logs`, `security_events`, `consent_records`.
