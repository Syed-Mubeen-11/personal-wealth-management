from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class RiskProfileEnum(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    risk_profile: RiskProfileEnum

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    risk_profile: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[str] = None



class ChangePassword(BaseModel):
    current_password: str
    new_password: str