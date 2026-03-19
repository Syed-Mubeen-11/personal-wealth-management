from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import models.models as models
import schemas.schemas as schemas
from core.database import SessionLocal
from core.auth import get_current_user

from models.investment_model import Investment
from models.goal_model import Goal

router = APIRouter(
    prefix="/api",
    tags=["Finance & Dashboard"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- INCOME ROUTES ---

@router.post("/income", response_model=schemas.IncomeResponse)
def add_income(
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_income = models.Income(
        user_id=current_user.id,
        source=income.source,
        amount=income.amount,
        created_at=str(datetime.utcnow())
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income

@router.get("/income", response_model=list[schemas.IncomeResponse])
def get_incomes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Income).filter(models.Income.user_id == current_user.id).all()

@router.delete("/income/{income_id}")
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    income = db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == current_user.id
    ).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()
    return {"message": "Income deleted successfully"}

# --- EXPENSE ROUTES ---

@router.post("/expenses", response_model=schemas.ExpenseResponse)
def add_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_expense = models.Expense(
        user_id=current_user.id,
        category=expense.category,
        amount=expense.amount,
        description=expense.description,
        created_at=str(datetime.utcnow())
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/expenses", response_model=list[schemas.ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Expense).filter(models.Expense.user_id == current_user.id).all()

@router.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id, 
        models.Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense record not found")
        
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

# --- DASHBOARD / ANALYTICS ---

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # -------- Income --------
    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id
    ).scalar() or 0

    # -------- Expenses --------
    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id
    ).scalar() or 0

    savings = total_income - total_expenses

    # -------- Expense Breakdown --------
    expenses_query = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount)
    ).filter(
        models.Expense.user_id == current_user.id
    ).group_by(models.Expense.category).all()

    expense_breakdown = {
        category: amount for category, amount in expenses_query
    }

    # -------- Portfolio --------
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    total_invested = sum(inv.cost_basis for inv in investments)
    # portfolio_value = sum(inv.current_value for inv in investments)
    portfolio_value = sum((inv.current_value or 0) for inv in investments)

    profit_loss = portfolio_value - total_invested

    # -------- Asset Allocation --------
    allocation = {}

    for inv in investments:

        if inv.asset_type not in allocation:
            allocation[inv.asset_type] = 0

        # allocation[inv.asset_type] += inv.current_value
        allocation[inv.asset_type] += (inv.current_value or 0)

    asset_allocation = {}

    for asset, value in allocation.items():

        if portfolio_value > 0:
            asset_allocation[asset] = round(
                (value / portfolio_value) * 100, 2
            )
        else:
            asset_allocation[asset] = 0

    # -------- Goals --------
    goal_count = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).count()

    return {

        "total_income": total_income,
        "total_expenses": total_expenses,
        "savings": savings,

        "portfolio_value": portfolio_value,
        "total_invested": total_invested,
        "profit_loss": profit_loss,

        "goal_count": goal_count,

        "expense_breakdown": expense_breakdown,
        "asset_allocation": asset_allocation
    }