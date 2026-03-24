from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routes import auth, users, goals, portfolio, market, dashboard
from app.models import user, goal, portfolio as portfolio_models  # noqa

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WealthApp API", version="6.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(users.router,      prefix="/api/users",      tags=["Users"])
app.include_router(goals.router,      prefix="/api/goals",      tags=["Goals"])
app.include_router(portfolio.router,  prefix="/api/portfolio",  tags=["Portfolio"])
app.include_router(market.router,     prefix="/api/market",     tags=["Market"])
app.include_router(dashboard.router,  prefix="/api/dashboard",  tags=["Dashboard"])

@app.get("/")
def root():
    return {"message": "WealthApp API", "version": "4.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "version": "6.0.0"}
