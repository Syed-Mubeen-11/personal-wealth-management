from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models import user, investments, transactions, goals
from app.routes import goals as goals_route
from app.routes import investments as investments_route
from app.routes import transactions as transactions_route
from app.routes.stock import router as stock_router
from app.routes.auth import router as auth_router


app = FastAPI()

# CORS must be added before routers
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

# Include routers
app.include_router(auth_router)
app.include_router(stock_router)
app.include_router(goals_route.router, prefix="/goals", tags=["Goals"])
app.include_router(investments_route.router, prefix="/investments", tags=["Investments"])
app.include_router(transactions_route.router, prefix="/transactions", tags=["Transactions"])

# Create tables
user.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Backend running successfully"}
