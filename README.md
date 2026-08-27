# Matrigluco — Clinical Maternal Health & AI Ecosystem

<div align="center">

![Matrigluco Platform Banner](web/public/brand/og-cover.png)

**An intelligent, multi-platform maternal health intelligence workspace combining clinical risk assessment, biomarker tracking, private medical report OCR parsing, and privacy-first local AI education.**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue?style=for-the-badge&logo=python&logoColor=white)](backend/README.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](backend/README.md)
[![React 19](https://img.shields.io/badge/React-19.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](web/README.md)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.3.20-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](frontend/README.md)
[![Android SDK 36](https://img.shields.io/badge/Android%20SDK-36.1-3DDC84?style=for-the-badge&logo=android&logoColor=white)](frontend/README.md)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](web/README.md)
[![License](https://img.shields.io/badge/License-Apache%202.0-red?style=for-the-badge)](THIRD_PARTY_NOTICES.md)

</div>

---

> [!NOTE]
> **Clinical Software Boundary Notice**: Matrigluco is an academic clinical decision-support and patient-empowerment software prototype. It is not a certified diagnostic medical device and does not substitute for clinical medical judgment, professional consultation, or emergency care.

---

## 🌟 Executive Summary

Matrigluco bridges clinical maternal health protocols and modern software engineering into a unified, secure ecosystem. It provides expectant mothers and clinical supervisors with:

* 🩺 **Clinical GDM Risk Prediction**: Deterministic, version-controlled machine learning pipeline trained to estimate gestational diabetes risk from longitudinal biomarker vectors.
* 📊 **Temporal Health Signal Spine**: Continuous tracking of blood glucose, systolic/diastolic blood pressure, weight, insulin, and fetal movements with trend horizon visualizations.
* 📑 **Document AI & Lab Report Extraction**: End-to-end OCR and tabular reconstruction pipeline that parses clinical lab reports (PDF/PNG/JPEG) into structured, editable biomarker ledgers.
* 🤖 **Zero-Cloud-Leakage Offline AI Assistant**: Local `llama.cpp` conversational AI runtime delivering empathetic maternal health education with strict patient consent gates and RAG citation grounding.
* 🎨 **Care Orbit Design System**: Proprietary aesthetic language featuring organic Care Pink tones (`#D94F7D` / `#F06F9D`), dark zinc themes, micro-animations, and Hugeicons iconography across web and native Android.

---

## 🏛️ Ecosystem Architecture

```text
                                       ┌────────────────────────────────────────────────────────┐
                                       │                   MATRIGLUCO CLIENTS                   │
                                       └───────────────────────────┬────────────────────────────┘
                                                                   │
                                   ┌───────────────────────────────┴───────────────────────────────┐
                                   ▼                                                               ▼
                    ┌───────────────────────────────┐                               ┌───────────────────────────────┐
                    │     Web Application (SPA)     │                               │      Native Android App       │
                    │  React 19 • TypeScript • Vite │                               │    Kotlin • AndroidX Views    │
                    │  Tailwind v4 • TanStack Query │                               │   ViewBinding • Dagger Hilt   │
                    └──────────────┬────────────────┘                               └───────────────┬───────────────┘
                                   │                                                                │
                                   └───────────────────────────────┬────────────────────────────────┘
                                                                   │ HTTPS / Authenticated REST (JWT)
                                                                   ▼
                                       ┌────────────────────────────────────────────────────────┐
                                       │              FASTAPI PLATFORM GATEWAY                  │
                                       │       Uvicorn • Pydantic v2 • Security Interceptors    │
                                       └───────────┬────────────────────────┬───────────────┬───┘
                                                   │                        │               │
                         ┌─────────────────────────┴────────┐               │               └─────────────────────────┐
                         ▼                                  ▼               ▼                                         ▼
        ┌─────────────────────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌─────────────────────────────────┐
        │        MySQL / MariaDB          │ │       Redis       │ │  Private Storage  │ │     Clinical ML Engine (v1)     │
        │ Transactional Source of Truth   │ │ Cache, Rate Limit │ │ Sandboxed Medical │ │  StandardScaler + LogisticRegr. │
        │ Alembic Migrations (008_head)   │ │ Distributed Locks │ │ Reports & PDFs    │ │  8-Vector Feature Contract      │
        └─────────────────────────────────┘ └─────────┬─────────┘ └───────────────────┘ └─────────────────────────────────┘
                                                      │ Task Queue Broker
                                                      ▼
                                       ┌─────────────────────────────────┐
                                       │          Celery Worker          │
                                       │    Async OCR Document Parsing   │
                                       │    Periodic Health Schedulers   │
                                       └──────────────┬──────────────────┘
                                                      │
                                                      ▼
                                       ┌─────────────────────────────────┐
                                       │    Local AI Assistant Engine    │
                                       │  llama-cpp-python (Offline GGUF)│
                                       │  Clinical Knowledge RAG Index   │
                                       └─────────────────────────────────┘
```

---

## 📦 Repository Organization

```text
Matrigluco/
├── backend/                    # Core FastAPI Platform, Celery Workers, ML Models & Offline AI
│   ├── alembic/                # Versioned relational database schema migrations
│   ├── app/                    # Modular domain application (auth, tracking, ml, ai, ocr, storage)
│   ├── requirements/           # Layered Python dependencies (base.txt, dev.txt, ai-local.txt)
│   ├── start.py                # Unified developer runtime supervisor with preflight checks
│   └── README.md               # Complete backend architecture & deployment manual
│
├── web/                        # Modern React 19 Frontend Web Application
│   ├── src/                    # Feature-driven modular architecture (assessment, assistant, reports)
│   ├── public/                 # Optimized brand marks, favicons, and Open Graph assets
│   ├── package.json            # Node 20+ npm scripts (dev, dev:lan, test, build, lint)
│   ├── vercel.json             # Production SPA rewrite rules & headers
│   └── README.md               # Comprehensive web developer guide & Vercel deployment manual
│
├── frontend/                   # Native Android Mobile Application
│   ├── app/                    # Application composition root, Navigation graph, MainActivity
│   ├── core/                   # Shared libraries (network, database, datastore, designsystem, ui)
│   ├── feature/                # Isolated feature modules (dashboard, tracking, assessment, assistant)
│   ├── gradle/libs.versions.toml # Centralized Gradle version catalog
│   └── README.md               # Native Android development, build, and release manual
│
├── docs/                       # Technical architecture blueprints & design specifications
├── schema.sql                  # Canonical SQL database dump & constraints
└── THIRD_PARTY_NOTICES.md      # Open-source licensing disclosures
```

---

## 🎨 Care Orbit Design System

Matrigluco features the **Care Orbit Design System**, designed to provide calm, reassuring, accessible health experiences:

### Core Color Palette

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| **Care Pink Primary** | `#D94F7D` | `#F06F9D` | Primary action buttons, active tabs, brand accents |
| **Care Soft Accent** | `#FDEEF3` | `#2D121C` | Pill backgrounds, metric tags, highlighted containers |
| **Neutral Canvas** | `#FFFFFF` | `#0D0B0C` | Main screen background, surface canvas |
| **Elevated Surface** | `#F8F6F7` | `#161314` | Metric cards, dialog surfaces, bottom sheets |
| **Foreground Text** | `#1C191A` | `#F2EFF0` | High-contrast readable typography |
| **Clinical Alert** | `#E53935` | `#EF5350` | Out-of-bounds glucose alerts, safety warnings |

### Iconography Standard
* **Hugeicons**: Standardized on `@hugeicons/react` for Web and native XML `VectorDrawable` assets (`ic_huge_*`) for Android.
* **No Mixed Libraries**: Eliminates icon drift and maintains visual harmony across platforms.

---

## 🚀 Quick Start Matrix

### 1. Backend Service (FastAPI + Workers)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements/dev.txt
Copy-Item .env.example .env
python -m alembic upgrade head
python start.py --check
python start.py
```
👉 *Full Backend Guide: [backend/README.md](file:///d:/Matrigluco/backend/README.md)*

---

### 2. Web Application (React 19 + Vite)
```powershell
cd web
npm install
Copy-Item .env.example .env.local
npm run dev
```
👉 *Full Web Guide: [web/README.md](file:///d:/Matrigluco/web/README.md)*

---

### 3. Native Android App (Kotlin + Android Studio)
```powershell
cd frontend
.\gradlew.bat testDebugUnitTest
.\gradlew.bat assembleDebug
```
👉 *Full Android Guide: [frontend/README.md](file:///d:/Matrigluco/frontend/README.md)*

---

## 🧪 Comprehensive Quality Verification

Every layer in the Matrigluco repository is hardened with automated testing and static analysis:

| Layer | Test Suite | Lint / Typecheck | Status |
| :--- | :--- | :--- | :---: |
| **Backend API & ML** | **269 Pytest Unit & Integration Tests** | `ruff check .` (0 errors) • `mypy` | ✅ **100% Passing** |
| **Web Frontend** | **290 Vitest Component & Unit Tests** | `tsc --noEmit` • `eslint .` (0 errors) | ✅ **100% Passing** |
| **Android Native** | **1016 Gradle Build & Unit Tasks** | `lintDebug` • AndroidX Tests | ✅ **100% Passing** |
| **Dependencies** | `pip check` (Clean) | `npm audit` (0 vulnerabilities) | ✅ **100% Passing** |

---

## 🔒 Security, Privacy & Compliance

1. **Zero Secret Leaks**: No database passwords, JWT private keys, or API tokens in client bundles or public repositories.
2. **Strict Row-Level Ownership**: All health records, file downloads, and prediction history enforce user ID ownership derived directly from verified JWT sessions.
3. **Encrypted Storage**: Android stores refresh tokens in Android Keystore-backed encrypted storage.
4. **Offline AI Privacy**: The conversational assistant runs locally on the host server via `llama.cpp`; conversation history and clinical queries are **never** forwarded to third-party cloud LLM APIs.
5. **Masked Telemetry**: Patient names, glucose measurements, and OCR text are stripped from telemetry and console log sinks.

---

## 📚 Platform Manuals

* 📖 **[Backend Manual](file:///d:/Matrigluco/backend/README.md)** — FastAPI architecture, Celery workers, ML inference contracts, llama.cpp GGUF setup, and Linux production deployment.
* 📖 **[Web Manual](file:///d:/Matrigluco/web/README.md)** — React 19 architecture, Tailwind CSS v4, shadcn/ui components, single-flight auth refresh, and Vercel deployment.
* 📖 **[Android Manual](file:///d:/Matrigluco/frontend/README.md)** — Multi-module Kotlin architecture, ViewBinding, Room caching, WorkManager, Care Orbit design system, and release APK/AAB signing.

---

<div align="center">

**Matrigluco Platform • Clinical Maternal Health & AI Ecosystem**  
*Care Orbit Design System • Built with React 19, Kotlin, and FastAPI*

</div>
