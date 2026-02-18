from fastapi import FastAPI
from app.core.database import engine
from app.models import user

user.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend running successfully"}
