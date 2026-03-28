from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env variables at start
load_dotenv()

from app.core.database import engine, Base

# Models (important for SQLAlchemy to register all tables)
from app.models import user, investments, transactions, goals, simulations

# Routes
from app.routes import goals, investments, transactions, simulations, reports
from app.routes.auth import router as auth_router
from app.routes import stock_search
from app.routes import recommendations

app = FastAPI()

# CORS (must come before routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(goals.router,           prefix="/goals",           tags=["Goals"])
app.include_router(investments.router,     prefix="/investments",     tags=["Investments"])
app.include_router(transactions.router,    prefix="/transactions",    tags=["Transactions"])
app.include_router(simulations.router,     prefix="/simulations",     tags=["Simulations"])
app.include_router(stock_search.router,    prefix="/stocks",          tags=["Stocks"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(reports.router,         prefix="/reports",         tags=["Reports"])

# Create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Backend running successfully"}