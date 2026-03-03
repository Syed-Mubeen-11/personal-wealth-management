from database import engine
from sqlalchemy import text

conn = engine.connect()

# Add missing columns
try:
    conn.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS company_name VARCHAR"))
    print("Added company_name column")
except Exception as e:
    print(f"company_name: {e}")

try:
    conn.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_class VARCHAR"))
    print("Added asset_class column")
except Exception as e:
    print(f"asset_class: {e}")

# Set default value for existing rows
try:
    conn.execute(text("UPDATE assets SET asset_class = 'Stock' WHERE asset_class IS NULL"))
    print("Updated asset_class default values")
except Exception as e:
    print(f"update: {e}")

conn.commit()
conn.close()
print("Database fix completed!")
