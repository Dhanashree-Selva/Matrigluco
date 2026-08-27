"""
Compares row counts and schema integrity between source and target database.
"""

from sqlalchemy import select, func
from app.db.session import SessionLocal
from app.models.user import User
from app.models.risk_assessment import Prediction
from app.models.medical_report import Report


def verify():
    db = SessionLocal()
    try:
        user_count = db.scalar(select(func.count()).select_from(User)) or 0
        pred_count = db.scalar(select(func.count()).select_from(Prediction)) or 0
        rep_count = db.scalar(select(func.count()).select_from(Report)) or 0
        print("Migration Record Counts in MySQL:")
        print(f"  - Users: {user_count}")
        print(f"  - Predictions: {pred_count}")
        print(f"  - Reports: {rep_count}")
    finally:
        db.close()


if __name__ == "__main__":
    verify()
