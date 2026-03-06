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
    risk_profile: str
    kyc_status: str
    
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


class PaginatedTransactionsResponse(BaseModel):
    """Paginated transactions response"""
    total_transactions: int
    current_page: int
    total_pages: int
    per_page: int
    data: List[TransactionResponse]


# ---------------------------------------------------------
# ASSET SCHEMAS
# ---------------------------------------------------------
class AssetCreate(BaseModel):
    """Used for direct asset creation (legacy support)"""
    symbol: str
    quantity: float
    buy_price: float
    company_name: Optional[str] = None
    asset_class: str = "Stock"


class AssetResponse(BaseModel):
    """Returns asset/investment data"""
    symbol: str
    company_name: Optional[str] = None
    asset_class: str = "Stock"
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
    company_name: Optional[str] = None
    units: float
    avg_buy_price: float
    current_price: float
    market_value: float
    gain_loss: float
    gain_loss_percent: float


class OverviewResponse(BaseModel):
    """Portfolio overview summary"""
    total_cost_basis: float
    total_portfolio_value: float
    overall_gain_loss: float
    overall_gain_loss_percent: float
    performance_today: float
    performance_today_percent: float


class AssetAllocationItem(BaseModel):
    """Single item in asset allocation"""
    asset_class: str
    value: float
    percentage: float
    color: str


class AssetAllocationResponse(BaseModel):
    """Asset allocation for donut chart"""
    labels: List[str]
    values: List[float]
    percentages: List[float]
    colors: List[str]


class PortfolioOverviewResponse(BaseModel):
    """Complete portfolio overview response"""
    total_portfolio_value: float
    total_cost_basis: float
    performance_today: float
    performance_today_percent: float
    overall_gain_loss: float
    overall_gain_loss_percent: float
    asset_allocation: AssetAllocationResponse


class PositionTableResponse(BaseModel):
    """Position for table display"""
    symbol: str
    company_name: str
    units: float
    avg_buy_price: float
    current_price: float
    market_value: float
    gain_loss: float
    gain_loss_percent: float


class PaginatedPositionsResponse(BaseModel):
    """Paginated positions response"""
    total_positions: int
    current_page: int
    total_pages: int
    per_page: int
    data: List[PositionTableResponse]


class PortfolioResponse(BaseModel):
    """Complete portfolio response (legacy support)"""


# ---------------------------------------------------------
# GOAL SCHEMAS
# ---------------------------------------------------------
class GoalCreate(BaseModel):
    """Schema for creating a new goal"""
    goal_name: str
    goal_type: str = "custom"  # retirement, home, education, custom, travel
    target_amount: float
    target_date: Optional[str] = None  # ISO date string YYYY-MM-DD
    monthly_contribution: float = 0.0
    status: str = "active"  # active, paused, completed


class GoalUpdate(BaseModel):
    """Schema for updating an existing goal"""
    goal_name: Optional[str] = None
    goal_type: Optional[str] = None
    target_amount: Optional[float] = None
    target_date: Optional[str] = None
    monthly_contribution: Optional[float] = None
    status: Optional[str] = None


class GoalResponse(BaseModel):
    """Schema for returning a goal"""
    id: int
    user_id: int
    goal_name: str
    goal_type: str
    target_amount: float
    target_date: Optional[str] = None
    monthly_contribution: float
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginatedGoalsResponse(BaseModel):
    """Paginated goals response"""
    data: List[GoalResponse]
    total_pages: int
    current_page: int