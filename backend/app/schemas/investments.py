from pydantic import BaseModel
from enum import Enum
from datetime import datetime


class AssetTypeEnum(str, Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"


#  Create Investment
class InvestmentCreate(BaseModel):
    asset_type: AssetTypeEnum
    symbol: str
    units: float
    avg_buy_price: float


#  Update Investment 
class InvestmentUpdate(BaseModel):
    units: float | None = None
    avg_buy_price: float | None = None
    current_value: float | None = None


#  Response Schema
class InvestmentResponse(BaseModel):
    id: int
    asset_type: AssetTypeEnum
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float | None = None
    current_value: float | None = None
    last_price: float | None = None
    last_price_at: datetime | None = None

    class Config:
        from_attributes = True