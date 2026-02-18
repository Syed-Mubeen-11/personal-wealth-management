from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
import models, schemas, crud
from auth import verify_password, create_token
import requests

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Wealth Backend Running!"}

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@app.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/github/prs")
def get_prs(owner: str = Query(...), repo: str = Query(...)):
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json()
    raise HTTPException(status_code=resp.status_code, detail="PR fetch failed")
