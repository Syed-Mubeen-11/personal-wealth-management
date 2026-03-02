from pydantic import BaseModel
from datetime import date
from enum import Enum


class GoalTypeEnum(str, Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"


class GoalStatusEnum(str, Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class GoalCreate(BaseModel):
    goal_type: GoalTypeEnum
    target_amount: float
    target_date: date
    monthly_contribution: float


class GoalResponse(BaseModel):
    id: int
    goal_type: GoalTypeEnum
    target_amount: float
    target_date: date
    monthly_contribution: float
    status: GoalStatusEnum

    class Config:
        from_attributes = True