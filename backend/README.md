# Matrigluco Backend

FastAPI platform for authentication, maternal-health tracking, risk assessment, private medical-report processing, consultations, notifications, and the local-server AI Assistant.

> [!NOTE]
> **Medical Technology Notice**: Matrigluco is an academic clinical decision-support and patient-empowerment software prototype. It is not a certified diagnostic medical device and does not substitute for clinical medical judgment, professional consultation, or emergency care.

---

## 1. Quick Command Card (Clean Clone to Running Backend)

```powershell
# 1. Enter backend directory & create virtual environment
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Upgrade packaging tools & install runtime dependencies
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -r requirements/dev.txt

# 3. Configure environment
Copy-Item .env.example .env

# 4. Start XAMPP MySQL & Create Database / User in MySQL
# (See Section 10 for dedicated user SQL command)

# 5. Run database schema migrations
python -m alembic upgrade head

# 6. Start Redis service (127.0.0.1:6379)

# 7. Preflight check & start development stack
python start.py --check
python start.py
```

---

## 2. Architecture & Subsystems

```text
               Web Client (React/Vite)       Android Client (Kotlin/XML)
                           │                               │
                           └───────────────┬───────────────┘
                                           │ HTTPS / HTTP
                                           ▼
                             ┌───────────────────────────┐
                             │    FastAPI Application    │
                             │ (Routing, Auth, Validat.) │
                             └─────────────┬─────────────┘
                                           │
         ┌───────────────────┬─────────────┴───────┬───────────────────┐
         ▼                   ▼                     ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ MySQL / MariaDB │ │      Redis      │ │ Private Storage │ │ ML Risk Engine  │
│  (Data Source   │ │ (Cache, Locks,  │ │ (Encrypted Lab  │ │ (LogisticRegr. / │
│   of Truth)     │ │ Rate Limits)    │ │  PDFs & Images) │ │ StandardScaler) │
└─────────────────┘ └────────┬────────┘ └─────────────────┘ └─────────────────┘
                             │ Broker / Transport
                             ▼
                    ┌─────────────────┐
                    │  Celery Worker  │
                    │ (Async Tasks &  │
                    │ OCR Extraction) │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ AI Assistant    │
                    │ (Local GGUF /   │
                    │ llama-cpp / RAG)│
                    └─────────────────┘
```

### Component Responsibility Table

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **API Server** | FastAPI, Uvicorn, Pydantic v2 | HTTP request validation, JWT authentication, REST endpoints, streaming responses |
| **Database** | MySQL 8.0+ / MariaDB (via PyMySQL) | Durable, transactional source of truth for users, vitals, predictions, reports |
| **Schema Authority** | Alembic | Version-controlled schema migrations (`alembic upgrade head`) |
| **Cache & Coordination** | Redis 7+ | Session revocation, rate limiting, idempotency keys, distributed locks |
| **Task Queue** | Celery 5.3+ (Redis transport) | Async document OCR parsing, notification dispatch, longitudinal analytics |
| **Scheduler** | Celery Beat | Periodic background cron jobs (vitals reminders, data retention cleanup) |
| **ML Inference** | scikit-learn, NumPy, pandas, joblib | Versioned clinical maternal diabetes risk scoring & biomarker normalization |
| **AI Assistant** | `llama-cpp-python` / GGUF | Local, offline conversational maternal assistant; zero cloud API leaks |
| **Document AI** | PyMuPDF, Pillow, xhtml2pdf | Lab report parsing, OCR text extraction, clinical PDF report rendering |
| **Private Storage** | Filesystem / Local volume | Sandboxed private medical documents with authenticated token access |

---

## 3. Technology Stack & Dependencies

Dependencies are classified into modular requirements layers located in `requirements/`:

* `requirements.txt` → Root entrypoint for backwards compatibility (`-r requirements/base.txt`).
* `requirements/base.txt` → Core production runtime dependencies.
* `requirements/dev.txt` → Testing, static analysis, linting, and developer tooling.
* `requirements/ai-local.txt` → Offline `llama-cpp-python` engine dependencies.

### Dependency Classification

