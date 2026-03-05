from pydantic import BaseModel
from datetime import date

class Goal(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    start_date: date | None = None
    end_date: date | None = None

    class Config:
        orm_mode = True
