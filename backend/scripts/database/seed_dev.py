"""
Development Database Seeding Utility.
Populates local development MySQL database with synthetic test data.
Safety Guard: Refuses to run if APP_ENV is set to 'production'.
"""

import os
import sys
import uuid
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.user import User
from app.models.consultation import DoctorAppointment
from app.models.consent import ConsentRecord
from app.core.security import get_password_hash


SYNTHETIC_USERS = [
    {
        "id": "11111111-1111-4111-8111-111111111111",
        "email": "dev-patient-01@example.test",
        "name": "Sarah Jenkins (Synthetic Dev)",
        "password": "DevPassword123!",
        "role": "user",
        "age": 29,
        "gestational_age_weeks": 24,
        "pregnancy_count": 2,
    },
    {
        "id": "22222222-2222-4222-8222-222222222222",
        "email": "dev-patient-02@example.test",
        "name": "Elena Rostova (Synthetic Dev)",
        "password": "DevPassword123!",
        "role": "user",
        "age": 34,
        "gestational_age_weeks": 16,
        "pregnancy_count": 1,
    },
    {
        "id": "99999999-9999-4999-8999-999999999999",
        "email": "dev-admin-01@example.test",
        "name": "Clinical Admin (Synthetic Dev)",
        "password": "AdminPassword123!",
        "role": "admin",
        "age": 45,
        "gestational_age_weeks": None,
        "pregnancy_count": 0,
    },
]


def seed_dev_database() -> bool:
    settings = get_settings()

    print("============================================================")
    print("MatriGluco — Synthetic Development Database Seeder")
    print("============================================================")

    # 1. Production Safety Guard
    if settings.APP_ENV == "production":
        print("[-] FATAL: Cannot run dev seed in 'production' environment.")
        return False

    print(f"[+] Environment: {settings.APP_ENV} (Safe for seeding)")
    print(f"[+] Target Database: {settings.database_url_safe}")
    print("------------------------------------------------------------")

    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # 2. Seed Synthetic Users
        for u_data in SYNTHETIC_USERS:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if existing:
                print(f"[~] User '{u_data['email']}' already exists. Updating attributes.")
                existing.name = u_data["name"]
                existing.age = u_data["age"]
                existing.gestational_age_weeks = u_data["gestational_age_weeks"]
                existing.pregnancy_count = u_data["pregnancy_count"]
                user_id = existing.id
            else:
                print(f"[+] Creating synthetic user: '{u_data['email']}'")
                new_user = User(
                    id=u_data["id"],
                    email=u_data["email"],
                    password_hash=get_password_hash(u_data["password"]),
                    name=u_data["name"],
                    role=u_data["role"],
                    age=u_data["age"],
                    gestational_age_weeks=u_data["gestational_age_weeks"],
                    pregnancy_count=u_data["pregnancy_count"],
                    is_active=True,
                    is_verified=True,
                    created_at=now,
                    updated_at=now,
                )
                db.add(new_user)
                user_id = u_data["id"]

            # Ensure consent record exists
            existing_consent = (
                db.query(ConsentRecord)
                .filter(
                    ConsentRecord.user_id == user_id,
                    ConsentRecord.consent_type == "third_party_ocr_processing",
                )
                .first()
            )
            if not existing_consent:
                consent = ConsentRecord(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    consent_type="third_party_ocr_processing",
                    consent_version="ocr-third-party-v1",
                    is_accepted=True,
                    accepted_at=now,
                    created_at=now,
                    updated_at=now,
                )
                db.add(consent)

        # 3. Seed Sample Appointments
        primary_user_id = SYNTHETIC_USERS[0]["id"]
        appt_count = (
            db.query(DoctorAppointment).filter(DoctorAppointment.user_id == primary_user_id).count()
        )
        if appt_count == 0:
            print(f"[+] Seeding sample doctor appointment for user {primary_user_id}...")
            appt = DoctorAppointment(
                id=str(uuid.uuid4()),
                user_id=primary_user_id,
                patient_name="Eswar Chinthakayala",
                doctor_name="Dr. Maya Patel, MD (Endocrinology)",
                consultation_type="Obstetric Endocrinology",
                appointment_date=datetime(2026, 9, 15).date(),
                appointment_time="10:30 AM",
                status="confirmed",
                symptoms="Routine 24-week glucose tolerance follow-up consultation.",
                created_at=now,
            )
            db.add(appt)

        db.commit()
        print("------------------------------------------------------------")
        print("RESULT: Synthetic development database seeded successfully.")
        print("============================================================")
        return True

    except Exception as exc:
        db.rollback()
        print(f"[-] Seeding error: {exc}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = seed_dev_database()
    sys.exit(0 if success else 1)
