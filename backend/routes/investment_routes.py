from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.auth import get_current_user
from models.investment_model import Investment
from schemas.investment_schema import InvestmentCreate, InvestmentUpdate
from services.investment_service import  get_portfolio_summary, update_investment, delete_investment, process_trade, get_portfolio_analytics_data
from services.market_service import update_live_prices

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
    # Call the smart trade processor instead of a simple create
    result = process_trade(
        db=db,
        user_id=current_user.id,
        symbol=investment.symbol,
        asset_type=investment.asset_type,
        trade_type=investment.trade_type,
        units=investment.units,
        price=investment.avg_buy_price,
        fees=investment.fees
    )

    # Handle the "Insufficient units" error case
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result

@router.get("/portfolio")
def portfolio_summary_route(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
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
def portfolio_analytics_route(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Call the cleaned up service
    return get_portfolio_analytics_data(db, current_user.id)

@router.get("/")
def get_all_investments_route(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # This is for your main table view
    update_live_prices(db, current_user.id)
    return db.query(Investment).filter(Investment.user_id == current_user.id).all()