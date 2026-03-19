from pydantic import BaseModel
from typing import Optional

class InvestmentCreate(BaseModel):
    asset_type: str
    symbol: str
    units: float
    avg_buy_price: float
    # NEW FIELDS for the Trade Engine
    trade_type: str = "buy"  # 'buy' or 'sell'
    fees: float = 0.0

class InvestmentResponse(BaseModel):
    id: int
    asset_type: str
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float
    current_value: float

    class Config:
        from_attributes = True

class InvestmentUpdate(BaseModel):
    asset_type: Optional[str] = None
    symbol: Optional[str] = None
    units: Optional[float] = None
    avg_buy_price: Optional[float] = None