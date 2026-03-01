from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    riskprofile: str = "moderate"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    riskprofile: str
    kycstatus: str
    
    class Config:
        from_attributes = True


# ---------------------------------------------------------
# TRANSACTION SCHEMAS
# ---------------------------------------------------------
class TransactionCreate(BaseModel):
    """Used for POST /transactions payload"""
    transaction_type: str  # "Buy", "Sell", "Contribution", "Withdrawal"
    asset_symbol: str = "Cash"  # Ticker symbol or "Cash" for contributions/withdrawals
    quantity: Optional[float] = None  # Number of shares (null for cash transfers)
    amount: float  # Total monetary value of the transaction


class TransactionResponse(BaseModel):
    """Used for returning transaction data"""
    id: int
    date: datetime
    transaction_type: str
    asset_symbol: Optional[str] = None
    quantity: Optional[float] = None
    amount: float

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# ASSET SCHEMAS
# ---------------------------------------------------------
class AssetCreate(BaseModel):
    """Used for direct asset creation (legacy support)"""
    symbol: str
    quantity: float
    buy_price: float


class AssetResponse(BaseModel):
    """Returns asset/investment data"""
    symbol: str
    quantity: float
    buy_price: float

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# PORTFOLIO SCHEMAS
# ---------------------------------------------------------
class PositionResponse(BaseModel):
    """Individual position in the portfolio"""
    symbol: str
    units: float
    avg_buy_price: float
    current_price: float
    market_value: float
    gain_loss: float


class OverviewResponse(BaseModel):
    """Portfolio overview summary"""
    total_cost_basis: float
    total_portfolio_value: float
    overall_gain_loss: float


class PortfolioResponse(BaseModel):
    """Complete portfolio response"""
    positions: List[PositionResponse]
    overview: OverviewResponse


# ---------------------------------------------------------
# GOAL SCHEMAS
# ---------------------------------------------------------
class GoalCreate(BaseModel):
    target_name: str
    target_amount: float


class GoalResponse(GoalCreate):
    id: int
    owner_id: int
    percent_complete: float = 0
    current_balance: float = 0

    class Config:
        from_attributes = True

