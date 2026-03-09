from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.auth import get_current_user

from schemas.simulation_schema import SimulationCreate
from services.simulation_service import run_simulation


router = APIRouter(
    prefix="/api/simulations",
    tags=["Simulations"]
)


@router.post("/")
def simulate_goal(
    data: SimulationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    result = run_simulation(db, current_user.id, data)

    if not result:
        raise HTTPException(status_code=404, detail="Goal not found")

    return result