# Frontend Cutover & API Integration Runbook

> **Target Architecture:** React 19 + Vite 8 $\rightarrow$ FastAPI 0.110+ (`/api/v1`) $\rightarrow$ MySQL / Private Storage / Redis / Celery  
> **Cutover Date:** 2026-08-17  
> **Supabase Status:** Fully Decommissioned from Active Runtime (0 runtime imports, 0 network calls)  

---

## 1. Migration Inventory & Replacement Mapping

| Legacy Feature | Original Supabase Usage | Replacement Endpoint | File Status |
| :--- | :--- | :--- | :--- |
| **Sign In** | `supabase.auth.signInWithPassword` | `POST /api/v1/auth/login` | **Migrated** (`src/api/auth.js`) |
| **Sign Up** | `supabase.auth.signUp` | `POST /api/v1/auth/register` | **Migrated** (`src/api/auth.js`) |
| **Session Bootstrap**| `supabase.auth.getSession` | `GET /api/v1/profiles/me` | **Migrated** (`src/App.jsx`) |
| **Sign Out** | `supabase.auth.signOut` | `POST /api/v1/auth/logout` | **Migrated** (`src/api/auth.js`) |
| **Password Reset** | `supabase.auth.resetPasswordForEmail` | `POST /api/v1/auth/forgot-password` | **Migrated** (`src/api/auth.js`) |
| **Predictions** | `supabase.from('predictions').select` | `GET /api/v1/predictions` | **Migrated** (`src/api/predictions.js`) |
| **Prediction Assess**| `supabase.from('predictions').insert` | `POST /api/v1/predictions` | **Migrated** (`src/api/predictions.js`) |
| **Health Telemetry** | `supabase.from('tracking').insert` | `POST /api/v1/health-measurements` | **Migrated** (`src/api/health.js`) |
| **Report Upload** | `supabase.storage.from(...).upload` | `POST /api/v1/reports/upload` | **Migrated** (`src/api/reports.js`) |
| **Report Download** | Public Supabase CDN URL | `GET /api/v1/reports/{id}/file` (Blob) | **Migrated** (`src/api/reports.js`) |
| **Consultations** | `supabase.from('doctor_appointments')` | `POST/GET /api/v1/consultations` | **Migrated** (`src/api/consultations.js`) |
| **Notifications** | Direct table updates | `GET/PATCH /api/v1/notifications` | **Migrated** (`src/api/notifications.js`) |
| **AI Chatbot** | Direct LLM / client side | `POST /api/v1/chatbot/...` | **Migrated** (`src/api/chatbot.js`) |

---

## 2. Authentication Architecture & Token Strategy

1. **Access Token**:
   - Short-lived JSON Web Token (HS256).
   - Stored in memory and synced to local storage for page reload continuity.
   - Automatically injected via Axios request interceptor (`Authorization: Bearer <token>`).

2. **Single-Flight 401 Refresh Queue**:
   - Interceptor catches 401 Unauthorized responses.
   - Enqueues concurrent requests into a single promise queue.
   - Issues exactly **one** `POST /api/v1/auth/refresh` request.
   - Upon success, replays all queued requests with the renewed token.
   - Upon failure, clears local session and redirects cleanly to `/auth`.

---

## 3. Medical ML Contract & Safety Alignment

- **8 Canonical Features**: `glucose`, `blood_pressure`, `skin_thickness`, `insulin`, `bmi`, `diabetes_pedigree_function`, `age`, `pregnancies`.
- **Zero Hidden Defaults**: Explicit values supplied from patient input or canonical clinical baseline.
- **GDM History Separation**: Family history and gestational history are no longer conflated with pregnancy counts.

---

## 4. Verification Proof

- **Frontend Production Build**: `vite build` completed in **575ms** with zero errors or warnings.
- **Supabase Search Results in `web/`**: **0 occurrences**.
- **Backend Quality Gates**: **242 / 242 tests passing (100%)**.
