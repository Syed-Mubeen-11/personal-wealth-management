"""Add is_read column to recommendations table.

This migration adds a BOOLEAN-like is_read column (INTEGER 0/1 for SQLite compat)
with a default of 0 (FALSE) to the recommendations table.
"""

import os
import sys

# Ensure backend root is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from sqlalchemy import text, inspect


def upgrade():
    """Add is_read column if it does not already exist."""
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("recommendations")]

    if "is_read" not in columns:
        with engine.begin() as conn:
            dialect = engine.dialect.name
            if dialect == "sqlite":
                conn.execute(text("ALTER TABLE recommendations ADD COLUMN is_read INTEGER DEFAULT 0"))
            else:
                # PostgreSQL / others
                conn.execute(text("ALTER TABLE recommendations ADD COLUMN is_read INTEGER DEFAULT 0"))
        print("✅  Added 'is_read' column to recommendations table.")
    else:
        print("ℹ️  'is_read' column already exists — skipping.")


def downgrade():
    """Remove is_read column (only works on PostgreSQL; SQLite does not support DROP COLUMN easily)."""
    dialect = engine.dialect.name
    if dialect != "sqlite":
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE recommendations DROP COLUMN IF EXISTS is_read"))
        print("✅  Dropped 'is_read' column from recommendations table.")
    else:
        print("⚠️  SQLite does not support DROP COLUMN — manual migration required.")


if __name__ == "__main__":
    upgrade()
