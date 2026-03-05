from sqlalchemy.orm import Session
from . import models, schemas

# CREATE
def create_goal(db: Session, goal: schemas.GoalCreate):
    db_goal = models.Goal(
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

# READ ALL
def get_goals(db: Session):
    return db.query(models.Goal).all()

# READ SINGLE
def get_goal(db: Session, goal_id: int):
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()

# UPDATE
def update_goal(db: Session, goal_id: int, goal: schemas.GoalCreate):
    db_goal = get_goal(db, goal_id)
    if not db_goal:
        return None
    for key, value in goal.dict().items():
        setattr(db_goal, key, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal

# DELETE
def delete_goal(db: Session, goal_id: int):
    db_goal = get_goal(db, goal_id)
    if not db_goal:
        return None
    db.delete(db_goal)
    db.commit()
    return db_goal