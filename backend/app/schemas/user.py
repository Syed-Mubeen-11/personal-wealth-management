from pydantic import BaseModel, EmailStr
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
