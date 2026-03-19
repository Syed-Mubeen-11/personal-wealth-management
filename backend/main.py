from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base

# Models (important for SQLAlchemy relationships)
from app.models import user, investments, transactions, goals, simulations

# Routes
from app.routes import goals, investments, transactions, simulations
from app.routes.stock import router as stock_router
from app.routes.auth import router as auth_router

app = FastAPI()

# CORS (must come before routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(stock_router, prefix="/stocks", tags=["Stocks"])
app.include_router(goals.router, prefix="/goals", tags=["Goals"])
app.include_router(investments.router, prefix="/investments", tags=["Investments"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(simulations.router, prefix="/simulations", tags=["Simulations"])

# Create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Backend running successfully"}