from pydantic import BaseModel


class SimulationCreate(BaseModel):

    goal_id: int
    extra_monthly_investment: float = 0
    expected_return: float = 12