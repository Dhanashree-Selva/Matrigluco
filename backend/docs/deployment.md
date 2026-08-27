# MatriGluco Local Development and Production Operating Model

---

## 1. Operating Principle

> **ONE BACKEND CODEBASE — TWO COMPATIBLE OPERATING MODELS**
>
> The Python application, domain services, models, repositories, and API routes remain **100% identical** across local Windows development and Linux production deployments.
> Differences exist exclusively in **configuration, process supervisors, concurrency settings, storage mount paths, and infrastructure management**.

```text
LOCAL DEVELOPMENT (Windows)              PRODUCTION DEPLOYMENT (Linux)
- Python .venv                           - Python virtual environment / container
- XAMPP MySQL / MariaDB (Local 3306)     - Managed MySQL / MariaDB cluster
- Redis (WSL / Native / Docker 6379)     - Managed private Redis service
- Uvicorn --reload (Single process)      - Supervised Uvicorn (Tuned worker count)
- Celery --pool=solo (Windows compat)    - Supervised Celery prefork workers
- Celery Beat (Manual when testing)      - Supervised Celery Beat singleton
- Local private filesystem storage       - Encrypted persistent volume / object store
- Versioned ML model artifacts           - Immutable release ML artifacts
- Optional in-process llama.cpp GGUF     - Optional in-process local AI (1 worker)
```

---

## 2. Local Windows Development Guide

### 2.1 Prerequisites
- **Python 3.10+** (verified via `python --version`)
- **XAMPP** (with MySQL / MariaDB service running on `127.0.0.1:3306`)
- **Redis** (running locally via WSL, Docker, or native Windows service on `127.0.0.1:6379`)
- **PowerShell / Command Prompt**

### 2.2 Step-by-Step Setup (Working Directory: `backend/`)

#### Step 1: Virtual Environment Creation
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

#### Step 2: Install Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r requirements/dev.txt

# Optional: If developing/testing local offline AI chatbot
pip install -r requirements/ai-local.txt
```

#### Step 3: Configure `.env`
```powershell
Copy-Item .env.example .env
```
Ensure `.env` contains:
```ini
APP_ENV=development
DEBUG=true
DATABASE_URL=mysql+pymysql://matrigluco_app:StrongAppPassword@127.0.0.1:3306/matrigluco
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/1
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/2
STORAGE_ROOT=./storage
```

#### Step 4: Start XAMPP MySQL Database
1. Open **XAMPP Control Panel**.
2. Click **Start** on MySQL.
3. If running for the first time, create the `matrigluco` database and `matrigluco_app` user:
```sql
CREATE DATABASE IF NOT EXISTS matrigluco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'matrigluco_app'@'localhost' IDENTIFIED BY 'StrongAppPassword';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON matrigluco.* TO 'matrigluco_app'@'localhost';
FLUSH PRIVILEGES;
```

#### Step 5: Apply Alembic Migrations
```powershell
alembic upgrade head
alembic current
```

#### Step 6: Start FastAPI Server (Terminal 1)
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Base: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health Probe: `http://127.0.0.1:8000/health/live`

#### Step 7: Start Celery Worker (Terminal 2 — Optional for pure CRUD)
```powershell
celery -A app.workers.celery_app.celery_app worker --loglevel=INFO --pool=solo --queues=default,reports,notifications,analytics
```
> [!NOTE]
> On Windows, `--pool=solo` is the stable development execution model. It runs one background task at a time and avoids fragile Windows process forking behavior.

#### Step 8: Start Celery Beat Scheduler (Terminal 3 — Optional for schedule testing)
```powershell
celery -A app.workers.celery_app.celery_app beat --loglevel=INFO
```
> [!IMPORTANT]
> Run **at most one** Celery Beat instance to avoid duplicate scheduled task emission.

---

## 3. PowerShell Convenience CLI (`scripts.ps1`)

Developers on Windows can use shortcut commands:
```powershell
.\scripts.ps1 verify      # Run environment & infrastructure check
.\scripts.ps1 install     # Install dev dependencies
.\scripts.ps1 migrate     # Run alembic upgrade head
.\scripts.ps1 api         # Start Uvicorn dev server
.\scripts.ps1 worker      # Start Celery worker (solo pool, all queues)
.\scripts.ps1 beat        # Start Celery Beat scheduler
.\scripts.ps1 test        # Run pytest test suite (180 tests)
.\scripts.ps1 lint        # Run ruff and mypy checks
.\scripts.ps1 smoke-ml    # Run ML tabular risk smoke test
.\scripts.ps1 smoke-ai    # Run AI chatbot smoke test
```

---

## 4. Production Linux Deployment Model

### 4.1 Production Boundary Invariants
- **XAMPP is local only**: Production uses managed MySQL / MariaDB with automatic backups and least-privilege users.
- **Uvicorn `--reload` is forbidden**: Production uses static worker processes behind a reverse proxy.
- **Database Root is forbidden**: In `APP_ENV=production`, `app/db/engine.py` strictly refuses to connect if configured with the MySQL `root` user.
- **Single Celery Beat**: Exactly one Beat process is permitted per cluster.

---

## 5. Production Topology & Reverse Proxy Architecture

