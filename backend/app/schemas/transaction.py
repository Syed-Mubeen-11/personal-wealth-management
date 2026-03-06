from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransactionCreate(BaseModel):
    symbol: str
    type: str
    quantity: float
    price: float
    fees: Optional[float] = 0

class TransactionUpdate(BaseModel):
    quantity: Optional[float]
    price: Optional[float]
    fees: Optional[float]

class TransactionResponse(BaseModel):
    id: int
    symbol: str
    type: str
    quantity: float
    price: float
    fees: float
    executed_at: datetime

    class Config:
        orm_mode = True