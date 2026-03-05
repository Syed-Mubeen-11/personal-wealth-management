from fastapi import FastAPI
from app.goals.router import router as goal_router
from database import Base, engine

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(goal_router, prefix="/goals", tags=["Goals"])