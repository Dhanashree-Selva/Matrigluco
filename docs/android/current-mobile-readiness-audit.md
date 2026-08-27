# Current Mobile Readiness Audit

**Audit date:** 2026-08-21  
**Authority:** repository code at `D:/Matrigluco`; canonical mobile API is `/api/v1`, not legacy `/api`.

The cross-phase product and technology baseline is `executive-implementation-strategy.md`. Repository findings in this audit override generic expectations when describing what currently exists.

## 1. Repository overview

- `backend/`: FastAPI modular monolith, SQLAlchemy/MySQL, Redis cache, Celery jobs, private local storage, scikit-learn inference, backend llama.cpp/GGUF runtime, OCR integration.
- `web/`: React/TypeScript product reference. It contains presentation-only clinician data and consultation room components that are not backend capabilities.
- `frontend/`: partial native Android project created before this audit. There is no separate `android/` or `mobile/` directory.
- `backend/docs/`: existing backend and web architecture records.

## 2. Existing Android status

Status: **PARTIAL, pre-Phase-1 prototype**.

| Item | Actual value |
|---|---|
| Project | `frontend/` Gradle Android application |
| Namespace/application ID | `com.example.myapplication` (placeholder; must change in Phase 1) |
| min/target/compile SDK | 24 / 36 / 36.1 |
| AGP/Gradle | 9.3.1 / 9.5.0 |
| JVM | Java 11 |
| UI | XML + ViewBinding, one Activity, one Fragment, Navigation 2.9.8 |
| Build types | debug and unoptimized release defaults |
| Signing | default debug; no production signing contract |
| Network/DI/storage | absent |
| Tests | generated placeholder unit/instrumentation tests only |

The existing `HomeFragment` and `fragment_home.xml` are an early screen prototype and are outside Phase 0. This audit does not extend them. Compose sources/dependencies are absent. The design system is only a few colors/drawables, not a production system.

## 3. Backend status

`backend/app/main.py` mounts root health routes, canonical `/api/v1`, and a legacy `/api` compatibility layer. Android must use only `/api/v1`. Authentication is Bearer JWT plus opaque rotating refresh token in JSON. Durable data is user-owned through FastAPI dependencies/services/repositories. MySQL, Redis, Celery, model artifacts and secrets remain backend-only.

## 4. Existing web frontend status

`web/` is useful for Care Orbit language and information hierarchy, not API truth. In particular, `web/src/features/consultations/data/clinicians.data.ts` is static product data, while room/video/chat/prescription components have no matching FastAPI consultation endpoints. Those experiences are unsupported for Android.

## 5–13. Feature inventory

- **Routes/auth:** canonical inventory is in `mobile-api-contract.md`; refresh token is returned and accepted in JSON, so Android is not blocked by browser cookies.
- **Assessment/ML:** authenticated persisted assessment exists with eight-feature server inference, details/history/delete and model information. Legacy prediction endpoints must not be used.
- **Tracking/history:** five metric keys, full owned CRUD and paginated unified history exist.
- **Reports/files:** authenticated private file upload/download exists; report metadata CRUD and generated PDF exist. A coherent public contract that creates a report from an uploaded file and returns/enqueues its job is missing.
- **Consultations:** owned appointment-record CRUD only. No provider directory, availability, real-time chat, video transport, meeting URL or prescriptions API.
- **Notifications:** durable paginated inbox, read mutations and preferences exist. No FCM device-token registration or push dispatch.
- **Assistant:** authenticated conversations/messages, normal POST and SSE exist. Runtime is on the backend. Health context is request-controlled. Citation shape is only `sources: string[]`, not structured citations.
- **Account/profile:** current user, profile update, pregnancy contexts, password change, sessions and revocation exist. Data export and account deletion endpoints do not.
- **Files:** `/api/v1/files` enforces ownership and private/no-store download; `/uploads` remains mounted for legacy compatibility and must never be treated as the mobile medical-file contract.

## 14–16. Mobile gaps, risks and Phase 1 readiness

Primary gaps: placeholder Android namespace; no environment/base-URL strategy; no network/error/auth implementation; report workflow ambiguity; no consultation ecosystem; no push; no export/deletion; list pagination inconsistency; SSE error framing is ad hoc text; AI fallback behavior means `AI_ENABLED` is not a simple endpoint-off switch.

Phase 1 status: **READY WITH DOCUMENTED GAPS**. Foundation/build logic can proceed because stack, API prefix, auth transport and module boundaries are known. Feature phases must honor `mobile-feature-capability-matrix.md` and the risk register.

### Phase 1 readiness checklist

- Known: Kotlin/XML/ViewBinding, single Activity/Fragments/Navigation, minSdk 24, canonical `/api/v1`, Kotlinx Serialization, Hilt/KSP, Retrofit/OkHttp, bounded Room/DataStore/WorkManager/Paging.
- Required decision before code restructuring: durable namespace/application ID and local/staging/production base URL names.
- Not a Phase 1 blocker: missing later-feature APIs, provided their modules/screens are not implemented early.

## Evidence

Primary sources: `backend/app/main.py`, `backend/app/api/v1/router.py`, `backend/app/api/v1/endpoints/`, `backend/app/schemas/`, `backend/app/services/`, `backend/app/core/config.py`, `frontend/app/build.gradle.kts`, `frontend/gradle/libs.versions.toml`, and `web/src/features/`.

## Verification performed

All 18 required Phase 0 documents exist and are non-empty. Targeted API tests for auth, predictions, health measurements, reports, consultations, notifications and chatbot passed: **28 passed**. There is no dedicated `tests/api/test_history.py`; history was verified by endpoint/schema/service inspection and existing history service unit coverage was identified. Test output contained only deprecation warnings (Starlette TestClient/httpx transition, HTTP 422 constant and SQLAlchemy `utcnow`).
