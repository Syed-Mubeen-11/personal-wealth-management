"""
Database Migration Script for Goals Table
Run this script to update the goals table schema.

WARNING: This will drop and recreate the goals table, losing existing data.
If you need to preserve data, modify the ALTER TABLE statements instead.
"""

from database import engine
from sqlalchemy import text

def migrate_goals_table():
    with engine.connect() as conn:
        # Drop the old goals table
        print("Dropping old goals table...")
        conn.execute(text("DROP TABLE IF EXISTS goals CASCADE"))
        conn.commit()
        
        # Create new goals table with updated schema (PostgreSQL syntax)
        print("Creating new goals table with updated schema...")
        conn.execute(text("""
            CREATE TABLE goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                goal_name VARCHAR NOT NULL,
                goal_type VARCHAR DEFAULT 'custom',
                target_amount FLOAT NOT NULL,
                target_date DATE,
                monthly_contribution FLOAT DEFAULT 0.0,
                status VARCHAR DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()
        
        print("Migration complete! Goals table has been updated.")

if __name__ == "__main__":
    migrate_goals_table()
