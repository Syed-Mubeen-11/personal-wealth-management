from models.simulation_model import Simulation
from models.goal_model import Goal


def run_simulation(db, user_id, data):

    goal = db.query(Goal).filter(
        Goal.id == data.goal_id,
        Goal.user_id == user_id
    ).first()

    if not goal:
        return None

    monthly_investment = goal.monthly_contribution + data.extra_monthly_investment

    annual_return = data.expected_return / 100
    monthly_rate = annual_return / 12

    target = goal.target_amount

    current_value = 0
    months = 0

    while current_value < target:

        current_value = (
            current_value * (1 + monthly_rate)
        ) + monthly_investment

        months += 1

    years = months // 12

    result = {
        "months_needed": months,
        "years_needed": years,
        "monthly_investment": monthly_investment
    }

    simulation = Simulation(
        goal_id=goal.id,
        assumptions=data.dict(),
        results=result
    )

    db.add(simulation)
    db.commit()

    return result