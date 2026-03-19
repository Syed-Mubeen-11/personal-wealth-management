from models.investment_model import Investment
from models.transaction_model import Transaction
from sqlalchemy.orm import Session
from services.market_service import update_live_prices


def create_investment(db: Session, user_id: int, investment):
    # 1. Calculate the financial basics
    cost_basis = investment.units * investment.avg_buy_price

    # 2. CREATE THE HOLDING (Investment Table)
    new_investment = Investment(
        user_id=user_id,
        asset_type=investment.asset_type,
        symbol=investment.symbol,
        units=investment.units,
        avg_buy_price=investment.avg_buy_price,
        cost_basis=cost_basis,
        current_value=cost_basis
    )
    db.add(new_investment)
    
    # 3. CREATE THE AUDIT TRAIL (Transaction Table)
    # We use 'buy' as the type since adding a new asset is a purchase.
    new_trade = Transaction(
        user_id=user_id,
        symbol=investment.symbol.upper(),
        type="buy", 
        quantity=investment.units,
        price=investment.avg_buy_price,
        fees=0  # Defaulting to 0 as it's an automated log
    )
    db.add(new_trade)

    # 4. ATOMIC COMMIT: Both records are saved or neither is.
    db.commit()
    db.refresh(new_investment)

    return new_investment

def process_trade(db: Session, user_id: int, symbol: str, asset_type: str, trade_type: str, units: float, price: float, fees: float = 0):
    symbol = symbol.upper()
    trade_type = trade_type.lower()

    # 1. Find if the user already owns this asset
    holding = db.query(Investment).filter(
        Investment.user_id == user_id, 
        Investment.symbol == symbol
    ).first()

    if trade_type == "sell":
        if not holding or holding.units < units:
            return {"error": "Insufficient units to sell"}
        
        # Subtract units
        holding.units -= units
        # Recalculate cost basis based on the original average buy price
        holding.cost_basis = holding.units * holding.avg_buy_price
        # Update current value to the price sold at (for immediate dashboard reflection)
        holding.current_value = holding.units * price
        
        if holding.units == 0:
            db.delete(holding)
            holding = None # Mark as none so we don't try to return a deleted row
            
    elif trade_type == "buy":
        if holding:
            # Weighted Average Price Calculation
            total_cost = holding.cost_basis + (units * price)
            total_units = holding.units + units
            holding.avg_buy_price = total_cost / total_units
            holding.units = total_units
            holding.cost_basis = total_cost
            holding.current_value = total_units * price
        else:
            # Create new holding with the asset_type passed from frontend
            holding = Investment(
                user_id=user_id,
                symbol=symbol,
                asset_type=asset_type, # Added here
                units=units,
                avg_buy_price=price,
                cost_basis=units * price,
                current_value=units * price
            )
            db.add(holding)

    # 2. Always log to Trade History (Transactions)
    new_trade = Transaction(
        user_id=user_id,
        symbol=symbol,
        type=trade_type,
        quantity=units,
        price=price,
        fees=fees
    )
    db.add(new_trade)
    
    db.commit()
    
    # Return a status if position closed, otherwise the holding object
    return holding if holding else {"message": "Position closed"}

def get_portfolio_summary(db, user_id):
    # 1. Update prices first
    update_live_prices(db, user_id)
    
    # 2. Fetch data
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()

    # SAFE SUM: Treat None as 0 so it doesn't crash the server
    total_invested = sum((inv.cost_basis or 0) for inv in investments)
    total_current_value = sum((inv.current_value or 0) for inv in investments)

    return {
        "total_invested": total_invested,
        "current_value": total_current_value,
        "profit_loss": total_current_value - total_invested,
        "investments": investments
    }

def update_investment(db, investment_id, user_id, data):

    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == user_id
    ).first()

    if not investment:
        return None

    if data.asset_type is not None:
        investment.asset_type = data.asset_type

    if data.symbol is not None:
        investment.symbol = data.symbol

    if data.units is not None:
        investment.units = data.units

    if data.avg_buy_price is not None:
        investment.avg_buy_price = data.avg_buy_price

    # recalculate cost basis if units or price changed
    if data.units is not None or data.avg_buy_price is not None:
        investment.cost_basis = investment.units * investment.avg_buy_price

    db.commit()
    db.refresh(investment)

    return investment

def delete_investment(db, investment_id, user_id):

    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == user_id
    ).first()

    if not investment:
        return False

    db.delete(investment)
    db.commit()

    return True

def get_portfolio_analytics_data(db, user_id):
    # Re-use the summary logic to get fresh totals
    summary = get_portfolio_summary(db, user_id)
    investments = summary["investments"]

    # Calculate raw allocation for Recharts (Frontend needs numbers, not just %)
    allocation_raw = {}
    for inv in investments:
        allocation_raw[inv.asset_type] = allocation_raw.get(inv.asset_type, 0) + inv.current_value

    return {
        "total_invested": summary["total_invested"],
        "current_value": summary["current_value"],
        "profit_loss": summary["profit_loss"],
        "allocation": allocation_raw  # Send raw values so Recharts works perfectly
    }