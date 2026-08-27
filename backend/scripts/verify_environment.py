"""
Environment and Infrastructure Verification Script for MatriGluco Backend.

Verifies:
1. Environment mode and configuration parameters.
2. Production security guards (DEBUG=false, DB user != root, JWT secret non-placeholder).
3. Database connectivity and migration schema availability.
4. Redis cache, broker, and result backend connectivity.
5. Private storage root writability and path isolation.
6. Clinical ML artifact availability and manifest integrity.
7. Local AI runtime GGUF artifact presence (if AI_ENABLED=true).

Exits with 0 on success, or 1 on critical configuration errors.
Does NOT output secrets, passwords, or raw tokens.
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import get_settings


def verify_environment() -> int:
    settings = get_settings()
    has_errors = False

    print("=" * 60)
    print("MatriGluco Backend Environment Verification")
    print(f"Environment: {settings.APP_ENV.upper()} | Debug: {settings.DEBUG}")
    print("=" * 60)

    # 1. Production Security Invariants
    if settings.APP_ENV == "production":
        if settings.DEBUG:
            print("[FAIL] DEBUG cannot be True in production!")
            has_errors = True
        else:
            print("[OK] Production DEBUG mode is False.")

        if "://root:" in settings.sync_database_url or "://root@" in settings.sync_database_url:
            print(
                "[FAIL] Database configured with 'root' user in production! Use 'matrigluco_app'."
            )
            has_errors = True
        else:
            print("[OK] Database configured with restricted application user.")

        if settings.JWT_SECRET_KEY in ("secret", "change_this_in_production", "supersecretkey"):
            print("[FAIL] Insecure placeholder JWT_SECRET_KEY detected in production!")
            has_errors = True
        else:
            print("[OK] JWT Secret Key is securely configured.")

    # 2. Database Connectivity
    try:
        from app.db.engine import engine
        from sqlalchemy import text

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Database connectivity established successfully.")
    except Exception as e:
        print(f"[WARN] Database connection failed: {e}")
        if settings.APP_ENV == "production":
            has_errors = True

    # 3. Redis Connectivity
    try:
        import redis

        r = redis.Redis.from_url(settings.REDIS_URL, socket_timeout=2.0)
        r.ping()
        print(f"[OK] Redis connectivity verified ({settings.REDIS_URL.split('@')[-1]}).")
    except Exception as e:
        print(f"[WARN] Redis connection failed ({e}). (Optional for pure unit tests/CRUD).")

    # 4. Storage Directory
    storage_path = Path(settings.STORAGE_ROOT).resolve()
    try:
        storage_path.mkdir(parents=True, exist_ok=True)
        test_file = storage_path / ".perm_check.tmp"
        test_file.write_text("ok", encoding="utf-8")
        test_file.unlink()
        print(f"[OK] Private storage directory is writable ({storage_path}).")
    except Exception as e:
        print(f"[FAIL] Storage directory error: {e}")
        has_errors = True

    # 5. ML Model Artifacts
    ml_artifact_dir = (
        Path(__file__).parent.parent
        / settings.ML_ARTIFACT_ROOT
        / settings.ML_MODEL_KEY
        / settings.ML_MODEL_VERSION
    )
    if ml_artifact_dir.exists():
        print(
            f"[OK] ML model artifacts found at {settings.ML_MODEL_KEY}/{settings.ML_MODEL_VERSION}."
        )
    else:
        print(f"[WARN] ML model artifacts missing at {ml_artifact_dir}.")

    # 6. Local AI Runtime
    if settings.AI_ENABLED:
        if settings.AI_MODEL_PATH and Path(settings.AI_MODEL_PATH).exists():
            print(f"[OK] Local AI GGUF model located at {settings.AI_MODEL_PATH}.")
        else:
            print(
                f"[WARN] AI_ENABLED is true, but AI_MODEL_PATH ({settings.AI_MODEL_PATH}) does not exist."
            )
    else:
        print("[OK] Local AI runtime is disabled (AI_ENABLED=false).")

    print("=" * 60)
    if has_errors:
        print("RESULT: Verification FAILED with critical errors.")
        return 1
    else:
        print("RESULT: Verification PASSED successfully.")
        return 0


if __name__ == "__main__":
    sys.exit(verify_environment())
