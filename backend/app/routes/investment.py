from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.investment import Investment
from app.schemas.investment import InvestmentCreate
from app.routes.user import get_current_user
from app.models.user import User

router = APIRouter(prefix="/investments", tags=["Investments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_investment(
    investment: InvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    cost_basis = investment.units * investment.avg_buy_price

    current_value = investment.units * investment.last_price

    new_inv = Investment(
        user_id=current_user.id,
        asset_type=investment.asset_type,
        symbol=investment.symbol,
        units=investment.units,
        avg_buy_price=investment.avg_buy_price,
        cost_basis=cost_basis,
        last_price=investment.last_price,
        current_value=current_value
    )

    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    return new_inv

@router.get("/")
def get_investments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()
    

