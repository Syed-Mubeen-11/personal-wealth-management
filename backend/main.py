import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from jose import jwt, JWTError
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import requests
from datetime import date

# --- FIXED INTERNAL MODULE IMPORTS ---
import models
import schemas
import crud
from database import engine, SessionLocal

# Assuming security functions are inside your auth.py file now
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    SECRET_KEY, 
    ALGORITHM
)

# Leaving Celery as-is (Assuming these are still inside the app/ subfolder)
from app.core.celery_app import celery_app
from celery.result import AsyncResult
from app.services.tasks import run_simulation_task

# ---------------------------------------------------------
# DATABASE CONFIGURATION
# ---------------------------------------------------------
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ---------------------------------------------------------
# CORS SETTINGS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://localhost:5174",
        
    ],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# SCHEMAS
# ---------------------------------------------------------
class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    risk_profile: Optional[str] = "moderate"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    residential_address: Optional[str] = None
    date_of_birth: Optional[date] = None
    risk_profile: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    phone_number: Optional[str] = None
    residential_address: Optional[str] = None
    date_of_birth: Optional[date] = None
    risk_profile: str = "moderate"
    kyc_status: str = "unverified"
    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    target_name: str
    target_amount: float

class GoalResponse(GoalCreate):
    id: int
    owner_id: int
    percent_complete: float = 0
    current_balance: float = 0
    class Config:
        from_attributes = True

class AssetCreate(BaseModel):
    symbol: str
    quantity: float
    buy_price: float

# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Wealth Backend Running!"}

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email, 
        password=hashed_pw, 
        name=user.name,
        riskprofile=user.risk_profile 
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully", "user": db_user}

@app.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- TEAMMATE'S FEATURE: GITHUB PR FETCH ---
@app.get("/api/github/prs")
def get_prs(owner: str = Query(...), repo: str = Query(...)):
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json()
    raise HTTPException(status_code=resp.status_code, detail="PR fetch failed")

