from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    
    # Profile Fields
    name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    residential_address = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    riskprofile = Column(String, default="moderate")
    kycstatus = Column(String, default="unverified")

    # Relationships
    transactions = relationship("Transaction", back_populates="owner")
    assets = relationship("Asset", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")  # <--- NEW LINK

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    category = Column(String)
    description = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="transactions")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String)
    quantity = Column(Float)
    buy_price = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="assets")

# --- NEW GOAL TABLE ---
class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    target_name = Column(String)
    target_amount = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="goals")