from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, crud, database

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Personalized Wealth Management project application")
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Personalized Wealth Management API", "status": "Online"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/users/{user_id}/investments/", response_model=schemas.InvestmentResponse)
def create_investment_for_user(
    user_id: int, 
    investment: schemas.InvestmentCreate, 
    db: Session = Depends(get_db)
):
    return crud.create_user_investment(db=db, investment=investment, user_id=user_id)

@app.get("/users/{user_id}/investments", response_model=list[schemas.InvestmentResponse])
def read_investments(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieves all investments belonging to a specific user.
    """
    investments = crud.get_investments_by_user(db, user_id=user_id)
    return investments