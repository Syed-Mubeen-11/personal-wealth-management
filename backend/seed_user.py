"""
Seed script: Creates the default user account in SQLite.
Run once after switching from Docker PostgreSQL to local SQLite.
Usage: python seed_user.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal
import models
from auth import get_password_hash

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

EMAIL = "aabeltemp@gmail.com"
PASSWORD = "Aabel@2003"
NAME = "Aabel"

existing = db.query(models.User).filter(models.User.email == EMAIL).first()
if existing:
    print(f"User '{EMAIL}' already exists (ID={existing.id}). No changes made.")
else:
    user = models.User(
        name=NAME,
        email=EMAIL,
        password=get_password_hash(PASSWORD),
        risk_profile="moderate",
        kyc_status="unverified",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created user '{EMAIL}' with ID={user.id}")
    print(f"You can now log in with:")
    print(f"  Email:    {EMAIL}")
    print(f"  Password: {PASSWORD}")

db.close()