```text
                    Public Internet (HTTPS :443)
                               │
                               ▼
                 Reverse Proxy (Nginx / Caddy / Cloudflare)
                 [Handles TLS termination, rate limits, gzip]
                               │ HTTP (:8000)
                               ▼
                     FastAPI / Uvicorn
              (Supervised systemd: matrigluco-api)
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     MySQL / MariaDB         Redis         Private Storage
      (Durable State)    (Transient)     (/srv/matrigluco/storage)
      (Port 3306)              │
                               ├──────────────────┐
                               │                  │
                               ▼                  ▼
                         Celery Broker      Cache & Locks
                          (Redis DB /1)      (Redis DB /0)
                               │
                               ▼
                   Celery Worker Processes
            (Supervised systemd: matrigluco-worker)
            (Consumes: default, reports, notifications, analytics)

                     Celery Beat Scheduler
             (Supervised systemd: matrigluco-beat)
```

---

## 6. Uvicorn Worker Count & Local AI Memory Sizing

When deploying FastAPI in production:

| Runtime Configuration | Recommended Uvicorn Workers | Rationale |
| :--- | :---: | :--- |
| **`AI_ENABLED=false`** | `2` to `4` workers | Pure Python CPU/IO bound workloads. Standard scaling based on CPU cores. |
| **`AI_ENABLED=true` (in-process GGUF)** | **`1` worker** | Each Uvicorn worker loads an independent GGUF model copy into process RAM (e.g. 2.2 GB each). 1 worker prevents RAM exhaustion. |

---

## 7. Production Systemd Service Units

### 7.1 `/etc/systemd/system/matrigluco-api.service`
```ini
[Unit]
Description=MatriGluco FastAPI Backend Application
After=network.target mysql.service redis.service

[Service]
Type=simple
User=matrigluco
Group=matrigluco
WorkingDirectory=/srv/matrigluco/backend
EnvironmentFile=/etc/matrigluco/backend.env
ExecStart=/srv/matrigluco/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
Restart=on-failure
RestartSec=5s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

### 7.2 `/etc/systemd/system/matrigluco-worker.service`
```ini
[Unit]
Description=MatriGluco Celery Background Task Worker
After=network.target redis.service mysql.service

[Service]
Type=simple
User=matrigluco
Group=matrigluco
WorkingDirectory=/srv/matrigluco/backend
EnvironmentFile=/etc/matrigluco/backend.env
ExecStart=/srv/matrigluco/backend/.venv/bin/celery -A app.workers.celery_app.celery_app worker --loglevel=INFO --queues=default,reports,notifications,analytics
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

### 7.3 `/etc/systemd/system/matrigluco-beat.service`
```ini
[Unit]
Description=MatriGluco Celery Beat Periodic Scheduler (Singleton)
After=network.target redis.service

[Service]
Type=simple
User=matrigluco
Group=matrigluco
WorkingDirectory=/srv/matrigluco/backend
EnvironmentFile=/etc/matrigluco/backend.env
ExecStart=/srv/matrigluco/backend/.venv/bin/celery -A app.workers.celery_app.celery_app beat --loglevel=INFO
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

---

## 8. Database Connection Capacity Planning

Calculate total maximum MySQL connections:
$$\text{Max Connections} \ge (\text{API Workers} \times \text{DB\_POOL\_SIZE}) + (\text{Celery Concurrency} \times \text{DB\_POOL\_SIZE}) + \text{Headroom (10)}$$

Example for a standard deployment:
$$(1 \times 10) + (4 \times 5) + 10 = 40 \text{ connections}$$
Configure MySQL `max_connections = 100` to guarantee ample connection headroom.

---

## 9. Production Release & Deployment Sequence

1. **Pull Code**: Checkout verified release commit/tag.
2. **Verify Environment**:
   ```bash
   python scripts/verify_environment.py
   ```
3. **Execute Database Migrations** (run once before starting processes):
   ```bash
   alembic upgrade head
   ```
4. **Restart Services Gracefully**:
   ```bash
   sudo systemctl restart matrigluco-api
   sudo systemctl restart matrigluco-worker
   sudo systemctl restart matrigluco-beat
   ```
5. **Verify Operational Health**:
   ```bash
   curl -s http://127.0.0.1:8000/api/v1/health/live
   curl -s http://127.0.0.1:8000/api/v1/health/ready
   ```

---

## 10. Backup & Disaster Recovery Architecture

| Component | Asset Type | Backup Schedule | Recovery Target |
| :--- | :--- | :--- | :--- |
| **MySQL Database** | Clinical records, users, predictions, audit | Nightly `mysqldump --single-transaction` + WAL binlogs | Point-in-time recovery (RPO < 1 hour, RTO < 30 min) |
| **Private File Storage** | Medical lab PDFs, patient ultrasound scans | Daily incremental encrypted filesystem snapshots | 100% file restoration paired with DB metadata |
| **ML Model Artifacts** | Versioned scikit-learn models & manifests | Immutable Git/Release repository | Instant redeployment from release bundle |
| **AI Model (GGUF)** | llama.cpp quantized weights (~2.2 GB) | S3 / Internal artifact repository | Re-provisioned via deployment script |
| **Redis Cache** | Ephemeral counters, sessions, queues | Snapshot (RDB) for queue persistence | Non-authoritative; cache warm-up on restart |

---

## 11. College Demo Checklist

For presenting MatriGluco to evaluators:

- [ ] **XAMPP MySQL is Running**: Port 3306 active.
- [ ] **Redis is Running**: Port 6379 active.
- [ ] **Alembic Head Applied**: Run `.\scripts.ps1 migrate`.
- [ ] **FastAPI Running**: Run `.\scripts.ps1 api` (accessible at `http://127.0.0.1:8000/docs`).
- [ ] **Celery Worker Running**: Run `.\scripts.ps1 worker` (solo pool, all 4 queues active).
- [ ] **ML Smoke Test Passes**: Run `.\scripts.ps1 smoke-ml`.
- [ ] **Health Endpoint Returns 200**: Open `http://127.0.0.1:8000/health/ready`.
