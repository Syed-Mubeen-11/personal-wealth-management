from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal  # database.py path adjust chesukondi
from app.goals import crud, schemas  # correct relative import

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    return crud.create_goal(db, goal)

@router.get("/", response_model=list[schemas.Goal])
def read_goals(db: Session = Depends(get_db)):
    return crud.get_goals(db)