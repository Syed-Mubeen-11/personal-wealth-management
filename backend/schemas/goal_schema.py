from pydantic import BaseModel
from datetime import date
from typing import Optional


class GoalCreate(BaseModel):

    goal_type: str
    target_amount: int
    target_date: date
    monthly_contribution: int


class GoalResponse(BaseModel):

    id: int
    goal_type: str
    target_amount: int
    target_date: date
    monthly_contribution: int
    status: str

    class Config:
        from_attributes = True

class GoalUpdate(BaseModel):

    goal_type: Optional[str] = None
    target_amount: Optional[int] = None
    target_date: Optional[date] = None
    monthly_contribution: Optional[int] = None
    status: Optional[str] = None