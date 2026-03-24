from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import RiskProfile, KycStatus

# Auth schemas
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

# User schemas
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    risk_profile: RiskProfile
    kyc_status: KycStatus
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    risk_profile: Optional[RiskProfile] = None

TokenResponse.model_rebuild()
