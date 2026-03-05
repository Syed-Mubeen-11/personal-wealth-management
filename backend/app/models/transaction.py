from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    symbol = Column(String, nullable=False)

    type = Column(String, nullable=False)  # buy / sell / dividend

    quantity = Column(Float, nullable=False)

    price = Column(Float, nullable=False)

    fees = Column(Float, default=0.0)
