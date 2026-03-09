from pydantic import BaseModel


class TransactionCreate(BaseModel):

    symbol: str
    type: str
    quantity: float
    price: float
    fees: float = 0


class TransactionResponse(BaseModel):

    id: int
    symbol: str
    type: str
    quantity: float
    price: float
    fees: float

    class Config:
        from_attributes = True