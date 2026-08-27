"""
Imports transformed data into MySQL tables using SQLAlchemy sessions.
"""

from app.db.session import SessionLocal


def import_records():
    print("Database import script initialized. Ready to load transformed records.")


if __name__ == "__main__":
    import_records()
