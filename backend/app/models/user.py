from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
from app.core.database import Base
import enum


class RiskProfileEnum(str, enum.Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class KYCStatusEnum(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    risk_profile = Column(Enum(RiskProfileEnum), nullable=False)
    kyc_status = Column(Enum(KYCStatusEnum), default=KYCStatusEnum.unverified)

    created_at = Column(DateTime, default=datetime.utcnow)
