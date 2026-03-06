from pydantic import BaseModel
from datetime import date

class GoalCreate(BaseModel):
    goal_type: str
    target_amount: float
    target_date: date
    monthly_contribution: float

class GoalResponse(BaseModel):
    id: int
    goal_type: str
    target_amount: float
    target_date: date
    monthly_contribution: float
    status: str

    class Config:
        orm_mode = True