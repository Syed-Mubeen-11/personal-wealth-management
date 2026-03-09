from pydantic import BaseModel, EmailStr
from typing import Optional


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

    class Config:
        from_attributes = True

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
    total_income: int
    total_expenses: int
    savings: int
    expense_breakdown: dict