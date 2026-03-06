from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    symbol = Column(String, nullable=False)

    type = Column(String, nullable=False)  # buy, sell, dividend, etc.

    quantity = Column(Float, nullable=False)

    price = Column(Float, nullable=False)

    fees = Column(Float, default=0)

    executed_at = Column(DateTime, server_default=func.now())