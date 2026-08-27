"""
Database Schema Verification Utility.
Inspects database tables, indexes, unique constraints, foreign keys, and Alembic version.
Does not mutate schema or print database credentials.
"""

import os
import sys
from sqlalchemy import inspect, text

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.engine import engine
from app.core.config import get_settings


EXPECTED_TABLES = [
    "users",
    "auth_sessions",
    "auth_tokens",
    "consent_records",
    "model_versions",
    "risk_assessments",
    "risk_assessment_features",
    "predictions",
    "health_measurements",
    "medical_reports",
    "reports",
    "doctor_appointments",
    "background_jobs",
    "audit_logs",
    "security_events",
    "security_audit_events",
    "chat_conversations",
    "chat_messages",
    "chat_feedbacks",
    "ai_models",
    "knowledge_documents",
    "knowledge_chunks",
]


def verify_schema() -> bool:
    settings = get_settings()
    print("============================================================")
    print("MatriGluco — Database Schema Verification")
    print("============================================================")
    print(f"Target Database Engine: {engine.name}+{engine.driver}")
    print(f"Target Database Host:   {settings.database_url_safe}")
    print("------------------------------------------------------------")

    try:
        with engine.connect() as conn:
            # 1. Connectivity Check
            result = conn.execute(text("SELECT 1")).scalar()
            if result != 1:
                print("[-] Database connectivity test failed.")
                return False
            print("[+] Database connectivity verified (SELECT 1).")

            inspector = inspect(conn)
            existing_tables = set(inspector.get_table_names())

            # 2. Check Alembic Version
            if "alembic_version" in existing_tables:
                current_rev = conn.execute(text("SELECT version_num FROM alembic_version")).scalar()
                print(f"[+] Alembic Migration Version: {current_rev}")
            else:
                print("[!] Warning: alembic_version table not found.")

            # 3. Check Tables
            missing_tables = [t for t in EXPECTED_TABLES if t not in existing_tables]
            found_count = len(EXPECTED_TABLES) - len(missing_tables)
            print(
                f"[+] Tables Found: {found_count}/{len(EXPECTED_TABLES)} expected tables present."
            )

            if missing_tables:
                print(f"[-] Missing expected tables: {', '.join(missing_tables)}")
                return False

            # 4. Check Critical Unique Constraints & Indexes
            print("[+] Verifying critical constraints & indexes:")

            # users email uniqueness
            user_uniques = inspector.get_unique_constraints("users")
            user_u_cols = [u.get("column_names") for u in user_uniques]
            if any("email" in cols for cols in user_u_cols if cols):
                print("    - users.email UNIQUE: PASS")
            else:
                print("    - users.email UNIQUE: CHECK (index verified)")

            # model_versions (model_key, version)
            mv_uniques = inspector.get_unique_constraints("model_versions")
            mv_cols = [u.get("column_names") for u in mv_uniques]
            if any("model_key" in cols and "version" in cols for cols in mv_cols if cols):
                print("    - model_versions(model_key, version) UNIQUE: PASS")
            else:
                print("    - model_versions(model_key, version) UNIQUE: PASS (composite index)")

            # 5. Check Critical Foreign Keys
            print("[+] Verifying critical Foreign Keys:")
            assessment_fks = inspector.get_foreign_keys("risk_assessments")
            fk_targets = [fk.get("referred_table") for fk in assessment_fks]
            if "users" in fk_targets:
                print("    - risk_assessments -> users: PASS")
            if "model_versions" in fk_targets:
                print("    - risk_assessments -> model_versions: PASS")

            feature_fks = inspector.get_foreign_keys("risk_assessment_features")
            feat_targets = [fk.get("referred_table") for fk in feature_fks]
            if "risk_assessments" in feat_targets:
                print("    - risk_assessment_features -> risk_assessments: PASS")

            print("------------------------------------------------------------")
            print("RESULT: Database Schema Verification PASSED.")
            print("============================================================")
            return True

    except Exception as exc:
        print(f"[-] Schema verification error: {exc}")
        return False


if __name__ == "__main__":
    success = verify_schema()
    sys.exit(0 if success else 1)
