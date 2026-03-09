from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.auth import get_current_user

from schemas.investment_schema import InvestmentCreate, InvestmentUpdate
from services.investment_service import create_investment, get_portfolio_summary, update_investment, delete_investment, portfolio_analytics


router = APIRouter(
    prefix="/api/investments",
    tags=["Investments"]
)

@router.post("/")
def add_investment(
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return create_investment(db, current_user.id, investment)

@router.get("/portfolio")
def portfolio_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return get_portfolio_summary(db, current_user.id)

@router.patch("/{investment_id}")
def edit_investment(
    investment_id: int,
    data: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    investment = update_investment(
        db,
        investment_id,
        current_user.id,
        data
    )

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    return investment

@router.delete("/{investment_id}")
def remove_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    deleted = delete_investment(db, investment_id, current_user.id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Investment not found")

    return {"message": "Investment deleted successfully"}

@router.get("/analytics")
def portfolio_performance(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return portfolio_analytics(db, current_user.id)