```text
CORE API            : fastapi, uvicorn[standard], pydantic, pydantic-settings,
                      email-validator, python-multipart, httpx, requests, tenacity, structlog
DATABASE            : sqlalchemy (2.x), pymysql, cryptography, alembic
AUTH & SECURITY     : PyJWT, argon2-cffi, bcrypt
CACHE & QUEUES      : redis, celery[redis]
ML INFERENCE        : scikit-learn, xgboost, pandas, numpy, scipy, joblib
DOCUMENTS & OCR     : PyMuPDF, pillow, Jinja2, xhtml2pdf
LOCAL AI ASSISTANT  : llama-cpp-python
DEVELOPMENT & TEST  : pytest, pytest-asyncio, pytest-cov, ruff, mypy, pre-commit, rich
```

---

## 4. Repository Structure

```text
backend/
├── alembic/                    # Alembic migration environment & scripts
│   ├── env.py                  # Migration runner binding SQLAlchemy metadata
│   └── versions/               # Sequential versioned migration files
├── app/
│   ├── ai/                     # Local offline AI chatbot & RAG engine
│   │   ├── chatbot/            # Context builder, prompt templates, stream engine
│   │   ├── rag/                # Document embedding & knowledge retrieval
│   │   └── runtime/            # llama.cpp GGUF execution engine
│   ├── api/                    # API route definitions
│   │   └── v1/
│   │       └── endpoints/      # Domain route controllers (auth, tracking, reports, etc.)
│   ├── cache/                  # Redis cache client & distributed locking
│   ├── core/                   # Security, settings (Pydantic BaseSettings), logging, exceptions
│   ├── db/                     # SQLAlchemy session management & base model
│   ├── document_ai/            # Document parsing, OCR extraction & tabular reconstruction
│   ├── integrations/           # External service clients & fallback OCR parsers
│   ├── ml/                     # Clinical machine learning models & feature contracts
│   │   ├── artifacts/          # Versioned model files (.joblib) and metadata (.json)
│   │   └── inference/          # Preprocessor loader, feature order validation, predictor
│   ├── models/                 # SQLAlchemy ORM database models
│   ├── repositories/           # Data access layer / repository pattern
│   ├── schemas/                # Pydantic v2 validation & response DTOs
│   ├── services/               # Clinical business logic & service coordination
│   ├── storage/                # Encrypted private storage provider
│   └── workers/                # Celery application & asynchronous background tasks
├── docs/                       # Technical architecture & subsystem specifications
├── requirements/               # Layered dependency definitions (base.txt, dev.txt, ai-local.txt)
├── scripts/                    # Maintenance, data generation, and migration scripts
├── storage/                    # Local storage root for private medical files
├── tests/                      # Pytest unit, integration, and API test suites
├── .env.example                # Canonical environment variable template
├── alembic.ini                 # Alembic configuration
├── pyproject.toml              # Pytest, Ruff, and Mypy project configuration
├── requirements.txt            # Root compatibility requirements file
├── runtime.txt                 # Target Python runtime version
└── start.py                    # Unified development process launcher
```

---

## 5. Prerequisites

### Windows Development (Recommended)
1. **Python 3.11 – 3.14**: Ensure Python is added to `PATH`. (Python 3.11 or 3.12 recommended for instant pre-compiled `llama-cpp-python` wheels).
2. **XAMPP**: Running Apache/MySQL (`http://localhost/phpmyadmin`).
3. **Redis**: Redis 7+ via Docker (`docker run -p 6379:6379 redis:7-alpine`), WSL (`sudo service redis-server start`), or native service.
4. **Git**: Standard command-line git client.
5. **C++ Build Tools (Optional)**: Only needed if building `llama-cpp-python` from source on Python 3.14.

### Linux / macOS Development
1. **Python 3.11+**: `sudo apt install python3 python3-venv python3-pip`
2. **MySQL Server**: `sudo apt install mysql-server`
3. **Redis Server**: `sudo apt install redis-server && sudo systemctl start redis`

---

## 6. Step-by-Step Setup Guide (Windows / XAMPP)

### Step 1 — Virtual Environment & Dependencies

Open PowerShell in the `backend/` directory:

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip & install dependencies
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements/dev.txt
```

> **PowerShell Execution Policy Note**: If script execution is restricted, run:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```
> or use Command Prompt (`venv\Scripts\activate.bat`).

