from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class AssetTypeEnum(str, enum.Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    asset_type = Column(Enum(AssetTypeEnum))
    symbol = Column(String, nullable=False)
    units = Column(Numeric)
    avg_buy_price = Column(Numeric)
    cost_basis = Column(Numeric)
    current_value = Column(Float, nullable=True)
    last_price = Column(Float, nullable=True)
    last_price_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="investments")


def calculate_risk_profile(investments):
    total_value = sum(i.current_value or 0 for i in investments)

    stock_value = sum(
        i.current_value or 0
        for i in investments
        if i.asset_type == "stock"
    )

    stock_ratio = stock_value / total_value if total_value else 0

    if stock_ratio > 0.8:
        return "aggressive"
    elif stock_ratio > 0.4:
        return "moderate"
    else:
        return "conservative"

