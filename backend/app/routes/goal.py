from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.goal import Goal
from app.schemas.goal import GoalCreate
from app.routes.user import get_current_user
from app.models.user import User

router = APIRouter(prefix="/goals", tags=["Goals"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create Goal
@router.post("/")
def create_goal(
    goal: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_goal = Goal(
        user_id=current_user.id,
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        monthly_contribution=goal.monthly_contribution
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal

# Get All Goals of User
@router.get("/")
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()

# Delete Goal
@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()

    return {"message": "Goal deleted"}