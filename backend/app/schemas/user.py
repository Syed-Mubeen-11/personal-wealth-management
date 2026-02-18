from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import date, datetime

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    risk_profile: Optional[str] = "moderate"

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: Optional[str]
    address: Optional[str]
    date_of_birth: Optional[date]
    risk_profile: str
    kyc_status: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



class UserLogin(BaseModel):
    email: EmailStr
    password: str
