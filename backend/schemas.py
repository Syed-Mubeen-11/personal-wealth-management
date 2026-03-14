from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
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


# ---------------------------------------------------------
# PROFILE & RISK SCHEMAS
# ---------------------------------------------------------
class ProfileRiskUpdate(BaseModel):
    """Schema for updating user profile and risk settings"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    residential_address: Optional[str] = None
    date_of_birth: Optional[str] = None  # ISO date string YYYY-MM-DD
    risk_profile: Optional[str] = None  # conservative, moderate, aggressive
    kyc_status: Optional[str] = None  # completed, pending


class ProfileRiskResponse(BaseModel):
    """Schema for returning profile and risk data"""
    id: int
    full_name: Optional[str] = None
    email: str
    phone_number: Optional[str] = None
    residential_address: Optional[str] = None
    date_of_birth: Optional[str] = None
    risk_profile: str = "moderate"
    kyc_status: str = "pending"

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# SIMULATION SCHEMAS
# ---------------------------------------------------------

class SIPSimulationRequest(BaseModel):
    """SIP (Systematic Investment Plan) calculator input"""
    monthly_investment: float  # Monthly contribution amount
    years: int  # Investment duration in years
    expected_return_rate: float = 12.0  # Annual return rate (percentage)
    scenario_name: Optional[str] = "SIP Simulation"
    goal_id: Optional[int] = None  # Optional link to a goal


class RetirementSimulationRequest(BaseModel):
    """Retirement planning calculator input"""
    current_age: int
    retirement_age: int
    current_savings: float = 0.0
    monthly_contribution: float
    expected_return_rate: float = 8.0  # Pre-retirement return rate (%)
    post_retirement_return_rate: float = 5.0  # Post-retirement return rate (%)
    inflation_rate: float = 3.0  # Annual inflation rate (%)
    monthly_expense_at_retirement: float  # Desired monthly expense at retirement
    scenario_name: Optional[str] = "Retirement Simulation"
    goal_id: Optional[int] = None


class LoanPayoffSimulationRequest(BaseModel):
    """Loan payoff calculator input"""
    principal: float  # Loan amount
    annual_interest_rate: float  # Annual interest rate (%)
    loan_term_months: int  # Loan term in months
    extra_monthly_payment: float = 0.0  # Additional monthly payment
    scenario_name: Optional[str] = "Loan Payoff Simulation"
    goal_id: Optional[int] = None


class GoalSimulationRequest(BaseModel):
    """Goal-based projection calculator"""
    target_amount: float
    current_savings: float = 0.0
    monthly_contribution: float
    expected_return_rate: float = 8.0  # Annual return rate (%)
    target_years: Optional[int] = None  # If provided, calculates if goal is achievable
    scenario_name: Optional[str] = "Goal Simulation"
    goal_id: Optional[int] = None


class WhatIfSimulationRequest(BaseModel):
    """Generic What-if scenario with custom parameters"""
    scenario_type: str  # "sip", "retirement", "loan", "goal", "custom"
    scenario_name: str
    parameters: Dict[str, Any]  # Flexible parameters based on scenario type
    goal_id: Optional[int] = None


class YearlyProjection(BaseModel):
    """Year-by-year projection data point"""
    year: int
    invested_amount: float
    interest_earned: float
    total_value: float


class SIPSimulationResult(BaseModel):
    """SIP calculation result"""
    total_invested: float
    estimated_returns: float
    total_value: float
    annual_return_rate: float
    yearly_projections: List[YearlyProjection]


class RetirementSimulationResult(BaseModel):
    """Retirement planning result"""
    years_until_retirement: int
    corpus_at_retirement: float
    total_invested: float
    total_returns: float
    monthly_income_at_retirement: float
    corpus_lasts_until_age: int
    inflation_adjusted_expense: float
    yearly_projections: List[Dict[str, Any]]


class LoanPayoffResult(BaseModel):
    """Loan payoff calculation result"""
    monthly_payment: float
    total_payment: float
    total_interest: float
    payoff_months: int
    payoff_date: str
    interest_saved_with_extra: float
    months_saved_with_extra: int
    amortization_schedule: List[Dict[str, Any]]


class GoalSimulationResult(BaseModel):
    """Goal-based projection result"""
    target_amount: float
    projected_value: float
    is_achievable: bool
    shortfall_or_surplus: float
    months_to_goal: Optional[int]
    required_monthly_contribution: float
    yearly_projections: List[YearlyProjection]


class SimulationResponse(BaseModel):
    """Generic simulation response"""
    id: int
    user_id: int
    goal_id: Optional[int] = None
    scenario_name: str
    assumptions: Dict[str, Any]
    results: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedSimulationsResponse(BaseModel):
    """Paginated simulations list"""
    data: List[SimulationResponse]
    total: int
    current_page: int
    total_pages: int