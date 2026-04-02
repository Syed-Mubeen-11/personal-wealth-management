import os
import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db_path = os.path.join(os.path.dirname(__file__), "users.db")
print("=============================")
print(f"Direct DB Seed: {db_path}")

EMAIL = "aabeltemp@gmail.com"
PASSWORD = "Aabel@2003"
NAME = "Aabel"
HASHED = pwd_context.hash(PASSWORD)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Ensure table exists (a minimal schema just in case, but it usually exists if app started once)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL UNIQUE,
        password VARCHAR NOT NULL,
        phone_number VARCHAR,
        residential_address VARCHAR,
        date_of_birth DATE,
        riskprofile VARCHAR DEFAULT 'moderate',
        kycstatus VARCHAR DEFAULT 'unverified',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute("SELECT id FROM users WHERE email=?", (EMAIL,))
    row = cursor.fetchone()
    if row:
        print(f"User already exists with ID {row[0]}")
        # Force update password just to be 100% sure
        cursor.execute("UPDATE users SET password=? WHERE email=?", (HASHED, EMAIL))
        print("Updated password to ensure it matches 'Aabel@2003'")
    else:
        cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                      (NAME, EMAIL, HASHED))
        print("Created new user successfully.")
        
    conn.commit()
    conn.close()
    print("DONE. Please try logging in again.")
except Exception as e:
    print(f"Error: {e}")
print("=============================")
