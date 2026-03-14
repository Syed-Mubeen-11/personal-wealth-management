"""
Database Migration: Create simulations table

This migration creates the simulations table for storing What-if scenario results.

Run this script to create the table:
    python migrations/create_simulations_table.py
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, create_engine
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_fresh_connection():
    """Create a fresh database connection"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL not set!")
    engine = create_engine(database_url, isolation_level="AUTOCOMMIT")
    return engine


def run_migration():
    """Create the simulations table"""
    
    engine = get_fresh_connection()
    
    # PostgreSQL-compatible create table statement
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS simulations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
        scenario_name VARCHAR(255) NOT NULL,
        assumptions JSONB NOT NULL,
        results JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Create index for faster queries
    create_index_sql = """
    CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
    CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON simulations(created_at);
    """
    
    with engine.connect() as conn:
        try:
            # Check if we're using SQLite
            is_sqlite = False
            try:
                conn.execute(text("SELECT sqlite_version()"))
                is_sqlite = True
                logger.info("Detected SQLite database")
            except:
                logger.info("Detected PostgreSQL database")
            
            if is_sqlite:
                # SQLite version
                sqlite_create = """
                CREATE TABLE IF NOT EXISTS simulations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
                    scenario_name VARCHAR(255) NOT NULL,
                    assumptions TEXT NOT NULL,
                    results TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
                conn.execute(text(sqlite_create))
                logger.info("Created simulations table (SQLite)")
            else:
                # PostgreSQL version
                conn.execute(text(create_table_sql))
                logger.info("Created simulations table (PostgreSQL)")
                
                # Create indexes
                for idx_sql in create_index_sql.strip().split(';'):
                    if idx_sql.strip():
                        try:
                            conn.execute(text(idx_sql))
                        except Exception as e:
                            logger.warning(f"Index may already exist: {e}")
                logger.info("Created indexes")
            
        except Exception as e:
            logger.error(f"Error creating table: {e}")
            raise
    
    logger.info("Migration completed!")


def verify_table():
    """Verify that the simulations table exists"""
    engine = get_fresh_connection()
    
    with engine.connect() as conn:
        try:
            result = conn.execute(text("SELECT COUNT(*) FROM simulations"))
            count = result.fetchone()[0]
            logger.info(f"Simulations table exists with {count} records")
            return True
        except Exception as e:
            logger.error(f"Table verification failed: {e}")
            return False


if __name__ == "__main__":
    logger.info("Starting migration: Create simulations table")
    run_migration()
    verify_table()
