# Matrigluco Android

Native Kotlin/XML Android client for Matrigluco's maternal health tracking, clinical diabetes risk evaluation, private medical report processing, consultations, notifications, and educational AI Assistant experiences.

> [!NOTE]
> **Medical Technology Notice**: Matrigluco is an academic clinical decision-support and patient-empowerment software prototype. It is not a certified diagnostic medical device and does not substitute for clinical medical judgment, professional consultation, or emergency care.

---

## Table of Contents

1. [Overview & Product Boundaries](#1-overview--product-boundaries)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Module Structure](#3-module-structure)
4. [Technology Stack](#4-technology-stack)
5. [Prerequisites](#5-prerequisites)
6. [Android Studio & JDK Setup](#6-android-studio--jdk-setup)
7. [Windows Quick Start](#7-windows-quick-start)
8. [Connecting to FastAPI Backend](#8-connecting-to-fastapi-backend)
9. [Emulator & Physical Device Network Setup](#9-emulator--physical-device-network-setup)
10. [Build Variants & Environment Configuration](#10-build-variants--environment-configuration)
11. [Authentication & Session Management](#11-authentication--session-management)
12. [Networking & Serialization](#12-networking--serialization)
13. [Offline Caching & Persistence (Room & DataStore)](#13-offline-caching--persistence-room--datastore)
14. [Background Work (WorkManager)](#14-background-work-workmanager)
15. [Notification Channels & Permissions](#15-notification-channels--permissions)
16. [Private Medical Report Processing](#16-private-medical-report-processing)
17. [Local AI Assistant Integration](#17-local-ai-assistant-integration)
18. [Care Orbit Design System](#18-care-orbit-design-system)
19. [Hugeicons VectorDrawable Pipeline](#19-hugeicons-vectordrawable-pipeline)
20. [Testing & Quality Assurance](#20-testing--quality-assurance)
21. [Build Outputs (APK & AAB)](#21-build-outputs-apk--aab)
22. [Release Signing Configuration](#22-release-signing-configuration)
23. [R8 Minification & Code Shrinking](#23-r8-minification--code-shrinking)
24. [Troubleshooting Guide](#24-troubleshooting-guide)
25. [Security & Privacy Guidelines](#25-security--privacy-guidelines)

---

## 1. Overview & Product Boundaries

The Matrigluco Android app provides a calm, responsive native interface built with **Kotlin, AndroidX XML Views, ViewBinding, Navigation Component, and MVVM**.

### Backend Dependency Boundary
* **FastAPI is the sole gateway**: The Android app **never** communicates directly with MySQL, Redis, Celery, private filesystem storage, or the local `llama.cpp` GGUF engine.
* **No Embedded LLM**: The AI model weights are hosted on the backend server; no GGUF files are bundled into the APK.
* **No Secret Storage**: Android is a public client. API keys, database credentials, JWT signing secrets, and cloud credentials must **never** be placed in Android code or `BuildConfig`.

---

## 2. Architecture & Data Flow

```text
                                Android UI Layer
                                       │
                                       ▼
                       ViewBinding Fragment / Activity
                                       │
                                       ▼
                      Hilt-Injected AAC ViewModel (StateFlow)
                                       │
                                       ▼
                           Domain Use Case / Interactor
                                       │
                                       ▼
                             Repository Pattern
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
       Local Cache & DataStore                   Remote Data Source
       (Room DB / EncryptedPrefs)                (Retrofit + OkHttp)
                   │                                       │
                   │                                       ▼
                   │                              FastAPI Backend (/api/v1)
                   │                                       │
                   └───────────────────────────────────────┘
                                       ▲
                                       │
                             WorkManager Workers
                         (HealthSync, ReportUpload)
```

---

## 3. Module Structure

The project follows a multi-module architecture separating domain layers and features:

```text
frontend/
├── app/                        # Main application shell, Navigation graph, MainActivity
├── core/
│   ├── common/                 # Base Result monad, dispatchers, extensions, time helpers
│   ├── model/                  # Pure Kotlin domain data classes and enums
│   ├── designsystem/           # Care Orbit theme, colors, typography, styles, Hugeicons XML
│   ├── ui/                     # Base fragments, view binding delegates, UI components
│   ├── network/                # Retrofit, OkHttp, auth interceptor, DTO contracts
│   ├── database/               # Room Database, TypeConverters, Entities, DAOs
│   ├── datastore/              # AndroidX DataStore for user preferences & themes
│   ├── auth/                   # SessionManager, TokenStorage, TokenAuthenticator
│   ├── notifications/          # NotificationManager, channels, notification builders
│   └── testing/                # Shared test doubles, mock repositories, test rules
├── feature/
│   ├── startup/                # Splash screen, onboarding flow, session routing
│   ├── auth/                   # Login, register, forgot password, email verification
│   ├── dashboard/              # Home view, Care Orbit signature, signal capsules
│   ├── tracking/               # Daily glucose, BP, weight logging, and record deletion
│   ├── assessment/             # Multi-step clinical maternal diabetes risk evaluation
│   ├── assistant/              # Local AI assistant chat interface & Markdown rendering
│   ├── reports/                # Medical lab report upload, OCR parsing, PDF viewing
│   └── history/                # Longitudinal vitals timeline and trend charts
├── sync/                       # WorkManager sync workers and background orchestrators
└── benchmark/                  # Macrobenchmark tests & Baseline Profile generators
```

---

## 4. Technology Stack

| Capability | Library / Tool | Version | Responsibility |
| :--- | :--- | :--- | :--- |
| **Language** | Kotlin | 2.3.20 | Type-safe native Android programming |
| **Build Tool** | Android Gradle Plugin (AGP) | 9.3.1 | Build lifecycle, compilation, packaging |
| **Gradle Wrapper** | Gradle | 9.5.0 | Reproducible, committed Gradle distribution |
| **Compile / Target** | Android SDK 36.1 | API 36 | Modern Android runtime compatibility |
| **Minimum SDK** | Android SDK 24 | API 24 (Android 7.0) | Broad device compatibility |
| **Dependency Injection**| Google Dagger Hilt | 2.60.1 | Compile-time dependency injection |
| **Code Generation** | KSP (Kotlin Symbol Processing)| 2.3.10 | Room & Hilt annotation processing |
| **UI Framework** | AndroidX XML Views + ViewBinding | 1.8+ | Deterministic layout rendering & binding |
| **Navigation** | Navigation Component | 2.9.8 | Type-safe fragment backstack & transitions |
| **HTTP Client** | Square Retrofit + OkHttp 3 | 3.0.0 / 5.1.0 | REST API client with interceptors |
| **Serialization** | `kotlinx.serialization` | 1.11.0 | Fast, reflection-free JSON parsing |
| **Local Database** | AndroidX Room | 2.8.4 | SQLite ORM cache with Kotlin Coroutines Flow |
| **Preferences** | AndroidX DataStore Preferences | 1.2.1 | Asynchronous transactional settings storage |
| **Background Tasks** | AndroidX WorkManager | 2.11.2 | Guaranteed background task execution |
| **Image Loading** | Coil | 2.6+ | Lightweight Kotlin coroutines image loader |
| **Testing** | JUnit 4 + Turbine + Espresso | 4.13 / 1.2 / 3.7 | Unit, Flow, and UI test harnesses |

---

## 5. Prerequisites

* **Android Studio**: Android Studio Ladybug (2024.2+) or Meerkat (2024.3+) with Android SDK 36 installed.
* **JDK**: **Java 17** (Selected via Android Studio's embedded JBR or `JAVA_HOME`).
* **Android SDK Build-Tools**: `36.0.0` or higher.
* **FastAPI Backend**: Matrigluco backend running on localhost or LAN (`http://127.0.0.1:8000`).

---

## 6. Android Studio & JDK Setup

1. Open **Android Studio** and select **Open** ➔ Choose `d:\Matrigluco\frontend`.
2. Open **File ➔ Settings ➔ Build, Execution, Deployment ➔ Build Tools ➔ Gradle**.
3. Under **Gradle JDK**, select **Embedded JDK (version 17 or 21)**.
4. Click **Sync Project with Gradle Files** (Elephant icon).

---

## 7. Windows Quick Start

Open PowerShell inside the `frontend/` directory:

```powershell
# 1. Enter Android frontend root
cd d:\Matrigluco\frontend

# 2. Check Gradle wrapper version
.\gradlew.bat --version

# 3. Execute unit tests
.\gradlew.bat testDebugUnitTest

# 4. Build Debug APK
.\gradlew.bat assembleDebug
```

The compiled Debug APK is located at:
```text
app/build/outputs/apk/debug/app-debug.apk
```

---

## 8. Connecting to FastAPI Backend

API endpoints are injected at compile-time via `BuildConfig.API_BASE_URL`.

### Gradle Property Keys

| Property | Default Value | Target Environment |
| :--- | :--- | :--- |
| `MATRIGLUCO_DEBUG_API_BASE_URL` | `http://10.0.2.2:8000/` | Local Emulator or LAN debugging |
| `MATRIGLUCO_STAGING_API_BASE_URL` | `https://staging-api.matrigluco.invalid/` | Staging testing environment |
| `MATRIGLUCO_RELEASE_API_BASE_URL` | *Required for release* | Production HTTPS endpoint |

> [!IMPORTANT]
> **Trailing Slash Requirement**: Retrofit strictly requires that base URLs end with a trailing slash `/` (e.g., `http://10.0.2.2:8000/`).

---

## 9. Emulator & Physical Device Network Setup

### 1. Android Studio Emulator
The Android emulator virtualizes its own network loopback. Use `10.0.2.2` to refer to your host PC:
```properties
# in gradle.properties or local.properties
MATRIGLUCO_DEBUG_API_BASE_URL=http://10.0.2.2:8000/
```

### 2. Physical Android Device (Wi-Fi LAN)
1. Find your development PC's IPv4 address:
   ```cmd
   ipconfig
   ```
   *(e.g., `192.168.31.44`)*
2. Start the backend bound to all interfaces:
   ```powershell
   cd ..\backend; python start.py --host 0.0.0.0
   ```
3. Set the property in `frontend/gradle.properties`:
   ```properties
   MATRIGLUCO_DEBUG_API_BASE_URL=http://192.168.31.44:8000/
   ```
4. Build and install the debug APK on your phone:
   ```powershell
   .\gradlew.bat installDebug
   ```

### 3. Physical Device (USB Reverse Port Forwarding)
```powershell
adb reverse tcp:8000 tcp:8000
```
Then use `http://127.0.0.1:8000/` as the debug URL.

---

## 10. Build Variants & Environment Configuration

| Variant | Application ID | Minify / R8 | Cleartext Policy | Target Usage |
| :--- | :--- | :---: | :--- | :--- |
| **`debug`** | `com.matrigluco.app.debug` | Disabled | Permitted on `10.0.2.2` / LAN | Day-to-day feature development |
| **`staging`** | `com.matrigluco.app.staging` | Enabled | Enforced HTTPS only | Internal testing & UAT demos |
| **`release`** | `com.matrigluco.app` | Enabled | Enforced HTTPS only | Signed Google Play / Production |

---

## 11. Authentication & Session Management

* **`SessionManager`**: Coordinates session state, token persistence, and logout callbacks.
* **Token Storage**: Access tokens and refresh tokens are securely encrypted using Android Keystore / `EncryptedSharedPreferences`.
* **`AuthInterceptor`**: Injects `Authorization: Bearer <token>` on all outbound authenticated requests.
* **`TokenAuthenticator`**: Automatically catches HTTP 401 Unauthorized responses, executes a synchronized single-flight refresh request to `/api/v1/auth/refresh`, updates the token cache, and replays failed calls without infinite loops.

---

## 12. Networking & Serialization

* **JSON Configuration**: Shared `Json` instance configured with `ignoreUnknownKeys = true`, `explicitNulls = false`, and `coerceInputValues = false`.
* **Network Logging**: Uses `HttpLoggingInterceptor.Level.BASIC` on debug builds. **Never logs sensitive health payloads, medical reports, or auth tokens**.

---

## 13. Offline Caching & Persistence (Room & DataStore)

* **Room Database**: Operates strictly as a local offline cache and fast UI query layer. MySQL is the primary source of truth.
* **Room Schema Authority**: Controlled via versioned migrations (`@Database(version = 1, ...)`).
* **DataStore**: Stores user preferences (dark/light theme, notification preferences) and onboarding status.

---

## 14. Background Work (WorkManager)

* **`HealthSyncWorker`**: Periodically syncs locally recorded blood glucose and blood pressure readings when connectivity is restored.
* **`ReportUploadWorker`**: Resilient background upload worker for large PDF and image medical files.
* **`NotificationSyncWorker`**: Polls and updates active clinical alerts and reminders.
* **Hilt Integration**: Configured with `@HiltWorker` and `HiltWorkerFactory` via `Configuration.Provider`.

---

## 15. Notification Channels & Permissions

* **Permission**: Requests `POST_NOTIFICATIONS` contextually on Android 13+ (API 33+).
* **Channels**:
  * `care_reminders`: High-priority medication and glucose logging alerts.
  * `report_updates`: Status notifications when report OCR extraction completes.
  * `system_alerts`: Non-clinical account security alerts.

---

## 16. Private Medical Report Processing

1. **Document Selection**: Uses the native Android **Storage Access Framework (SAF)** / Photo Picker (`ActivityResultContracts.OpenDocument`).
2. **Private Upload**: Uploads files via multipart form data to `/api/v1/files/upload`.
3. **Authenticated Viewing**: Securely loads reports via `/api/v1/files/{id}/download` using authenticated streaming tokens. Direct public URLs are prohibited.

---

## 17. Local AI Assistant Integration

* **Conversation Dialogue**: Powered by `/api/v1/chatbot/conversations` with real-time SSE streaming support.
* **Context Gate**: Requires explicit user consent before attaching health profile metrics to conversation queries.
* **Markdown Rendering**: Renders clinical nutrition guidelines and formatted text with citation pills.

---

## 18. Care Orbit Design System

* **Brand Colors**:
  * Care Pink (`#D94F7D` / `#F06F9D`)
  * Neutral Light Canvas (`#FFFFFF` / `#F8F6F7`)
  * Zinc Dark Canvas (`#0D0B0C` / `#161314`)
* **Custom UI Components**:
  * `OrbitButton`: Accessible primary and outline action buttons with loading spinners.
  * `SignalCapsule`: Circular health indicator badges with recency timestamps.
  * `HealthHorizon`: Maternal status hero card with gestational age tracking.

---

## 19. Hugeicons VectorDrawable Pipeline

* **Source**: Approved Hugeicons SVG icons converted into native Android `VectorDrawable` XML files.
* **Location**: `core/designsystem/src/main/res/drawable/` with `ic_huge_` prefix (e.g., `ic_huge_home.xml`, `ic_huge_activity.xml`).
* **Contribution Rule**: Do not import third-party icon libraries. Convert approved SVGs to VectorDrawables using Android Studio's Vector Asset tool.

---

## 20. Testing & Quality Assurance

```powershell
# Run all unit tests across all modules
.\gradlew.bat testDebugUnitTest

# Run unit tests for a specific module
.\gradlew.bat :feature:tracking:testDebugUnitTest
.\gradlew.bat :feature:assessment:testDebugUnitTest

# Run Android Lint quality analysis
.\gradlew.bat lintDebug

# Run instrumented UI tests (requires connected device/emulator)
.\gradlew.bat connectedDebugAndroidTest
```

---

## 21. Build Outputs (APK & AAB)

| Build Target | Command | Output Path |
| :--- | :--- | :--- |
| **Debug APK** | `.\gradlew.bat assembleDebug` | `app/build/outputs/apk/debug/app-debug.apk` |
| **Staging APK** | `.\gradlew.bat assembleStaging` | `app/build/outputs/apk/staging/app-staging.apk` |
| **Release APK** | `.\gradlew.bat assembleRelease` | `app/build/outputs/apk/release/app-release.apk` |
| **Release AAB** | `.\gradlew.bat bundleRelease` | `app/build/outputs/bundle/release/app-release.aab` |

---

## 22. Release Signing Configuration

Do not commit keystores or passwords to Git. Configure release credentials via environment variables or `local.properties`:

```properties
# In local.properties (ignored by Git)
MATRIGLUCO_RELEASE_KEYSTORE_PATH=C:\\secure\\matrigluco-release.jks
MATRIGLUCO_RELEASE_KEY_ALIAS=matrigluco_key
MATRIGLUCO_RELEASE_STORE_PASSWORD=your_keystore_password
MATRIGLUCO_RELEASE_KEY_PASSWORD=your_key_password
```

---

## 23. R8 Minification & Code Shrinking

* **Configuration**: `proguard-rules.pro` and module-specific `consumer-rules.pro`.
* **Preserved Rules**: Keep rules configured for `kotlinx.serialization` serializable classes, Retrofit DTOs, and Room entities.

---

## 24. Troubleshooting Guide

### 1. `CLEARTEXT communication not permitted by network security policy`
* Verify that you are running a `debug` build variant.
* Check that the target IP (e.g. `10.0.2.2` or `192.168.31.44`) is included in `network_security_config.xml`.

### 2. `Retrofit IllegalArgumentException: baseUrl must end in /`
* Ensure `MATRIGLUCO_DEBUG_API_BASE_URL` ends with a trailing slash (e.g. `http://10.0.2.2:8000/`).

### 3. `Failed to connect to /10.0.2.2:8000`
* Verify that the FastAPI backend is running on your host machine.
* Open `http://127.0.0.1:8000/api/v1/health/live` in your host browser to confirm server readiness.

### 4. `Gradle Sync Failed: Unsupported Java Version`
* Ensure your Gradle JDK in Android Studio is set to **JDK 17**.

### 5. `Room Database Migration Error`
* Verify that you have provided a migration path in `DatabaseMigrations.kt` when updating entity fields.

---

## 25. Security & Privacy Guidelines

* **Zero Hard-Coded Credentials**: No passwords, JWT secrets, or cloud keys in source code.
* **Scoped Cleartext**: Cleartext HTTP is limited strictly to local development addresses; production release enforces HTTPS.
* **No PHI in Logcat**: Patient names, glucose measurements, and medical report text are masked in log output.
* **Encrypted Storage**: Auth tokens are stored in Android Keystore-backed encrypted storage.
