from sqlalchemy.orm import Session
from app.goals import models, schemas

def create_goal(db: Session, goal: schemas.GoalCreate):
    db_goal = models.Goal(**goal.model_dump())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_goals(db: Session):
    return db.query(models.Goal).all()

def get_goal(db: Session, goal_id: int):
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()

def update_goal(db: Session, goal_id: int, goal: schemas.GoalCreate):
    db_goal = get_goal(db, goal_id)
    if db_goal:
        for key, value in goal.model_dump().items():
            setattr(db_goal, key, value)
        db.commit()
        db.refresh(db_goal)
    return db_goal

def delete_goal(db: Session, goal_id: int):
    db_goal = get_goal(db, goal_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
    return db_goal