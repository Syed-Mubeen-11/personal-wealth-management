"""
Database Migration: Add price tracking columns to assets table

This migration adds the following columns to the assets table:
- current_value: Current market value (units * last_price)
- last_price: Last fetched price per unit
- last_price_at: Timestamp of when the price was last updated

Run this script once to update the database schema:
    python migrations/add_price_columns.py

For SQLAlchemy auto-migration (if tables don't exist yet), the models will
handle creation automatically.
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
    """Add new price tracking columns to assets table"""
    
    columns_to_add = [
        ("current_value", "DOUBLE PRECISION"),
        ("last_price", "DOUBLE PRECISION"),
        ("last_price_at", "TIMESTAMP"),
    ]
    
    engine = get_fresh_connection()
    
    with engine.connect() as conn:
        # Check if we're using SQLite
        is_sqlite = False
        try:
            result = conn.execute(text("SELECT sqlite_version()"))
            is_sqlite = True
            logger.info("Detected SQLite database")
        except:
            logger.info("Detected PostgreSQL database")
        
        # Get existing columns
        if is_sqlite:
            result = conn.execute(text("PRAGMA table_info(assets)"))
            existing_columns = [row[1] for row in result.fetchall()]
        else:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'assets'
            """))
            existing_columns = [row[0] for row in result.fetchall()]
        
        logger.info(f"Existing columns: {existing_columns}")
        
        for col_name, col_type in columns_to_add:
            if col_name in existing_columns:
                logger.info(f"Column {col_name} already exists, skipping")
                continue
            
            try:
                sql = f"ALTER TABLE assets ADD COLUMN {col_name} {col_type}"
                conn.execute(text(sql))
                logger.info(f"Added column: {col_name}")
            except Exception as e:
                logger.warning(f"Failed to add column {col_name}: {e}")
    
    logger.info("Migration completed!")


def verify_columns():
    """Verify that the new columns exist"""
    engine = get_fresh_connection()
    
    with engine.connect() as conn:
        try:
            # Check if we're using SQLite
            is_sqlite = False
            try:
                conn.execute(text("SELECT sqlite_version()"))
                is_sqlite = True
            except:
                pass
            
            if is_sqlite:
                result = conn.execute(text("PRAGMA table_info(assets)"))
                columns = [row[1] for row in result.fetchall()]
            else:
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'assets'
                """))
                columns = [row[0] for row in result.fetchall()]
            
            required = ['current_value', 'last_price', 'last_price_at']
            missing = [col for col in required if col not in columns]
            
            if missing:
                logger.error(f"Missing columns: {missing}")
                return False
            else:
                logger.info(f"All required columns present: {required}")
                return True
        except Exception as e:
            logger.error(f"Error verifying columns: {e}")
            return False


if __name__ == "__main__":
    logger.info("Starting migration: Add price tracking columns to assets table")
    run_migration()
    verify_columns()
