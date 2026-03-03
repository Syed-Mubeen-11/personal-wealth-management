from sqlalchemy.orm import Session
from . import models, schemas

# --- USER FUNCTIONS ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Creates a new user. 
    Note: 'name' is removed to match your Model and avoid TypeErrors.
    """
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=fake_hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_user_investment(db: Session, investment: schemas.InvestmentCreate, user_id: int):
    """
    Creates an investment and automatically calculates cost_basis.
    """
    # Automated Logic: cost_basis = units * price
    calculated_cost_basis = investment.units * investment.avg_buy_price
    
    # Create the DB model instance
    # Note: Using .dict() for compatibility; use .model_dump() if on Pydantic v2
    investment_data = investment.dict()
    
    db_investment = models.Investment(
        **investment_data,
        cost_basis=calculated_cost_basis,
        user_id=user_id
    )
    
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment

def get_user_investments(db: Session, user_id: int):
    return db.query(models.Investment).filter(models.Investment.user_id == user_id).all()