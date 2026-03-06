from pydantic import BaseModel
from enum import Enum
from datetime import datetime


class TransactionTypeEnum(str, Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


#  Create Transaction
class TransactionCreate(BaseModel):
    investment_id: int
    type: TransactionTypeEnum
    quantity: float
    price: float
    fees: float = 0


#  Response Schema
class TransactionResponse(BaseModel):
    id: int
    investment_id: int
    symbol: str
    type: TransactionTypeEnum
    quantity: float
    price: float
    fees: float
    executed_at: datetime


    class Config:
        from_attributes = True