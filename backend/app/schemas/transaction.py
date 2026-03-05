from pydantic import BaseModel
from typing import Optional

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

    class Config:
        orm_mode = True
