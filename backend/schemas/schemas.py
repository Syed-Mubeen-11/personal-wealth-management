from pydantic import BaseModel, EmailStr
from typing import Optional
from typing import Dict

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    phone_number: str
    password: str
    confirm_password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    phone_number: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    login_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ProfileCreate(BaseModel):
    age: int
    address: str


class ProfileResponse(BaseModel):
    age: int
    address: str
    profile_photo: Optional[str]
    aadhaar_no: Optional[str]
    pan_no: Optional[str]
    kyc_status: str
    investment_risk: str
    risk_profile: str

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    address: Optional[str] = None
    aadhaar_no: Optional[str] = None
    pan_no: Optional[str] = None
    investment_risk: Optional[str] = None

class IncomeCreate(BaseModel):
    source: str
    amount: int


class IncomeResponse(BaseModel):
    id: int
    source: str
    amount: int

    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    category: str
    amount: int
    description: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    category: str
    amount: int
    description: str | None = None

    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    total_income: float
    total_expenses: float
    savings: float
    portfolio_value: float
    total_invested: float
    profit_loss: float
    goal_count: int
    expense_breakdown: Dict[str, float]
    asset_allocation: Dict[str, float]