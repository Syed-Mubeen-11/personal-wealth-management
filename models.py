from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from database import Base
from enum import Enum as PyEnum
from datetime import datetime

class RiskEnum(str, PyEnum):
    conservative = "conservative"
    moderate = "moderate" 
    aggressive = "aggressive"

class KYCEnum(str, PyEnum):
    unverified = "unverified"
    verified = "verified"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    riskprofile = Column(Enum(RiskEnum), default=RiskEnum.moderate)
    kycstatus = Column(Enum(KYCEnum), default=KYCEnum.unverified)
    createdat = Column(TIMESTAMP, default=datetime.utcnow)
