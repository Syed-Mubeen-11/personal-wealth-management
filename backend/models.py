from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from enum import Enum as PyEnum
from datetime import datetime


class RiskEnum(str, PyEnum):
    conservative = "conservative"
    moderate = "moderate" 
    aggressive = "aggressive"


class KYCEnum(str, PyEnum):
    unverified = "unverified"
    verified = "verified"


class TransactionTypeEnum(str, PyEnum):
    buy = "Buy"
    sell = "Sell"
    contribution = "Contribution"
    withdrawal = "Withdrawal"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    riskprofile = Column(Enum(RiskEnum), default=RiskEnum.moderate)
    kycstatus = Column(Enum(KYCEnum), default=KYCEnum.unverified)
    createdat = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    assets = relationship("Asset", back_populates="owner")
    transactions = relationship("Transaction", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")


class Asset(Base):
    """Investments Table - tracks user holdings"""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)  # e.g., "AAPL"
    quantity = Column(Float)  # Total units owned
    buy_price = Column(Float)  # Average cost basis per unit
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="assets")


class Transaction(Base):
    """Transactions Table - tracks all financial transactions"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    transaction_type = Column(String)  # "Buy", "Sell", "Contribution", "Withdrawal"
    asset_symbol = Column(String, nullable=True)  # Ticker symbol or "Cash"
    quantity = Column(Float, nullable=True)  # Number of shares (null for cash transfers)
    amount = Column(Float)  # Total monetary value of the transaction
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="transactions")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    target_name = Column(String)
    target_amount = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="goals")