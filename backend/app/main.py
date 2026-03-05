from fastapi import FastAPI
from app.core.database import engine, Base
from app.models import user
from app.routes import user as user_routes,transaction
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user_routes.router)

app.include_router(transaction.router)

@app.get("/")
def root():
    return {"message": "Backend + Database connected"}
