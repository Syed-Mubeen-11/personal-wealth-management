from fastapi import FastAPI
from app.core.database import engine
from app.models import user
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


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
