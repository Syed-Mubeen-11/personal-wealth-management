"""
Simulations global list endpoint — used by Reports page (FE-3).
Returns all simulations for the authenticated user across all goals.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.goal import Simulation, Goal

router = APIRouter()


@router.get("")
def list_all_simulations(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return paginated list of all simulations for the authenticated user.
    Each item includes the linked goal name if applicable.
    """
    query = (
        db.query(Simulation)
        .filter(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
    )
    total = query.count()
    sims = query.offset(offset).limit(limit).all()

    items = []
    for s in sims:
        goal_name = None
        if s.goal_id:
            goal = db.query(Goal).filter(Goal.id == s.goal_id).first()
            goal_name = goal.name if goal else None

        items.append({
            "id":            s.id,
            "goal_id":       s.goal_id,
            "goal_name":     goal_name,
            "scenario_name": s.scenario_name,
            "assumptions":   s.assumptions,
            "results":       s.results,
            "created_at":    s.created_at,
        })

    return {"total": total, "limit": limit, "offset": offset, "items": items}
