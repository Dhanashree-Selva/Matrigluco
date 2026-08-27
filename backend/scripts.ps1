# MatriGluco — Windows PowerShell Developer Workflow Shortcuts

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1)]
    [string]$Arg1 = ""
)

function Show-Help {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " MatriGluco Backend Developer CLI Commands (PowerShell)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  .\scripts.ps1 verify               - Verify environment, database, storage & ML model"
    Write-Host "  .\scripts.ps1 install              - Install runtime/dev requirements"
    Write-Host "  .\scripts.ps1 api                  - Start Uvicorn FastAPI server (--reload)"
    Write-Host "  .\scripts.ps1 worker               - Start Celery worker (Windows solo pool, all queues)"
    Write-Host "  .\scripts.ps1 worker-threads       - Start Celery worker (threads pool)"
    Write-Host "  .\scripts.ps1 beat                 - Start Celery Beat periodic scheduler"
    Write-Host "  .\scripts.ps1 migrate              - Run Alembic migrations (alembic upgrade head)"
    Write-Host "  .\scripts.ps1 makemigrations [msg] - Autogenerate Alembic migration revision"
    Write-Host "  .\scripts.ps1 test                 - Run pytest test suite"
    Write-Host "  .\scripts.ps1 lint                 - Run ruff code linter & mypy type checker"
    Write-Host "  .\scripts.ps1 smoke-ml             - Run tabular ML inference smoke test"
    Write-Host "  .\scripts.ps1 smoke-ai             - Smoke test offline AI chatbot runtime"
    Write-Host "  .\scripts.ps1 help                 - Display this help message"
}

switch ($Command) {
    "verify" {
        Write-Host "[VERIFY] Checking environment and infrastructure dependencies..." -ForegroundColor Green
        .\venv\Scripts\python.exe scripts/verify_environment.py
    }
    "install" {
        Write-Host "[INSTALL] Installing development dependencies..." -ForegroundColor Green
        .\venv\Scripts\python.exe -m pip install --upgrade pip
        .\venv\Scripts\pip.exe install -r requirements/dev.txt
    }
    "api" {
        Write-Host "[API] Starting FastAPI on http://127.0.0.1:8000..." -ForegroundColor Green
        .\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
    }
    "run" {
        Write-Host "[API] Starting FastAPI on http://127.0.0.1:8000..." -ForegroundColor Green
        .\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
    }
    "worker" {
        Write-Host "[WORKER] Starting Celery background worker (solo pool for Windows, all queues)..." -ForegroundColor Green
        .\venv\Scripts\celery.exe -A app.workers.celery_app.celery_app worker --loglevel=info --pool=solo --queues=default,reports,notifications,analytics
    }
    "worker-threads" {
        Write-Host "[WORKER] Starting Celery background worker (threads pool)..." -ForegroundColor Green
        .\venv\Scripts\celery.exe -A app.workers.celery_app.celery_app worker --loglevel=info --pool=threads --concurrency=4 --queues=default,reports,notifications,analytics
    }
    "beat" {
        Write-Host "[BEAT] Starting Celery Beat periodic scheduler (Ensure ONLY 1 instance runs)..." -ForegroundColor Green
        .\venv\Scripts\celery.exe -A app.workers.celery_app.celery_app beat --loglevel=info
    }
    "migrate" {
        Write-Host "[MIGRATE] Applying pending database migrations..." -ForegroundColor Green
        .\venv\Scripts\alembic.exe upgrade head
    }
    "makemigrations" {
        $msg = if ($Arg1) { $Arg1 } else { "auto_migration" }
        Write-Host "[MIGRATE] Generating revision: $msg..." -ForegroundColor Green
        .\venv\Scripts\alembic.exe revision --autogenerate -m "$msg"
    }
    "test" {
        Write-Host "[TEST] Running automated test suite..." -ForegroundColor Green
        .\venv\Scripts\pytest.exe -v
    }
    "lint" {
        Write-Host "[LINT] Running ruff and mypy static checks..." -ForegroundColor Green
        .\venv\Scripts\ruff.exe check app
        .\venv\Scripts\mypy.exe app
    }
    "smoke-ml" {
        Write-Host "[ML] Running ML tabular inference smoke test..." -ForegroundColor Green
        .\venv\Scripts\python.exe scripts/ml/smoke_test_model.py
    }
    "smoke-ai" {
        Write-Host "[AI] Running offline AI chatbot runtime smoke test..." -ForegroundColor Green
        .\venv\Scripts\python.exe scripts/ai/smoke_test_llm.py
    }
    Default {
        Show-Help
    }
}
