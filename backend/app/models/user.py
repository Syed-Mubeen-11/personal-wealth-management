from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from app.core.database import Base
import enum

class RiskProfile(str, enum.Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"

class KycStatus(str, enum.Enum):
    pending = "pending"
    unverified = "unverified"
    verified = "verified"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    risk_profile = Column(Enum(RiskProfile), default=RiskProfile.moderate)
    kyc_status = Column(Enum(KycStatus), default=KycStatus.unverified)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
