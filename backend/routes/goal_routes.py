from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.auth import get_current_user

from schemas.goal_schema import GoalCreate, GoalUpdate
from services.goal_service import create_goal, get_user_goals, update_goal, delete_goal

router = APIRouter(prefix="/api/goals", tags=["Goals"])


@router.post("/")
def add_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return create_goal(db, current_user.id, goal)

@router.get("/")
def list_goals(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return get_user_goals(db, current_user.id)

@router.put("/{goal_id}")
def edit_goal(
    goal_id: int,
    goal: GoalUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    updated_goal = update_goal(db, goal_id, current_user.id, goal)

    if not updated_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    return updated_goal

@router.delete("/{goal_id}")
def remove_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    deleted = delete_goal(db, goal_id, current_user.id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Goal not found")

    return {"message": "Goal deleted successfully"}