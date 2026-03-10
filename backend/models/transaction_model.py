from sqlalchemy import Column, Integer, String, Float, ForeignKey
from core.database import Base


class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    symbol = Column(String)

    type = Column(String)   # buy / sell / dividend

    quantity = Column(Float)

    price = Column(Float)

    fees = Column(Float, default=0)