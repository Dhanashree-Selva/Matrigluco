"""
Script to idempotently create the MatriGluco MySQL database.
"""

import os
import sys
import pymysql

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import get_settings

settings = get_settings()


def create_database():
    print(f"Connecting to MySQL server at {settings.MYSQL_HOST}:{settings.MYSQL_PORT}...")
    conn = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DB}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
        conn.commit()
        print(f"Database `{settings.MYSQL_DB}` ensured successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    create_database()
