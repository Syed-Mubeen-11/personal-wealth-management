from models.investment_model import Investment


def create_investment(db, user_id, investment):

    cost_basis = investment.units * investment.avg_buy_price

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
    db.commit()
    db.refresh(new_investment)

    return new_investment

def get_portfolio_summary(db, user_id):

    investments = db.query(Investment).filter(
        Investment.user_id == user_id
    ).all()

    total_invested = 0
    total_current_value = 0

    for inv in investments:
        total_invested += inv.cost_basis
        total_current_value += inv.current_value

    profit_loss = total_current_value - total_invested

    return {
        "total_invested": total_invested,
        "current_value": total_current_value,
        "profit_loss": profit_loss,
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

def portfolio_analytics(db, user_id):

    investments = db.query(Investment).filter(
        Investment.user_id == user_id
    ).all()

    total_invested = 0
    total_current_value = 0

    allocation = {}

    for inv in investments:

        total_invested += inv.cost_basis
        total_current_value += inv.current_value

        if inv.asset_type not in allocation:
            allocation[inv.asset_type] = 0

        allocation[inv.asset_type] += inv.current_value

    profit_loss = total_current_value - total_invested

    # convert allocation to percentage
    allocation_percent = {}

    for asset, value in allocation.items():

        allocation_percent[asset] = round(
            (value / total_current_value) * 100, 2
        ) if total_current_value > 0 else 0

    return {
        "total_invested": total_invested,
        "current_value": total_current_value,
        "profit_loss": profit_loss,
        "allocation": allocation_percent
    }