---

### Step 2 — MySQL Database & User Configuration

1. Open **XAMPP Control Panel** and click **Start** on **MySQL**.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI.
3. Create the dedicated `matrigluco_app` user and `matrigluco` database:

```sql
CREATE DATABASE IF NOT EXISTS matrigluco
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'matrigluco_app'@'localhost' IDENTIFIED BY 'matrigluco_dev_password_2026';

GRANT ALL PRIVILEGES ON matrigluco.* TO 'matrigluco_app'@'localhost';
FLUSH PRIVILEGES;
```

> [!IMPORTANT]
> **Schema Authority Rule**: Alembic is the **sole schema authority**. Do not manually create tables or alter columns in phpMyAdmin. Alembic migrations define the exact database schema.

---

### Step 3 — Environment Configuration (`.env`)

Copy the template file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and verify database and secret settings:

```env
APP_NAME=Matrigluco
APP_ENV=development
DEBUG=true

# Database Connection (PyMySQL Driver)
DATABASE_URL=mysql+pymysql://matrigluco_app:matrigluco_dev_password_2026@127.0.0.1:3306/matrigluco?charset=utf8mb4

# Authentication Cryptography
JWT_SECRET_KEY=change_this_to_a_secure_random_64_char_secret_key_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=14

# Transient Cache & Celery Queues
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/1
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/2

# Storage & Models
STORAGE_PROVIDER=local
PRIVATE_STORAGE_ROOT=storage/private
ML_MODEL_KEY=diabetes-risk
ML_MODEL_VERSION=1.0.0
AI_ENABLED=true
AI_MODEL_PATH=storage/ai/models/model.gguf
```

---

### Step 4 — Run Alembic Database Migrations

Apply the versioned migrations to build the complete database schema:

```powershell
python -m alembic upgrade head
```

Verify migration status:
```powershell
python -m alembic current
```
*(Expected output: `008_notifications_summaries (head)`)*

---

### Step 5 — Verify Preflight & Launch Services

Run the preflight verification check:

```powershell
python start.py --check
```

Start the unified development stack (FastAPI server + Celery worker):

```powershell
python start.py
```

The launcher will display the **Care Orbit v2.0** console banner, discover your LAN IP address, verify Redis broker availability, and supervise both FastAPI (Uvicorn) and Celery processes.

---

## 7. Unified Developer Launcher (`start.py`)

`start.py` orchestrates local developer processes. It does not contain application business logic and does not run destructive schema operations.

### Available CLI Flags

| Flag | Argument | Description | Default |
| :--- | :--- | :--- | :--- |
| `--host` | `HOST` | Bind IP address for Uvicorn server | `127.0.0.1` |
| `--port` | `PORT` | TCP port for FastAPI API server | `8000` |
| `--external` | *none* | Bind server to `0.0.0.0` for LAN and Android testing | `False` |
| `--api-only` | *none* | Start FastAPI server only (disables Celery worker) | `False` |
| `--worker-only` | *none* | Start Celery worker only (disables FastAPI server) | `False` |
| `--no-worker` | *none* | Disable Celery background worker | `False` |
| `--beat` | *none* | Start Celery Beat periodic task scheduler | `False` |
| `--no-reload` | *none* | Disable Uvicorn code change auto-reload | `False` |
| `--check` | *none* | Run configuration and connectivity checks, then exit | `False` |
| `--migrate` | *none* | Execute `alembic upgrade head` before starting | `False` |
| `--log-level` | `LEVEL` | Set log level (`debug`, `info`, `warning`, `error`) | `info` |
| `--celery-pool`| `POOL` | Set Celery execution pool (`solo`, `threads`, `prefork`) | `solo` (Windows) |

### Common Development Commands

```powershell
# Standard local development (API + Celery Worker)
python start.py

# LAN mode (allows physical Android devices & laptops on same Wi-Fi)
python start.py --external

# API server only (lightweight mode without background worker)
python start.py --api-only

# Celery worker only (for focused asynchronous task debugging)
python start.py --worker-only

# Full stack with periodic scheduler (API + Worker + Celery Beat)
python start.py --beat

# Preflight check without starting processes
python start.py --check
```

