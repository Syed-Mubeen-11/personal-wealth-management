from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.simulations import Simulation
from app.services.simulation import simulate_investment
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def run_simulation(
    scenario_name: str,
    monthly_contribution: float,
    years: int,
    expected_return: float,
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    projection = simulate_investment(
        monthly_contribution,
        years,
        expected_return
    )

    assumptions = {
        "monthly_contribution": monthly_contribution,
        "years": years,
        "expected_return": expected_return
    }

    results = {
        "projection": projection
    }

    from datetime import datetime

    sim = Simulation(
        user_id=current_user.id,
        goal_id=goal_id,
        scenario_name=scenario_name,
        assumptions=assumptions,
        results=results,
        created_at=datetime.utcnow()
    )

    db.add(sim)
    db.commit()
    db.refresh(sim)

    return {
        "simulation_id": sim.id,
        "projection": projection
    }