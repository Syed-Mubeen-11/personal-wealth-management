from pydantic import BaseModel

class InvestmentCreate(BaseModel):
    asset_type: str
    symbol: str
    units: float
    avg_buy_price: float
    last_price: float

class InvestmentResponse(BaseModel):
    id: int
    asset_type: str
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float
    last_price: float
    current_value: float

    class Config:
        orm_mode = True