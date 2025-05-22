import time
import pymysql
import os

host = os.getenv("DJANGO_DB_HOST", "reporting-db")
port = int(os.getenv("DJANGO_DB_PORT", 3306))
user = os.getenv("DJANGO_DB_USER", "root")
password = os.getenv("DJANGO_DB_PASSWORD", "")
database = os.getenv("DJANGO_DB_NAME", "")

while True:
    try:
        conn = pymysql.connect(
            host=host, port=port, user=user, password=password, database=database
        )
        print("Database is ready!")
        break
    except Exception as e:
        print("Waiting for database...", str(e))
        time.sleep(2)
