"""
Portfolio Models — Properly Architected

Relationship:
  Transactions  →  (aggregated into)  Investments
  MarketPrice   →  (referenced by)    Investments
  Transactions = source of truth
  Investments  = derived/cached view
  MarketPrice  = separate concern, updated by yfinance
"""
from sqlalchemy import (
    Column, Integer, String, Numeric, Enum,
    DateTime, ForeignKey, func, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class AssetType(str, enum.Enum):
    stock       = "stock"
    etf         = "etf"
    mutual_fund = "mutual_fund"
    bond        = "bond"
    cash        = "cash"


class TransactionType(str, enum.Enum):
    buy          = "buy"
    sell         = "sell"
    dividend     = "dividend"
    contribution = "contribution"
    withdrawal   = "withdrawal"


# ── Market Prices ─────────────────────────────────────────────────────────────
# Separate table — updated by yfinance, referenced by Investments
# One row per symbol (upserted on refresh)

class MarketPrice(Base):
    __tablename__ = "market_prices"
    __table_args__ = (UniqueConstraint("symbol", name="uq_market_prices_symbol"),)

    id          = Column(Integer, primary_key=True, index=True)
    symbol      = Column(String(20), nullable=False, index=True)
    price       = Column(Numeric(15, 4), nullable=False)
    change      = Column(Numeric(15, 4), default=0)
    change_pct  = Column(Numeric(8, 4),  default=0)
    currency    = Column(String(10),     default="USD")
    source      = Column(String(50),     default="yfinance")
    fetched_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ── Investments ───────────────────────────────────────────────────────────────
# Aggregated view of all transactions per symbol per user
# Rebuilt/updated every time a transaction is added

class Investment(Base):
    __tablename__ = "investments"
    __table_args__ = (UniqueConstraint("user_id", "symbol", name="uq_investment_user_symbol"),)

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_type    = Column(Enum(AssetType), nullable=False, default=AssetType.stock)
    symbol        = Column(String(20), nullable=False)
    company_name  = Column(String(200), nullable=True)

    # Aggregated from transactions
    units         = Column(Numeric(18, 6), default=0)       # total units held
    avg_buy_price = Column(Numeric(15, 4), default=0)       # weighted avg cost
    cost_basis    = Column(Numeric(15, 2), default=0)       # total amount invested

    # From market_prices (cached here for fast reads)
    current_value = Column(Numeric(15, 2), default=0)       # units × last_price
    last_price    = Column(Numeric(15, 4), nullable=True)
    last_price_at = Column(DateTime(timezone=True), nullable=True)

    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    transactions  = relationship(
        "Transaction", back_populates="investment",
        cascade="all, delete-orphan",
        foreign_keys="Transaction.investment_id"
    )


# ── Transactions ──────────────────────────────────────────────────────────────
# Primary source of truth — every buy/sell/dividend/contribution/withdrawal

class Transaction(Base):
    __tablename__ = "transactions"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="SET NULL"), nullable=True)
    symbol        = Column(String(20), nullable=True)
    type          = Column(Enum(TransactionType), nullable=False)
    quantity      = Column(Numeric(18, 6), default=0)
    price         = Column(Numeric(15, 4), default=0)
    fees          = Column(Numeric(10, 2), default=0)
    notes         = Column(String(500), nullable=True)
    executed_at   = Column(DateTime(timezone=True), server_default=func.now())

    investment    = relationship(
        "Investment", back_populates="transactions",
        foreign_keys=[investment_id]
    )
