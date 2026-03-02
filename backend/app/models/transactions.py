from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class TransactionTypeEnum(str, enum.Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
    Integer,
    ForeignKey("users.id", ondelete="CASCADE"),
    nullable=False
)
    investment_id = Column(
        Integer,
        ForeignKey("investments.id", ondelete="CASCADE"),
        nullable=False
    )
    symbol = Column(String, nullable=False)
    type = Column(Enum(TransactionTypeEnum))

    quantity = Column(Numeric)
    price = Column(Numeric)
    fees = Column(Numeric)

    executed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    investment = relationship("Investment")