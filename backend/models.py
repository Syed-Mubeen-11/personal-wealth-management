from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False) # Make sure it's hashed_password    # Relationship to investments
    investments = relationship("Investment", back_populates="owner", cascade="all, delete-orphan")

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_type = Column(String, nullable=False)  # e.g., 'stock', 'crypto'
    symbol = Column(String(10), nullable=False)
    units = Column(Numeric(18, 8), nullable=False)
    avg_buy_price = Column(Numeric(18, 2), nullable=False)
    cost_basis = Column(Numeric(18, 2), nullable=False) # Automated in crud.py
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="investments")