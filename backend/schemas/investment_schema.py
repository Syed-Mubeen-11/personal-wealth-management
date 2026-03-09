from pydantic import BaseModel
from typing import Optional


class InvestmentCreate(BaseModel):

    asset_type: str
    symbol: str
    units: float
    avg_buy_price: float


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