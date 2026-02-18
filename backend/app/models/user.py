from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)

    risk_profile = Column(String, default="moderate")
    kyc_status = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
