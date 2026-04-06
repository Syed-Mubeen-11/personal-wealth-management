from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.investments import Investment
from app.schemas.investments import InvestmentCreate, InvestmentResponse, InvestmentUpdate
from app.models.user import User
from app.core.auth import get_current_user
from datetime import datetime
from app.models.transactions import Transaction, TransactionTypeEnum
from app.services.asset_price import get_asset_price
# from app.tasks.price_refresh import refresh_all_prices  # Commented out for Render

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Create Investment ────────────────────────────────────────────────────────
@router.post("/", response_model=InvestmentResponse)
def create_investment(
    data: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.avg_buy_price <= 0:
        raise HTTPException(status_code=400, detail="Buy price must be greater than zero")

    price = get_asset_price(data.symbol, data.asset_type)
    cost_basis = float(data.units) * float(data.avg_buy_price)

    investment = Investment(
        user_id=current_user.id,
        symbol=data.symbol,
        asset_type=data.asset_type,
        units=data.units,
        avg_buy_price=data.avg_buy_price,
        cost_basis=cost_basis,
        current_value=float(data.units) * float(price),
        last_price=price,
        last_price_at=datetime.utcnow()
    )

    db.add(investment)
    db.commit()
    db.refresh(investment)

    transaction = Transaction(
        user_id=current_user.id,
        investment_id=investment.id,
        symbol=data.symbol,
        type=TransactionTypeEnum.buy,
        quantity=data.units,
        price=data.avg_buy_price,
        fees=0,
        executed_at=datetime.utcnow()
    )

    db.add(transaction)
    db.commit()

    return investment


# ── Get All Investments ──────────────────────────────────────────────────────
@router.get("/", response_model=list[InvestmentResponse])
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()


# ── Portfolio Summary — MUST be before /{investment_id} routes ───────────────
@router.get("/summary")
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    if not investments:
        return {
            "total_value": 0,
            "day_change_percentage": 0,
            "best_performer": None,
            "worst_performer": None,
            "investments": []
        }

    inv_list = []
    for inv in investments:
        cost_basis = float(inv.units or 0) * float(inv.avg_buy_price or 0)
        current_value = float(inv.current_value or 0)
        gain_loss_pct = (
            ((current_value - cost_basis) / cost_basis * 100)
            if cost_basis > 0 else 0.0
        )
        inv_list.append({
            "symbol": inv.symbol,
            "asset_type": inv.asset_type,
            "units": float(inv.units or 0),
            "avg_buy_price": float(inv.avg_buy_price or 0),
            "cost_basis": round(cost_basis, 2),
            "current_value": round(current_value, 2),
            "last_price": float(inv.last_price or 0),
            "gain_loss_pct": round(gain_loss_pct, 2),
        })

    total_value = sum(i["current_value"] for i in inv_list)
    total_cost = sum(i["cost_basis"] for i in inv_list)

    day_change_pct = (
        ((total_value - total_cost) / total_cost * 100)
        if total_cost > 0 else 0.0
    )

    best = max(inv_list, key=lambda x: x["gain_loss_pct"])
    worst = min(inv_list, key=lambda x: x["gain_loss_pct"])

    return {
        "total_value": round(total_value, 2),
        "day_change_percentage": round(day_change_pct, 2),
        "best_performer": {"symbol": best["symbol"], "gain_loss_pct": best["gain_loss_pct"]},
        "worst_performer": {"symbol": worst["symbol"], "gain_loss_pct": worst["gain_loss_pct"]},
        "investments": inv_list,
    }


# ── Historical Portfolio Data (Net Worth Growth) ────────────────────────────
@router.get("/historical")
def get_historical_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get historical portfolio value over time based on transactions"""
    
    from app.models.transactions import Transaction
    from collections import defaultdict
    
    # Get all transactions for the user
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.executed_at).all()
    
    if not transactions:
        return {"labels": [], "values": []}
    
    # Group transactions by month
    monthly_data = defaultdict(float)
    
    for txn in transactions:
        month_key = txn.executed_at.strftime("%b %Y")
        # Convert Decimal to float for calculation
        quantity = float(txn.quantity)
        price = float(txn.price)
        
        if txn.type == "buy":
            monthly_data[month_key] += quantity * price
        else:  # sell
            monthly_data[month_key] -= quantity * price
    
    # Calculate running total
    labels = []
    values = []
    running_total = 0.0
    
    for month in sorted(monthly_data.keys()):
        running_total += monthly_data[month]
        labels.append(month)
        values.append(round(running_total, 2))
    
    return {"labels": labels, "values": values}


# ── Refresh All Prices (Direct version without Celery) ────────────────────────
@router.post("/refresh-prices")
def refresh_prices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.services.asset_price import get_asset_price
    from datetime import datetime
    
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    updated_count = 0
    
    for inv in investments:
        try:
            price = get_asset_price(inv.symbol, inv.asset_type)
            if price and price > 0:
                inv.last_price = price
                inv.current_value = float(inv.units) * price
                inv.last_price_at = datetime.utcnow()
                updated_count += 1
                print(f"✅ Updated {inv.symbol}: ₹{price}")
        except Exception as e:
            print(f"❌ Error updating {inv.symbol}: {e}")
    
    db.commit()
    return {"message": f"Updated {updated_count} out of {len(investments)} investments"}


# ── Delete Investment ────────────────────────────────────────────────────────
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


# ── Update Investment ────────────────────────────────────────────────────────
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
        if investment_data.avg_buy_price <= 0:
            raise HTTPException(status_code=400, detail="Buy price must be greater than zero")
        investment.avg_buy_price = investment_data.avg_buy_price

    db.commit()
    db.refresh(investment)
    return investment


# ── Refresh Single Investment Price ─────────────────────────────────────────
@router.post("/{id}/refresh-price")
def refresh_price(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investment).filter(
        Investment.id == id,
        Investment.user_id == current_user.id
    ).first()

    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")

    new_price = get_asset_price(inv.symbol, inv.asset_type)
    inv.current_value = float(inv.units) * float(new_price)
    inv.last_price = new_price
    inv.last_price_at = datetime.utcnow()

    db.commit()
    db.refresh(inv)
    return inv
