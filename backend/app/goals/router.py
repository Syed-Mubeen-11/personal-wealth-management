from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/goals")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_goal(goal: schemas.Goal, db: Session = Depends(get_db)):
    db_goal = models.GoalDB(
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        start_date=goal.start_date,
        end_date=goal.end_date
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/")
def get_goals(db: Session = Depends(get_db)):
    return db.query(models.GoalDB).all()