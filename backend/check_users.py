"""Quick script to check users in the SQLite database."""
import sqlite3, os

db_path = os.path.join(os.path.dirname(__file__), "users.db")
if not os.path.exists(db_path):
    print(f"Database not found at: {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if cursor.fetchone():
        cursor.execute("SELECT id, name, email FROM users")
        users = cursor.fetchall()
        if users:
            print(f"Found {len(users)} user(s):")
            for u in users:
                print(f"  ID={u[0]}, Name={u[1]}, Email={u[2]}")
        else:
            print("Users table exists but is EMPTY - need to register first!")
    else:
        print("No 'users' table found - database needs initialization!")
    
    conn.close()
