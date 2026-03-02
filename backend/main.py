from fastapi import FastAPI
from app.core.database import engine
from app.models import user
from app.models import investments
from app.models import transactions
from app.models import goals
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes import goals, investments, transactions


app = FastAPI()

app.include_router(goals.router, prefix="/goals", tags=["Goals"])
app.include_router(investments.router, prefix="/investments", tags=["Investments"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])

app.add_middleware(
    CORSMiddleware,
     allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Backend running successfully"}

app.include_router(auth_router)