# --- PROFILE ROUTES ---
@app.get("/profile/", response_model=UserProfileResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/profile/", response_model=UserProfileResponse)
def update_profile(profile_update: UserProfileUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

# --- ASSETS & PORTFOLIO ---
@app.get("/stock/{symbol}")
def get_stock_price(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        history = ticker.history(period="1d")
        if history.empty:
             raise HTTPException(status_code=404, detail="Stock symbol not found")
        current_price = history['Close'].iloc[-1]
        return {"symbol": symbol.upper(), "price": round(current_price, 2)}
    except:
        raise HTTPException(status_code=404, detail="Invalid symbol")


# ---------------------------------------------------------
# TRANSACTIONS CRUD
# ---------------------------------------------------------
@app.post("/transactions", response_model=schemas.TransactionResponse)
def create_transaction(
    txn: schemas.TransactionCreate, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    """
    Create a transaction and auto-update portfolio.
    - Buy: Adds to existing asset or creates new one (calculates average cost basis)
    - Sell: Subtracts from asset, deletes if quantity <= 0
    - Contribution/Withdrawal: Just records the cash transaction
    """
    # Create the transaction record
    db_txn = models.Transaction(
        transaction_type=txn.transaction_type,
        asset_symbol=txn.asset_symbol,
        quantity=txn.quantity,
        amount=txn.amount,
        owner_id=user.id
    )
    db.add(db_txn)

    # Handle Buy transactions (update portfolio)
    if txn.transaction_type == "Buy" and txn.asset_symbol and txn.asset_symbol != "Cash":
        existing_asset = db.query(models.Asset).filter(
            models.Asset.owner_id == user.id,
            models.Asset.symbol == txn.asset_symbol.upper()
        ).first()

        if existing_asset:
            # Recalculate average cost basis
            total_old_value = existing_asset.quantity * existing_asset.buy_price
            total_new_value = txn.quantity * (txn.amount / txn.quantity) if txn.quantity else txn.amount
            new_quantity = existing_asset.quantity + txn.quantity
            new_avg_price = (total_old_value + total_new_value) / new_quantity if new_quantity > 0 else 0
            
            existing_asset.quantity = new_quantity
            existing_asset.buy_price = round(new_avg_price, 2)
        else:
            # Create new asset
            buy_price = txn.amount / txn.quantity if txn.quantity else txn.amount
            new_asset = models.Asset(
                symbol=txn.asset_symbol.upper(),
                quantity=txn.quantity,
                buy_price=round(buy_price, 2),
                owner_id=user.id
            )
            db.add(new_asset)

    # Handle Sell transactions (update portfolio)
    elif txn.transaction_type == "Sell" and txn.asset_symbol and txn.asset_symbol != "Cash":
        existing_asset = db.query(models.Asset).filter(
            models.Asset.owner_id == user.id,
            models.Asset.symbol == txn.asset_symbol.upper()
        ).first()

        if existing_asset:
            existing_asset.quantity -= txn.quantity if txn.quantity else 0
            if existing_asset.quantity <= 0:
                db.delete(existing_asset)

    db.commit()
    db.refresh(db_txn)
    return db_txn


@app.get("/transactions", response_model=List[schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Get transaction history for current user, ordered by date descending"""
    transactions = db.query(models.Transaction).filter(
        models.Transaction.owner_id == user.id
    ).order_by(models.Transaction.date.desc()).all()
    return transactions


# ---------------------------------------------------------
# PORTFOLIO (Live Calculation)
# ---------------------------------------------------------
@app.get("/portfolio", response_model=schemas.PortfolioResponse)
def get_portfolio(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """
    Get live portfolio with current market prices.
    Uses yfinance to fetch live prices, falls back to buy_price on error.
    """
    assets = db.query(models.Asset).filter(models.Asset.owner_id == user.id).all()
    
    positions = []
    total_cost_basis = 0
    total_portfolio_value = 0

    for asset in assets:
        # Fetch live price from yfinance
        try:
            ticker = yf.Ticker(asset.symbol)
            history = ticker.history(period="1d")
            current_price = float(history['Close'].iloc[-1]) if not history.empty else asset.buy_price
        except Exception:
            current_price = asset.buy_price

        cost_basis = asset.quantity * asset.buy_price
        market_value = asset.quantity * current_price
        gain_loss = market_value - cost_basis

        positions.append({
            "symbol": asset.symbol,
            "units": asset.quantity,
            "avg_buy_price": round(asset.buy_price, 2),
            "current_price": round(current_price, 2),
            "market_value": round(market_value, 2),
            "gain_loss": round(gain_loss, 2)
        })

        total_cost_basis += cost_basis
        total_portfolio_value += market_value

    return {
        "positions": positions,
        "overview": {
            "total_cost_basis": round(total_cost_basis, 2),
            "total_portfolio_value": round(total_portfolio_value, 2),
            "overall_gain_loss": round(total_portfolio_value - total_cost_basis, 2)
        }
    }


# Legacy endpoint for backward compatibility with frontend
@app.post("/assets")
def buy_asset(asset: AssetCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Legacy endpoint - creates asset and transaction record"""
    # Check if user already owns this asset
    existing_asset = db.query(models.Asset).filter(
        models.Asset.owner_id == user.id,
        models.Asset.symbol == asset.symbol.upper()
    ).first()

    if existing_asset:
        # Recalculate average cost basis
        total_old_value = existing_asset.quantity * existing_asset.buy_price
        total_new_value = asset.quantity * asset.buy_price
        new_quantity = existing_asset.quantity + asset.quantity
        new_avg_price = (total_old_value + total_new_value) / new_quantity
        
        existing_asset.quantity = new_quantity
        existing_asset.buy_price = round(new_avg_price, 2)
        db_asset = existing_asset
    else:
        db_asset = models.Asset(
            symbol=asset.symbol.upper(),
            quantity=asset.quantity,
            buy_price=asset.buy_price,
            owner_id=user.id
        )
        db.add(db_asset)

    # Create transaction record
    total_cost = asset.quantity * asset.buy_price
    db_txn = models.Transaction(
        transaction_type="Buy",
        asset_symbol=asset.symbol.upper(),
        quantity=asset.quantity,
        amount=total_cost,
        owner_id=user.id
    )
    db.add(db_txn)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

# --- GOALS & SIMULATION ---
@app.get("/goals/progress")
def get_goals_progress(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    goals = db.query(models.Goal).filter(models.Goal.owner_id == user.id).all()
    transactions = db.query(models.Transaction).filter(models.Transaction.owner_id == user.id).all()
    
    # Calculate current balance from transactions
    balance = 0
    for t in transactions:
        if t.transaction_type in ["Contribution", "Sell"]:
            balance += abs(t.amount) if t.amount else 0
        elif t.transaction_type in ["Withdrawal", "Buy"]:
            balance -= abs(t.amount) if t.amount else 0
    
    results = []
    for goal in goals:
        progress = (balance / goal.target_amount) * 100 if goal.target_amount > 0 else 0
        results.append({
            "id": goal.id, "owner_id": user.id, "target_name": goal.target_name,
            "target_amount": goal.target_amount, "current_balance": balance,
            "percent_complete": min(round(progress, 2), 100.0)
        })
    return results

@app.post("/goals")
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    db_goal = models.Goal(target_name=goal.target_name, target_amount=goal.target_amount, owner_id=user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.owner_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}

@app.get("/summary")
def get_summary(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Get financial summary based on transactions"""
    transactions = db.query(models.Transaction).filter(models.Transaction.owner_id == user.id).all()
    
    # Calculate income (contributions and sells) and expenses (withdrawals and buys)
    income = 0
    expense = 0
    
    for t in transactions:
        if t.transaction_type in ["Contribution", "Sell"]:
            income += abs(t.amount) if t.amount else 0
        elif t.transaction_type in ["Withdrawal", "Buy"]:
            expense += abs(t.amount) if t.amount else 0
    
    balance = income - expense
    return {"balance": round(balance, 2), "income": round(income, 2), "expense": round(expense, 2)}

@app.get("/recommendations/")
def get_recommendations(risk: str):
    risk = risk.lower()
    if risk in ["conservative", "low"]:
        return [{"symbol": "BND", "name": "Bonds", "allocation": 70}, {"symbol": "VTI", "name": "Stocks", "allocation": 30}]
    elif risk in ["aggressive", "high"]:
        return [{"symbol": "QQQ", "name": "Tech", "allocation": 50}, {"symbol": "BTC", "name": "Crypto", "allocation": 20}]
    return [{"symbol": "VTI", "name": "Stocks", "allocation": 60}, {"symbol": "BND", "name": "Bonds", "allocation": 40}]

@app.post("/simulate/start/")
def start_simulation(monthly_investment: float, years: int):
    task = run_simulation_task.delay(monthly_investment, years, 0.07)
    return {"task_id": task.id}

@app.get("/simulate/result/{task_id}")
def get_simulation_result(task_id: str):
    res = AsyncResult(task_id, app=celery_app)
    if res.state == 'SUCCESS': return {"status": "Completed", "result": res.result}
    return {"status": "Processing..."}