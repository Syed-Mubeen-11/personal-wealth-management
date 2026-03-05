from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Numeric, Date
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import os
from dotenv import load_dotenv
from datetime import date

# -----------------------
# Load .env + DB connection
# -----------------------
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# -----------------------
# Goal Table Model
# -----------------------
class GoalDB(Base):
    __tablename__ = "goal"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    target_amount = Column(Numeric(10,2), nullable=False)
    current_amount = Column(Numeric(10,2), default=0)
    start_date = Column(Date)
    end_date = Column(Date)

# Create table
Base.metadata.create_all(bind=engine)

# -----------------------
# FastAPI App
# -----------------------
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------
# Pydantic Model
# -----------------------
class Goal(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    start_date: date | None = None
    end_date: date | None = None

# -----------------------
# CRUD APIs
# -----------------------

@app.post("/goals")
def create_goal(goal: Goal, db: Session = Depends(get_db)):
    db_goal = GoalDB(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals")
def get_goals(db: Session = Depends(get_db)):
    return db.query(GoalDB).all()

@app.get("/goals/{goal_id}")
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@app.put("/goals/{goal_id}")
def update_goal(goal_id: int, goal: Goal, db: Session = Depends(get_db)):
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()

    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    for key, value in goal.dict().items():
        setattr(db_goal, key, value)

    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()

    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(db_goal)
    db.commit()

    return {"deleted_goal_id": goal_id}