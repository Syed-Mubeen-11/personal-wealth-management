from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.investments import Investment
from app.schemas.investments import InvestmentCreate, InvestmentResponse, InvestmentUpdate
from app.models.user import User
from app.core.auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#  Create Investment
@router.post("/", response_model=InvestmentResponse)
def create_investment(
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cost_basis = investment.units * investment.avg_buy_price

    new_investment = Investment(
        user_id=current_user.id,
        asset_type=investment.asset_type,
        symbol=investment.symbol,
        units=investment.units,
        avg_buy_price=investment.avg_buy_price,
        cost_basis=cost_basis
    )

    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)
    return new_investment


#  Get User Investments
@router.get("/", response_model=list[InvestmentResponse])
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()


#  Delete Investment
@router.delete("/{investment_id}")
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    db.delete(investment)
    db.commit()
    return {"message": "Investment deleted"}

@router.put("/{investment_id}", response_model=InvestmentResponse)
def update_investment(
    investment_id: int,
    investment_data: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    if investment_data.units is not None:
        investment.units = investment_data.units

    if investment_data.avg_buy_price is not None:
        investment.avg_buy_price = investment_data.avg_buy_price

    db.commit()
    db.refresh(investment)
    return investment