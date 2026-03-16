from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, Float, ForeignKey, DateTime, Date, JSON
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


class AssetClassEnum(str, PyEnum):
    stock = "Stock"
    bond = "Bond"
    etf = "ETF"
    crypto = "Crypto"
    cash = "Cash"
    other = "Other"


class GoalTypeEnum(str, PyEnum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"
    travel = "travel"


class GoalStatusEnum(str, PyEnum):
    active = "active"
    paused = "paused"
    completed = "completed"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    
    # Newly added mapping for profile
    phone_number = Column(String, nullable=True)
    residential_address = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    risk_profile = Column("riskprofile", Enum(RiskEnum), default=RiskEnum.moderate)
    kyc_status = Column("kycstatus", Enum(KYCEnum), default=KYCEnum.unverified)
    
    createdat = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    assets = relationship("Asset", back_populates="owner")
    transactions = relationship("Transaction", back_populates="owner")
    goals = relationship("Goal", back_populates="owner", foreign_keys="Goal.user_id")


class Asset(Base):
    """Investments Table - tracks user holdings"""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)  # e.g., "AAPL"
    company_name = Column(String, nullable=True)  # e.g., "Apple Inc."
    asset_class = Column(String, default="Stock")  # "Stock", "Bond", "ETF", "Crypto", "Cash"
    quantity = Column(Float)  # Total units owned
    buy_price = Column(Float)  # Average cost basis per unit
    current_value = Column(Float, nullable=True)  # Current market value (units * last_price)
    last_price = Column(Float, nullable=True)  # Last fetched price per unit
    last_price_at = Column(TIMESTAMP, nullable=True)  # When the price was last updated
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
    user_id = Column(Integer, ForeignKey("users.id"))
    goal_name = Column(String, nullable=False)
    goal_type = Column(Enum(GoalTypeEnum), default=GoalTypeEnum.custom)
    target_amount = Column(Float, nullable=False)
    target_date = Column(Date, nullable=True)
    monthly_contribution = Column(Float, default=0.0)
    status = Column(Enum(GoalStatusEnum), default=GoalStatusEnum.active)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    owner = relationship("User", back_populates="goals")


class Simulation(Base):
    """Simulations Table - stores What-if scenario results"""
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)  # Optional link to a goal
    scenario_name = Column(String, nullable=False)  # e.g., "Retirement Plan A", "SIP Scenario"
    assumptions = Column(JSON, nullable=False)  # Input parameters as JSON
    results = Column(JSON, nullable=False)  # Calculation results as JSON
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", backref="simulations")
    goal = relationship("Goal", backref="simulations")