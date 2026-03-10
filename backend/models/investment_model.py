from sqlalchemy import Column, Integer, String, Float, ForeignKey
from core.database import Base


class Investment(Base):

    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    asset_type = Column(String)

    symbol = Column(String)

    units = Column(Float)

    avg_buy_price = Column(Float)

    cost_basis = Column(Float)

    current_value = Column(Float)