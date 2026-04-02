import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "users.db")
print("================================")
print(f"Checking Database: {db_path}")

try:
    if not os.path.exists(db_path):
        print("ERROR: Database file does not exist!")
    else:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check users table
        cursor.execute("SELECT id, name, email, password FROM users")
        users = cursor.fetchall()
        print(f"\nFound {len(users)} users:")
        for u in users:
            print(f"[{u[0]}] Name: {u[1]}, Email: {u[2]}, HashLen: {len(u[3]) if u[3] else 0}")
            
        conn.close()
except Exception as e:
    print(f"ERROR: {e}")
print("================================")
