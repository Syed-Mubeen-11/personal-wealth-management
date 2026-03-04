from pydantic import BaseModel, EmailStr
from typing import List, Optional
from decimal import Decimal

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class InvestmentBase(BaseModel):
    asset_type: str # Changed from AssetType to str to stop the import error
    symbol: str
    units: Decimal
    avg_buy_price: Decimal

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    cost_basis: Decimal
    class Config:
        from_attributes = True