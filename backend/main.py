from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base

# Models (important for SQLAlchemy relationships)
from app.models import user, investments, transactions, goals, simulations

# Routes
from app.routes import goals, investments, transactions, simulations
from app.routes.auth import router as auth_router
from app.routes import stock_search
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
app.include_router(goals.router, prefix="/goals", tags=["Goals"])
app.include_router(investments.router, prefix="/investments", tags=["Investments"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(simulations.router, prefix="/simulations", tags=["Simulations"])
app.include_router(stock_search.router, prefix="/stocks", tags=["Stocks"])

# Create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Backend running successfully"}