---

## 8. Android & Mobile Network Development

When developing with the Matrigluco Android app, configure the network binding properly:

### 1. Physical Device Testing (Same Wi-Fi Network)
1. Discover your PC's local LAN IPv4 address in PowerShell / CMD:
   ```cmd
   ipconfig
   ```
   *(Look for Wireless LAN adapter IPv4 Address, e.g., `192.168.31.44`)*
2. Start the backend bound to all network interfaces:
   ```powershell
   python start.py --host 0.0.0.0
   ```
3. In `frontend/gradle.properties`, set:
   ```properties
   MATRIGLUCO_DEBUG_API_BASE_URL=http://192.168.31.44:8000/
   ```
4. If using USB debugging, configure ADB reverse port forwarding:
   ```powershell
   adb reverse tcp:8000 tcp:8000
   ```

### 2. Android Emulator Testing
The Android emulator runs inside a virtual network where `10.0.2.2` maps to the host machine's `127.0.0.1`:
```properties
MATRIGLUCO_DEBUG_API_BASE_URL=http://10.0.2.2:8000/
```

> [!WARNING]
> Do not attempt to browse to `http://0.0.0.0:8000` in a browser; `0.0.0.0` is a network bind directive. Open `http://127.0.0.1:8000` on the host PC or `http://<LAN-IP>:8000` on connected LAN devices.

---

## 9. Clinical ML & AI Assistant

### 9.1 Clinical Machine Learning (GDM Risk Prediction)
* **Artifact Path**: `app/ml/artifacts/diabetes-risk/1.0.0/`
* **Artifact Files**: `model.joblib` (Classifier), `preprocessor.joblib` (StandardScaler), `metadata.json` (Contract & thresholds).
* **Feature Schema Contract**: Requires strictly ordered features:
  1. `Pregnancies` (count)
  2. `Glucose` (mg/dL)
  3. `BloodPressure` (mmHg)
  4. `SkinThickness` (mm)
  5. `Insulin` (μU/mL)
  6. `BMI` (kg/m²)
  7. `DiabetesPedigreeFunction` (unitless score)
  8. `Age` (years)
* **Model Loader**: `MLModelLoader` calculates SHA-256 checksums, prevents feature drift, and guarantees thread-safe cached inference.

### 9.2 Local Offline AI Assistant (`llama.cpp`)
* **Engine**: Local GGUF runtime powered by `llama-cpp-python`.
* **Zero Cloud Leakage**: No conversation or health data is ever transmitted to third-party cloud LLM APIs.
* **Model Placement**: Place a compatible GGUF model file (e.g. Llama 3.2 3B Instruct) at:
  ```text
  backend/storage/ai/models/model.gguf
  ```
* **Fallback Mode**: When running with `AI_ENABLED=false` or if `model.gguf` is omitted, Matrigluco seamlessly falls back to the deterministic **Clinical Knowledge Reasoning Runtime**.

---

## 10. Private Medical Document Storage & OCR

1. **Storage Sandboxing**: Files are stored in `storage/private/` under UUID-based storage keys. Direct public URL access is prohibited.
2. **Access Control**: Downloads are verified against user ownership through authenticated endpoints (`GET /api/v1/files/{file_id}/download`).
3. **MIME Validation & Size Limits**: Uploads are restricted to `application/pdf`, `image/jpeg`, `image/png` up to `10 MB`.
4. **Biomarker OCR Pipeline**: Async worker processes lab reports using PyMuPDF and pattern recognition to extract HbA1c, fasting glucose, and blood pressure into structured health records.

---

## 11. Testing & Code Quality

Run the comprehensive pytest test suite:

```powershell
# Run all unit and integration tests
python -m pytest -v

# Run with test coverage report
python -m pytest --cov=app --cov-report=term-missing

# Run focused subsystem tests
python -m pytest tests/api/test_auth.py
python -m pytest tests/unit/test_ml_inference.py
python -m pytest tests/unit/test_start_launcher.py
```

### Static Analysis & Linting

```powershell
# Fast static lint check
python -m ruff check .

# Automated code formatting check
python -m ruff format --check .

# Static type checking
python -m mypy app
```

