from fastapi import FastAPI
from backend.goal_management.router import router as goal_router
from backend.database import Base, engine

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include Goal router
app.include_router(goal_router)