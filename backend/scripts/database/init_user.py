import pymysql
import sys

def init_user():
    try:
        conn = pymysql.connect(host='127.0.0.1', port=3306, user='root', password='')
        with conn.cursor() as cur:
            cur.execute("CREATE DATABASE IF NOT EXISTS `matrigluco` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            
            # Create user for localhost
            try:
                cur.execute("CREATE USER IF NOT EXISTS 'matrigluco_app'@'localhost' IDENTIFIED BY 'StrongAppPassword';")
                cur.execute("ALTER USER 'matrigluco_app'@'localhost' IDENTIFIED BY 'StrongAppPassword';")
            except Exception as e:
                print(f"Notice (localhost user): {e}")
            cur.execute("GRANT ALL PRIVILEGES ON `matrigluco`.* TO 'matrigluco_app'@'localhost';")
            
            # Create user for 127.0.0.1
            try:
                cur.execute("CREATE USER IF NOT EXISTS 'matrigluco_app'@'127.0.0.1' IDENTIFIED BY 'StrongAppPassword';")
                cur.execute("ALTER USER 'matrigluco_app'@'127.0.0.1' IDENTIFIED BY 'StrongAppPassword';")
            except Exception as e:
                print(f"Notice (127.0.0.1 user): {e}")
            cur.execute("GRANT ALL PRIVILEGES ON `matrigluco`.* TO 'matrigluco_app'@'127.0.0.1';")

            # Create user for %
            try:
                cur.execute("CREATE USER IF NOT EXISTS 'matrigluco_app'@'%' IDENTIFIED BY 'StrongAppPassword';")
                cur.execute("ALTER USER 'matrigluco_app'@'%' IDENTIFIED BY 'StrongAppPassword';")
            except Exception as e:
                print(f"Notice (% user): {e}")
            cur.execute("GRANT ALL PRIVILEGES ON `matrigluco`.* TO 'matrigluco_app'@'%';")

            cur.execute("FLUSH PRIVILEGES;")
            print("Successfully configured matrigluco_app user and granted privileges on matrigluco database.")
        conn.close()
    except Exception as exc:
        print(f"Error initializing MySQL user: {exc}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    init_user()
