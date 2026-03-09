from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.investments import Investment
from app.schemas.investments import InvestmentCreate, InvestmentResponse, InvestmentUpdate
from app.models.user import User
from app.core.auth import get_current_user
from datetime import datetime
import yfinance as yf
from app.services.asset_price import get_asset_price

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#  Create Investment
@router.post("/investments/")
def create_investment(data: InvestmentCreate, db: Session = Depends(get_db)):

    price = get_asset_price(data.symbol, data.asset_type)

    investment = Investment(
        symbol=data.symbol,
        asset_type=data.asset_type,
        units=data.units,
        avg_buy_price=data.avg_buy_price,
        current_price=price,
        last_price=price,
        last_price_timestamp=datetime.utcnow()
    )

    db.add(investment)
    db.commit()
    db.refresh(investment)

    return investment

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

@router.post("/investments/{id}/refresh-price")
def refresh_price(id: int, db: Session = Depends(get_db)):

    inv = db.query(Investment).filter(Investment.id == id).first()

    new_price = get_asset_price(inv.symbol, inv.asset_type)

    inv.last_price = inv.current_price
    inv.current_price = new_price
    inv.last_price_timestamp = datetime.utcnow()

    db.commit()
    db.refresh(inv)

    return inv