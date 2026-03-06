from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    asset_type = Column(String)
    symbol = Column(String)

    units = Column(Float)

    avg_buy_price = Column(Float)

    cost_basis = Column(Float)

    last_price = Column(Float)

    current_value = Column(Float)

    last_price_at = Column(DateTime, server_default=func.now())