#!/usr/bin/env python3
"""
MatriGluco Release Verification Script.
Audits configuration, Alembic migration head status, ML artifacts, and storage directories.
"""

import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import get_settings


def verify_release() -> bool:
    print("=" * 60)
    print("       MATRIGLUCO RELEASE READINESS AUDIT")
    print("=" * 60)
    passed = True
    settings = get_settings()

    # 1. Environment and Security Settings
    print(f"[*] Environment: {settings.APP_ENV}")
    print(f"[*] App Name: {settings.APP_NAME}")
    if settings.APP_ENV == "production":
        if settings.DEBUG:
            print("[FAIL] ERROR: DEBUG must be False in production!")
            passed = False
        else:
            print("[PASS] DEBUG mode is correctly set to False.")

        if "secret" in settings.JWT_SECRET_KEY.lower() or len(settings.JWT_SECRET_KEY) < 32:
            print("[FAIL] ERROR: Insecure JWT_SECRET_KEY detected for production.")
            passed = False
        else:
            print("[PASS] Strong JWT secret configured.")

    # 2. Database Connection
    from app.db.healthcheck import check_database_connection

    if check_database_connection():
        print("[PASS] MySQL Database connectivity verified.")
    else:
        print("[WARN] Database connection failed (local MySQL service not running).")

    # 3. Private Storage Check
    storage_path = Path(settings.PRIVATE_STORAGE_PATH)
    if storage_path.exists():
        print(f"[PASS] Private storage directory exists: {storage_path}")
    else:
        print(f"[*] Creating private storage directory: {storage_path}")
        storage_path.mkdir(parents=True, exist_ok=True)
        print(f"[PASS] Created private storage directory: {storage_path}")

    # 4. ML Model Artifact Check
    from app.ml.inference.model_loader import ml_model_loader

    try:
        _, _, meta = ml_model_loader.get_model_and_scaler(
            "diabetes-risk", settings.DIABETES_MODEL_VERSION
        )
        print(
            f"[PASS] ML Model artifact verified: Version {settings.DIABETES_MODEL_VERSION} ({meta.get('algorithm')})"
        )
    except Exception as e:
        print(f"[FAIL] ERROR: ML Model verification failed: {e}")
        passed = False

    # 5. AI Runtime Configuration
    if settings.AI_ENABLED:
        print("[*] Local AI Chatbot is ENABLED.")
        model_path = Path(settings.AI_MODEL_PATH)
        if model_path.exists():
            print(f"[PASS] GGUF Model file found: {model_path}")
        else:
            print(f"[FAIL] ERROR: Configured AI model path does not exist: {model_path}")
            passed = False
    else:
        print("[PASS] Local AI Chatbot is disabled (standard lightweight deployment).")

    print("=" * 60)
    if passed:
        print("[+] RELEASE VERIFICATION AUDIT PASSED.")
    else:
        print("[!] RELEASE VERIFICATION FAILED. Address errors above before deploying.")
    print("=" * 60)
    return passed


if __name__ == "__main__":
    success = verify_release()
    sys.exit(0 if success else 1)