---

## 12. Health & Observability Endpoints

| Endpoint | Method | Purpose |
| :--- | :---: | :--- |
| `/api/v1/health/live` | `GET` | **Liveness Probe**: Confirms FastAPI process is responsive. |
| `/api/v1/health/ready` | `GET` | **Readiness Probe**: Verifies database connection, cache status, ML model bundle, and private storage accessibility. |
| `/docs` | `GET` | **Interactive Swagger UI**: OpenAPI 3.1 documentation and schema test workbench. |
| `/redoc` | `GET` | **ReDoc Documentation**: Clean technical reference. |

### Sample Liveness Verification

```bash
curl http://127.0.0.1:8000/api/v1/health/live
```
```json
{
  "status": "healthy",
  "service": "Matrigluco API",
  "version": "1.0.0"
}
```

---

## 13. Troubleshooting

### 1. `ModuleNotFoundError: No module named '...'`
* Ensure your virtual environment is active: `.\.venv\Scripts\Activate.ps1`.
* Reinstall requirements: `pip install -r requirements/dev.txt`.
* Run `python -m pip check` to verify dependency integrity.

### 2. `MySQL Connection Refused / Access Denied`
* Check that **MySQL** is running in **XAMPP Control Panel**.
* Verify `DATABASE_URL` in `.env` matches your MySQL port (default: `3306`) and user credentials.
* Test connecting with the MySQL command line client:
  ```cmd
  mysql -u matrigluco_app -p -h 127.0.0.1 matrigluco
  ```

### 3. `Port 8000 is already in use`
* Identify the process occupying port 8000:
  ```cmd
  netstat -ano | findstr :8000
  ```
* Terminate the specific process ID:
  ```cmd
  taskkill /PID <PID> /F
  ```
* Alternatively, specify a different port: `python start.py --port 8080`.

### 4. `Redis Connection Error / Celery Worker Cannot Connect`
* Ensure Redis server is running: `docker run -p 6379:6379 -d redis:7-alpine`.
* If developing without background queues, start in API-only mode: `python start.py --no-worker`.

### 5. `Celery Windows Error (ValueError: not enough values to unpack)`
* Windows does not support Celery `prefork` process pooling. Always use `--pool=solo` on Windows (automatically handled by `start.py`).

### 6. `CORS Blocked by Browser`
* Add your web development origin to `FRONTEND_ORIGINS` in `.env`:
  ```env
  FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  ```

---

## 14. Development vs. Production Architecture

> [!WARNING]
> `start.py`, XAMPP MySQL, and `--reload` are strictly local development tools. **Never use XAMPP or `start.py` in production.**

### Production Architecture Guidelines
1. **Operating System**: Linux (Ubuntu 22.04 LTS or enterprise container runtime).
2. **Process Supervision**: Systemd units, Docker Compose, or Kubernetes pods.
3. **Application Server**: Gunicorn / Uvicorn worker pool:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers
   ```
4. **Celery Worker**: Supervised background process with default prefork concurrency:
   ```bash
   celery -A app.workers.celery_app:celery_app worker --loglevel=INFO --concurrency=4
   ```
5. **Database**: Managed MySQL 8.0+ / AWS RDS / Aurora cluster with automated snapshots, TLS encryption, and least-privilege credentials.
6. **Reverse Proxy**: NGINX or Cloudflare terminating TLS with strict HSTS, CORS, and rate limiting.
7. **Storage**: Private object storage (S3-compatible bucket) with server-side encryption and signed URLs.

---

## 15. Security & Privacy Rules

* **Zero Secret Commits**: Never commit `.env`, private keys, or API tokens to git.
* **Password Hashing**: Uses **Argon2id** (`time_cost=3`, `memory_cost=64MB`, `parallelism=4`) with legacy bcrypt verification.
* **Token Invalidation**: Refresh tokens are cryptographically hashed in the database; logging out or changing a password immediately revokes active sessions.
* **Protected Health Information (PHI)**: All patient records enforce row-level ownership checks preventing cross-tenant data leakage.
* **Sanitized Logs**: Database credentials, passwords, and raw OCR health text are never output to unmasked log sinks.
