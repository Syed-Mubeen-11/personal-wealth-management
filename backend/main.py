import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

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
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
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
        risk_profile=user.risk_profile 
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

# --- PROFILE & RISK MANAGEMENT ROUTES ---
@app.get("/api/profile-risk")
def get_profile_risk(current_user: models.User = Depends(get_current_user)):
    """Get user profile and risk settings"""
    return {
        "id": current_user.id,
        "full_name": current_user.name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "residential_address": current_user.residential_address,
        "date_of_birth": current_user.date_of_birth.isoformat() if current_user.date_of_birth else None,
        "risk_profile": current_user.risk_profile.value if hasattr(current_user.risk_profile, 'value') else (current_user.risk_profile or "moderate"),
        "kyc_status": current_user.kyc_status.value if hasattr(current_user.kyc_status, 'value') else (current_user.kyc_status or "pending")
    }

@app.put("/api/profile-risk")
def update_profile_risk(
    update_data: schemas.ProfileRiskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update user profile and risk settings"""
    data = update_data.dict(exclude_unset=True)
    
    # Map full_name to name field in database
    if 'full_name' in data:
        current_user.name = data['full_name']
    
    if 'email' in data and data['email']:
        # Check if email is already taken by another user
        existing = db.query(models.User).filter(
            models.User.email == data['email'],
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = data['email']
    
    if 'phone_number' in data:
        current_user.phone_number = data['phone_number']
    
    if 'residential_address' in data:
        current_user.residential_address = data['residential_address']
    
    if 'date_of_birth' in data and data['date_of_birth']:
        from datetime import datetime as dt
        try:
            current_user.date_of_birth = dt.strptime(data['date_of_birth'], "%Y-%m-%d").date()
        except ValueError:
            pass
    
    if 'risk_profile' in data and data['risk_profile']:
        risk_value = data['risk_profile'].lower()
        if risk_value in ['conservative', 'moderate', 'aggressive']:
            current_user.risk_profile = risk_value
    
    if 'kyc_status' in data and data['kyc_status']:
        kyc_value = data['kyc_status'].lower()
        if kyc_value in ['completed', 'pending', 'verified', 'unverified']:
            # Map completed/pending to verified/unverified for DB enum
            if kyc_value == 'completed':
                current_user.kyc_status = 'verified'
            elif kyc_value == 'pending':
                current_user.kyc_status = 'unverified'
            else:
                current_user.kyc_status = kyc_value
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.id,
        "full_name": current_user.name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "residential_address": current_user.residential_address,
        "date_of_birth": current_user.date_of_birth.isoformat() if current_user.date_of_birth else None,
        "risk_profile": current_user.risk_profile.value if hasattr(current_user.risk_profile, 'value') else current_user.risk_profile,
        "kyc_status": "completed" if (current_user.kyc_status == "verified" or (hasattr(current_user.kyc_status, 'value') and current_user.kyc_status.value == "verified")) else "pending"
    }

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


@app.get("/transactions/paginated", response_model=schemas.PaginatedTransactionsResponse)
def get_paginated_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=100),
    search: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    """Get paginated, searchable, filterable transaction history"""
    query = db.query(models.Transaction).filter(models.Transaction.owner_id == user.id)
    
    # Apply search filter
    if search:
        query = query.filter(models.Transaction.asset_symbol.ilike(f"%{search}%"))
    
    # Apply type filter
    if transaction_type:
        query = query.filter(models.Transaction.transaction_type == transaction_type)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    if sort_by == "date":
        query = query.order_by(models.Transaction.date.desc() if sort_order == "desc" else models.Transaction.date.asc())
    elif sort_by == "amount":
        query = query.order_by(models.Transaction.amount.desc() if sort_order == "desc" else models.Transaction.amount.asc())
    
    # Apply pagination
    offset = (page - 1) * limit
    transactions = query.offset(offset).limit(limit).all()
    
    total_pages = (total + limit - 1) // limit  # Ceiling division
    
    return {
        "total_transactions": total,
        "current_page": page,
        "total_pages": total_pages,
        "per_page": limit,
        "data": transactions
    }


# ---------------------------------------------------------
# PORTFOLIO (Live Calculation)
# ---------------------------------------------------------

# Company name lookup dictionary
COMPANY_NAMES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corp.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "TSLA": "Tesla Inc.",
    "META": "Meta Platforms Inc.",
    "NVDA": "NVIDIA Corp.",
    "JPM": "JPMorgan Chase & Co.",
    "V": "Visa Inc.",
    "JNJ": "Johnson & Johnson",
    "WMT": "Walmart Inc.",
    "PG": "Procter & Gamble Co.",
    "MA": "Mastercard Inc.",
    "UNH": "UnitedHealth Group Inc.",
    "HD": "Home Depot Inc.",
    "DIS": "Walt Disney Co.",
    "PYPL": "PayPal Holdings Inc.",
    "NFLX": "Netflix Inc.",
    "ADBE": "Adobe Inc.",
    "CRM": "Salesforce Inc.",
    "BND": "Vanguard Total Bond ETF",
    "VTI": "Vanguard Total Stock ETF",
    "QQQ": "Invesco QQQ Trust",
    "SPY": "SPDR S&P 500 ETF",
}

# Asset allocation colors (matching target UI)
ALLOCATION_COLORS = {
    "Stock": "#0D9488",      # Dark Teal
    "ETF": "#F97316",        # Coral/Orange
    "Bond": "#EAB308",       # Gold
    "Crypto": "#5EEAD4",     # Light Teal
    "Cash": "#14B8A6",       # Teal
    "Other": "#6366F1",      # Indigo
}


def get_company_name(symbol: str) -> str:
    """Get company name from lookup or fetch from yfinance"""
    symbol = symbol.upper()
    if symbol in COMPANY_NAMES:
        return COMPANY_NAMES[symbol]
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return info.get('longName', info.get('shortName', symbol))
    except:
        return symbol


@app.get("/portfolio/overview", response_model=schemas.PortfolioOverviewResponse)
def get_portfolio_overview(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """
    Get aggregated portfolio overview with metrics and asset allocation chart data.
    Returns pre-calculated values for the dashboard cards and donut chart.
    """
    assets = db.query(models.Asset).filter(models.Asset.owner_id == user.id).all()
    
    total_cost_basis = 0
    total_portfolio_value = 0
    performance_today = 0
    
    # Asset allocation aggregation
    allocation_by_class = {}
    
    for asset in assets:
        # Fetch live price and previous close from yfinance
        try:
            ticker = yf.Ticker(asset.symbol)
            history = ticker.history(period="2d")
            if len(history) >= 2:
                current_price = float(history['Close'].iloc[-1])
                prev_close = float(history['Close'].iloc[-2])
            elif len(history) == 1:
                current_price = float(history['Close'].iloc[-1])
                prev_close = current_price
            else:
                current_price = asset.buy_price
                prev_close = asset.buy_price
        except Exception:
            current_price = asset.buy_price
            prev_close = asset.buy_price
        
        cost_basis = asset.quantity * asset.buy_price
        market_value = asset.quantity * current_price
        today_change = (current_price - prev_close) * asset.quantity
        
        total_cost_basis += cost_basis
        total_portfolio_value += market_value
        performance_today += today_change
        
        # Aggregate by asset class
        asset_class = asset.asset_class or "Stock"
        if asset_class not in allocation_by_class:
            allocation_by_class[asset_class] = 0
        allocation_by_class[asset_class] += market_value
    
    # Calculate percentages and build chart data
    labels = []
    values = []
    percentages = []
    colors = []
    
    for asset_class, value in allocation_by_class.items():
        labels.append(asset_class)
        values.append(round(value, 2))
        pct = (value / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
        percentages.append(round(pct, 2))
        colors.append(ALLOCATION_COLORS.get(asset_class, "#6366F1"))
    
    overall_gain_loss = total_portfolio_value - total_cost_basis
    overall_gain_loss_percent = (overall_gain_loss / total_cost_basis * 100) if total_cost_basis > 0 else 0
    performance_today_percent = (performance_today / (total_portfolio_value - performance_today) * 100) if (total_portfolio_value - performance_today) > 0 else 0
    
    return {
        "total_portfolio_value": round(total_portfolio_value, 2),
        "total_cost_basis": round(total_cost_basis, 2),
        "performance_today": round(performance_today, 2),
        "performance_today_percent": round(performance_today_percent, 2),
        "overall_gain_loss": round(overall_gain_loss, 2),
        "overall_gain_loss_percent": round(overall_gain_loss_percent, 2),
        "asset_allocation": {
            "labels": labels,
            "values": values,
            "percentages": percentages,
            "colors": colors
        }
    }


@app.get("/portfolio/positions", response_model=schemas.PaginatedPositionsResponse)
def get_portfolio_positions(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=100),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    """Get paginated current positions with live prices"""
    query = db.query(models.Asset).filter(models.Asset.owner_id == user.id)
    
    total = query.count()
    offset = (page - 1) * limit
    assets = query.offset(offset).limit(limit).all()
    
    positions = []
    for asset in assets:
        try:
            ticker = yf.Ticker(asset.symbol)
            history = ticker.history(period="1d")
            current_price = float(history['Close'].iloc[-1]) if not history.empty else asset.buy_price
        except Exception:
            current_price = asset.buy_price
        
        cost_basis = asset.quantity * asset.buy_price
        market_value = asset.quantity * current_price
        gain_loss = market_value - cost_basis
        gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0
        
        company_name = asset.company_name or get_company_name(asset.symbol)
        
        positions.append({
            "symbol": asset.symbol,
            "company_name": company_name,
            "units": asset.quantity,
            "avg_buy_price": round(asset.buy_price, 2),
            "current_price": round(current_price, 2),
            "market_value": round(market_value, 2),
            "gain_loss": round(gain_loss, 2),
            "gain_loss_percent": round(gain_loss_percent, 2)
        })
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "total_positions": total,
        "current_page": page,
        "total_pages": total_pages,
        "per_page": limit,
        "data": positions
    }


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
    performance_today = 0

    for asset in assets:
        # Fetch live price from yfinance
        try:
            ticker = yf.Ticker(asset.symbol)
            history = ticker.history(period="2d")
            if len(history) >= 2:
                current_price = float(history['Close'].iloc[-1])
                prev_close = float(history['Close'].iloc[-2])
            elif len(history) == 1:
                current_price = float(history['Close'].iloc[-1])
                prev_close = current_price
            else:
                current_price = asset.buy_price
                prev_close = asset.buy_price
        except Exception:
            current_price = asset.buy_price
            prev_close = asset.buy_price

        cost_basis = asset.quantity * asset.buy_price
        market_value = asset.quantity * current_price
        gain_loss = market_value - cost_basis
        gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0
        today_change = (current_price - prev_close) * asset.quantity
        
        company_name = asset.company_name or get_company_name(asset.symbol)

        positions.append({
            "symbol": asset.symbol,
            "company_name": company_name,
            "units": asset.quantity,
            "avg_buy_price": round(asset.buy_price, 2),
            "current_price": round(current_price, 2),
            "market_value": round(market_value, 2),
            "gain_loss": round(gain_loss, 2),
            "gain_loss_percent": round(gain_loss_percent, 2)
        })

        total_cost_basis += cost_basis
        total_portfolio_value += market_value
        performance_today += today_change

    overall_gain_loss = total_portfolio_value - total_cost_basis
    overall_gain_loss_percent = (overall_gain_loss / total_cost_basis * 100) if total_cost_basis > 0 else 0
    performance_today_percent = (performance_today / (total_portfolio_value - performance_today) * 100) if (total_portfolio_value - performance_today) > 0 else 0

    return {
        "positions": positions,
        "overview": {
            "total_cost_basis": round(total_cost_basis, 2),
            "total_portfolio_value": round(total_portfolio_value, 2),
            "overall_gain_loss": round(overall_gain_loss, 2),
            "overall_gain_loss_percent": round(overall_gain_loss_percent, 2),
            "performance_today": round(performance_today, 2),
            "performance_today_percent": round(performance_today_percent, 2)
        }
    }


# Legacy endpoint for backward compatibility with frontend
@app.post("/assets")
def buy_asset(asset: AssetCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Legacy endpoint - creates asset and transaction record"""
    # Get company name
    company_name = get_company_name(asset.symbol)
    
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
        if not existing_asset.company_name:
            existing_asset.company_name = company_name
        db_asset = existing_asset
    else:
        db_asset = models.Asset(
            symbol=asset.symbol.upper(),
            company_name=company_name,
            asset_class="Stock",
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
# ---------------------------------------------------------
# GOALS CRUD
# ---------------------------------------------------------

@app.post("/goals")
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    target_date_parsed = None
    if goal.target_date:
        try:
            target_date_parsed = datetime.strptime(goal.target_date, "%Y-%m-%d").date()
        except ValueError:
            pass
    
    db_goal = models.Goal(
        user_id=1,  # Hardcoded for testing - replace with current_user.id
        goal_name=goal.goal_name,
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        target_date=target_date_parsed,
        monthly_contribution=goal.monthly_contribution,
        status=goal.status
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return {
        "id": db_goal.id,
        "user_id": db_goal.user_id,
        "goal_name": db_goal.goal_name,
        "goal_type": db_goal.goal_type.value if hasattr(db_goal.goal_type, 'value') else db_goal.goal_type,
        "target_amount": db_goal.target_amount,
        "target_date": db_goal.target_date.isoformat() if db_goal.target_date else None,
        "monthly_contribution": db_goal.monthly_contribution,
        "status": db_goal.status.value if hasattr(db_goal.status, 'value') else db_goal.status,
        "created_at": db_goal.created_at.isoformat() if db_goal.created_at else None
    }


@app.get("/goals")
def get_goals(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated goals with optional search and filters"""
    query = db.query(models.Goal)
    
    # Apply search filter on goal_name
    if search:
        query = query.filter(models.Goal.goal_name.ilike(f"%{search}%"))
    
    # Apply status filter
    if status:
        query = query.filter(models.Goal.status == status)
    
    # Apply type filter
    if type:
        query = query.filter(models.Goal.goal_type == type)
    
    # Get total count for pagination
    total_count = query.count()
    total_pages = max(1, (total_count + limit - 1) // limit)
    
    # Apply pagination
    offset = (page - 1) * limit
    goals = query.offset(offset).limit(limit).all()
    
    # Format response
    goals_data = []
    for goal in goals:
        goals_data.append({
            "id": goal.id,
            "user_id": goal.user_id,
            "goal_name": goal.goal_name,
            "goal_type": goal.goal_type.value if hasattr(goal.goal_type, 'value') else goal.goal_type,
            "target_amount": goal.target_amount,
            "target_date": goal.target_date.isoformat() if goal.target_date else None,
            "monthly_contribution": goal.monthly_contribution,
            "status": goal.status.value if hasattr(goal.status, 'value') else goal.status,
            "created_at": goal.created_at.isoformat() if goal.created_at else None
        })
    
    return {
        "data": goals_data,
        "total_pages": total_pages,
        "current_page": page
    }


@app.get("/goals/{goal_id}")
def get_single_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "goal_name": goal.goal_name,
        "goal_type": goal.goal_type.value if hasattr(goal.goal_type, 'value') else goal.goal_type,
        "target_amount": goal.target_amount,
        "target_date": goal.target_date.isoformat() if goal.target_date else None,
        "monthly_contribution": goal.monthly_contribution,
        "status": goal.status.value if hasattr(goal.status, 'value') else goal.status,
        "created_at": goal.created_at.isoformat() if goal.created_at else None
    }


@app.put("/goals/{goal_id}")
def update_goal(goal_id: int, goal_update: schemas.GoalUpdate, db: Session = Depends(get_db)):
    from datetime import datetime
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Update only provided fields
    if goal_update.goal_name is not None:
        goal.goal_name = goal_update.goal_name
    if goal_update.goal_type is not None:
        goal.goal_type = goal_update.goal_type
    if goal_update.target_amount is not None:
        goal.target_amount = goal_update.target_amount
    if goal_update.target_date is not None:
        try:
            goal.target_date = datetime.strptime(goal_update.target_date, "%Y-%m-%d").date()
        except ValueError:
            pass
    if goal_update.monthly_contribution is not None:
        goal.monthly_contribution = goal_update.monthly_contribution
    if goal_update.status is not None:
        goal.status = goal_update.status
    
    db.commit()
    db.refresh(goal)
    
    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "goal_name": goal.goal_name,
        "goal_type": goal.goal_type.value if hasattr(goal.goal_type, 'value') else goal.goal_type,
        "target_amount": goal.target_amount,
        "target_date": goal.target_date.isoformat() if goal.target_date else None,
        "monthly_contribution": goal.monthly_contribution,
        "status": goal.status.value if hasattr(goal.status, 'value') else goal.status,
        "created_at": goal.created_at.isoformat() if goal.created_at else None
    }


@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}


# ---------------------------------------------------------
# PRICE REFRESH TASKS (Background Jobs)
# ---------------------------------------------------------
from app.services.tasks import refresh_all_asset_prices, refresh_user_assets, refresh_asset_price


@app.post("/api/refresh/all")
def trigger_full_price_refresh():
    """
    Trigger a full price refresh for all assets in the database.
    This is the same task that runs nightly via Celery Beat.
    Returns task_id to track progress.
    """
    task = refresh_all_asset_prices.delay()
    return {
        "message": "Price refresh task started",
        "task_id": task.id,
        "status_url": f"/api/refresh/status/{task.id}"
    }


@app.post("/api/refresh/user")
def trigger_user_price_refresh(current_user: models.User = Depends(get_current_user)):
    """
    Trigger price refresh for current user's assets only.
    Returns task_id to track progress.
    """
    task = refresh_user_assets.delay(current_user.id)
    return {
        "message": f"Price refresh for user {current_user.id} started",
        "task_id": task.id,
        "status_url": f"/api/refresh/status/{task.id}"
    }


@app.post("/api/refresh/asset/{asset_id}")
def trigger_single_asset_refresh(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Trigger price refresh for a single asset.
    User must own the asset.
    """
    asset = db.query(models.Asset).filter(
        models.Asset.id == asset_id,
        models.Asset.owner_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found or not owned by user")
    
    task = refresh_asset_price.delay(asset_id)
    return {
        "message": f"Price refresh for {asset.symbol} started",
        "task_id": task.id,
        "status_url": f"/api/refresh/status/{task.id}"
    }


@app.get("/api/refresh/status/{task_id}")
def get_refresh_task_status(task_id: str):
    """
    Check the status of a price refresh task.
    Returns task state and result if completed.
    """
    result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "state": result.state,
    }
    
    if result.state == 'SUCCESS':
        response["result"] = result.result
    elif result.state == 'FAILURE':
        response["error"] = str(result.result)
    elif result.state == 'PENDING':
        response["message"] = "Task is pending execution"
    elif result.state == 'STARTED':
        response["message"] = "Task is currently running"
    
    return response


@app.get("/api/assets/prices")
def get_assets_with_prices(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get all user assets with their cached price data.
    Returns last_price, current_value, and last_price_at for each asset.
    """
    assets = db.query(models.Asset).filter(
        models.Asset.owner_id == current_user.id
    ).all()
    
    return [
        {
            "id": asset.id,
            "symbol": asset.symbol,
            "company_name": asset.company_name,
            "quantity": asset.quantity,
            "buy_price": asset.buy_price,
            "last_price": asset.last_price,
            "current_value": asset.current_value,
            "last_price_at": asset.last_price_at.isoformat() if asset.last_price_at else None
        }
        for asset in assets
    ]


# ---------------------------------------------------------
# SIMULATION LOGIC & CALCULATIONS (Math Engine)
# ---------------------------------------------------------

def calculate_sip(monthly_investment: float, years: int, annual_rate: float) -> dict:
    """
    SIP Calculator - Calculates future value with monthly compounding
    
    Formula: FV = P × [(1 + r)^n – 1] / r × (1 + r)
    Where: P = Monthly investment, r = Monthly rate, n = Total months
    """
    monthly_rate = annual_rate / 100 / 12
    total_months = years * 12
    
    total_invested = 0
    total_value = 0
    yearly_projections = []
    
    for year in range(1, years + 1):
        for month in range(12):
            total_invested += monthly_investment
            total_value += monthly_investment
            total_value *= (1 + monthly_rate)
        
        yearly_projections.append({
            "year": year,
            "invested_amount": round(total_invested, 2),
            "interest_earned": round(total_value - total_invested, 2),
            "total_value": round(total_value, 2)
        })
    
    return {
        "total_invested": round(total_invested, 2),
        "estimated_returns": round(total_value - total_invested, 2),
        "total_value": round(total_value, 2),
        "annual_return_rate": annual_rate,
        "yearly_projections": yearly_projections
    }


def calculate_retirement(
    current_age: int,
    retirement_age: int,
    current_savings: float,
    monthly_contribution: float,
    pre_retirement_rate: float,
    post_retirement_rate: float,
    inflation_rate: float,
    monthly_expense: float
) -> dict:
    """
    Retirement Planning Calculator
    
    Calculates:
    1. Corpus at retirement
    2. Inflation-adjusted expenses
    3. How long the corpus will last
    """
    years_until_retirement = retirement_age - current_age
    monthly_rate = pre_retirement_rate / 100 / 12
    
    # Calculate corpus at retirement
    corpus = current_savings
    total_invested = current_savings
    yearly_projections = []
    
    for year in range(1, years_until_retirement + 1):
        for _ in range(12):
            corpus += monthly_contribution
            corpus *= (1 + monthly_rate)
            total_invested += monthly_contribution
        
        yearly_projections.append({
            "age": current_age + year,
            "year": year,
            "invested": round(total_invested, 2),
            "corpus": round(corpus, 2),
            "phase": "accumulation"
        })
    
    corpus_at_retirement = corpus
    
    # Calculate inflation-adjusted monthly expense at retirement
    inflation_multiplier = (1 + inflation_rate / 100) ** years_until_retirement
    inflation_adjusted_expense = monthly_expense * inflation_multiplier
    
    # Calculate how long corpus lasts in retirement
    post_monthly_rate = post_retirement_rate / 100 / 12
    post_inflation_monthly = inflation_rate / 100 / 12
    
    retirement_corpus = corpus_at_retirement
    age = retirement_age
    current_expense = inflation_adjusted_expense
    
    while retirement_corpus > 0 and age < 120:
        for month in range(12):
            retirement_corpus *= (1 + post_monthly_rate)
            retirement_corpus -= current_expense
            current_expense *= (1 + post_inflation_monthly)  # Expense grows with inflation
            
            if retirement_corpus <= 0:
                break
        
        if retirement_corpus > 0:
            age += 1
            yearly_projections.append({
                "age": age,
                "year": age - current_age,
                "corpus": round(max(0, retirement_corpus), 2),
                "annual_expense": round(current_expense * 12, 2),
                "phase": "retirement"
            })
    
    # Calculate monthly income from corpus
    # Using 4% safe withdrawal rate
    monthly_income = corpus_at_retirement * 0.04 / 12
    
    return {
        "years_until_retirement": years_until_retirement,
        "corpus_at_retirement": round(corpus_at_retirement, 2),
        "total_invested": round(total_invested, 2),
        "total_returns": round(corpus_at_retirement - total_invested, 2),
        "monthly_income_at_retirement": round(monthly_income, 2),
        "corpus_lasts_until_age": age,
        "inflation_adjusted_expense": round(inflation_adjusted_expense, 2),
        "yearly_projections": yearly_projections
    }


def calculate_loan_payoff(
    principal: float,
    annual_rate: float,
    term_months: int,
    extra_payment: float = 0
) -> dict:
    """
    Loan Payoff Calculator with amortization schedule
    
    Calculates:
    1. Monthly EMI
    2. Total interest paid
    3. Savings from extra payments
    4. Amortization schedule
    """
    monthly_rate = annual_rate / 100 / 12
    
    # Calculate standard EMI using formula: EMI = P × r × (1 + r)^n / ((1 + r)^n – 1)
    if monthly_rate > 0:
        emi = principal * monthly_rate * ((1 + monthly_rate) ** term_months) / (((1 + monthly_rate) ** term_months) - 1)
    else:
        emi = principal / term_months
    
    # Standard payoff (without extra payment)
    standard_total = emi * term_months
    standard_interest = standard_total - principal
    
    # Calculate with extra payment
    balance = principal
    total_paid = 0
    total_interest = 0
    months_paid = 0
    amortization = []
    
    while balance > 0 and months_paid < term_months * 2:  # Safety limit
        months_paid += 1
        interest_payment = balance * monthly_rate
        principal_payment = min(emi - interest_payment + extra_payment, balance)
        actual_payment = interest_payment + principal_payment
        
        balance -= principal_payment
        total_paid += actual_payment
        total_interest += interest_payment
        
        # Add to amortization (monthly for first year, then yearly summaries)
        if months_paid <= 12 or months_paid % 12 == 0:
            amortization.append({
                "month": months_paid,
                "payment": round(actual_payment, 2),
                "principal": round(principal_payment, 2),
                "interest": round(interest_payment, 2),
                "balance": round(max(0, balance), 2)
            })
        
        if balance <= 0:
            break
    
    # Calculate savings
    interest_saved = standard_interest - total_interest
    months_saved = term_months - months_paid
    
    # Calculate payoff date
    from datetime import datetime
    from dateutil.relativedelta import relativedelta
    payoff_date = datetime.now() + relativedelta(months=months_paid)
    
    return {
        "monthly_payment": round(emi + extra_payment, 2),
        "total_payment": round(total_paid, 2),
        "total_interest": round(total_interest, 2),
        "payoff_months": months_paid,
        "payoff_date": payoff_date.strftime("%B %Y"),
        "interest_saved_with_extra": round(max(0, interest_saved), 2),
        "months_saved_with_extra": max(0, months_saved),
        "amortization_schedule": amortization
    }


def calculate_goal_projection(
    target_amount: float,
    current_savings: float,
    monthly_contribution: float,
    annual_rate: float,
    target_years: int = None
) -> dict:
    """
    Goal-based projection calculator
    
    Calculates:
    1. Projected value over time
    2. Whether goal is achievable
    3. Required monthly contribution to meet goal
    """
    monthly_rate = annual_rate / 100 / 12
    
    # If target_years provided, calculate if achievable
    if target_years:
        total_months = target_years * 12
        
        # Calculate projected value
        value = current_savings
        total_invested = current_savings
        yearly_projections = []
        
        for year in range(1, target_years + 1):
            for _ in range(12):
                value += monthly_contribution
                value *= (1 + monthly_rate)
                total_invested += monthly_contribution
            
            yearly_projections.append({
                "year": year,
                "invested_amount": round(total_invested, 2),
                "interest_earned": round(value - total_invested, 2),
                "total_value": round(value, 2)
            })
        
        projected_value = value
        is_achievable = projected_value >= target_amount
        shortfall_or_surplus = projected_value - target_amount
        
        # Calculate required monthly contribution to meet goal
        if current_savings >= target_amount:
            required_monthly = 0
        else:
            needed = target_amount - current_savings * ((1 + monthly_rate) ** total_months)
            if monthly_rate > 0:
                required_monthly = needed * monthly_rate / (((1 + monthly_rate) ** total_months) - 1)
            else:
                required_monthly = needed / total_months
        
        return {
            "target_amount": target_amount,
            "projected_value": round(projected_value, 2),
            "is_achievable": is_achievable,
            "shortfall_or_surplus": round(shortfall_or_surplus, 2),
            "months_to_goal": target_years * 12 if is_achievable else None,
            "required_monthly_contribution": round(max(0, required_monthly), 2),
            "yearly_projections": yearly_projections
        }
    else:
        # Calculate months needed to reach goal
        value = current_savings
        months = 0
        yearly_projections = []
        total_invested = current_savings
        
        while value < target_amount and months < 600:  # Max 50 years
            value += monthly_contribution
            value *= (1 + monthly_rate)
            total_invested += monthly_contribution
            months += 1
            
            if months % 12 == 0:
                yearly_projections.append({
                    "year": months // 12,
                    "invested_amount": round(total_invested, 2),
                    "interest_earned": round(value - total_invested, 2),
                    "total_value": round(value, 2)
                })
        
        return {
            "target_amount": target_amount,
            "projected_value": round(value, 2),
            "is_achievable": value >= target_amount,
            "shortfall_or_surplus": round(value - target_amount, 2),
            "months_to_goal": months if value >= target_amount else None,
            "required_monthly_contribution": monthly_contribution,
            "yearly_projections": yearly_projections
        }


# ---------------------------------------------------------
# SIMULATION API ENDPOINTS
# ---------------------------------------------------------

@app.post("/api/simulations/sip", response_model=schemas.SimulationResponse)
def run_sip_simulation(
    request: schemas.SIPSimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Run SIP (Systematic Investment Plan) simulation and save results.
    
    Calculates future value based on monthly investments with compound interest.
    """
    # Run calculation
    results = calculate_sip(
        monthly_investment=request.monthly_investment,
        years=request.years,
        annual_rate=request.expected_return_rate
    )
    
    # Prepare assumptions
    assumptions = {
        "type": "sip",
        "monthly_investment": request.monthly_investment,
        "years": request.years,
        "expected_return_rate": request.expected_return_rate
    }
    
    # Save to database
    simulation = models.Simulation(
        user_id=current_user.id,
        goal_id=request.goal_id,
        scenario_name=request.scenario_name,
        assumptions=assumptions,
        results=results
    )
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    
    return simulation


@app.post("/api/simulations/retirement", response_model=schemas.SimulationResponse)
def run_retirement_simulation(
    request: schemas.RetirementSimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Run retirement planning simulation and save results.
    
    Calculates corpus at retirement and how long it will last.
    """
    results = calculate_retirement(
        current_age=request.current_age,
        retirement_age=request.retirement_age,
        current_savings=request.current_savings,
        monthly_contribution=request.monthly_contribution,
        pre_retirement_rate=request.expected_return_rate,
        post_retirement_rate=request.post_retirement_return_rate,
        inflation_rate=request.inflation_rate,
        monthly_expense=request.monthly_expense_at_retirement
    )
    
    assumptions = {
        "type": "retirement",
        "current_age": request.current_age,
        "retirement_age": request.retirement_age,
        "current_savings": request.current_savings,
        "monthly_contribution": request.monthly_contribution,
        "expected_return_rate": request.expected_return_rate,
        "post_retirement_return_rate": request.post_retirement_return_rate,
        "inflation_rate": request.inflation_rate,
        "monthly_expense_at_retirement": request.monthly_expense_at_retirement
    }
    
    simulation = models.Simulation(
        user_id=current_user.id,
        goal_id=request.goal_id,
        scenario_name=request.scenario_name,
        assumptions=assumptions,
        results=results
    )
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    
    return simulation


@app.post("/api/simulations/loan", response_model=schemas.SimulationResponse)
def run_loan_simulation(
    request: schemas.LoanPayoffSimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Run loan payoff simulation and save results.
    
    Calculates EMI, total interest, and payoff schedule.
    """
    results = calculate_loan_payoff(
        principal=request.principal,
        annual_rate=request.annual_interest_rate,
        term_months=request.loan_term_months,
        extra_payment=request.extra_monthly_payment
    )
    
    assumptions = {
        "type": "loan",
        "principal": request.principal,
        "annual_interest_rate": request.annual_interest_rate,
        "loan_term_months": request.loan_term_months,
        "extra_monthly_payment": request.extra_monthly_payment
    }
    
    simulation = models.Simulation(
        user_id=current_user.id,
        goal_id=request.goal_id,
        scenario_name=request.scenario_name,
        assumptions=assumptions,
        results=results
    )
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    
    return simulation


@app.post("/api/simulations/goal", response_model=schemas.SimulationResponse)
def run_goal_simulation(
    request: schemas.GoalSimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Run goal-based projection simulation and save results.
    
    Calculates if a goal is achievable and what's needed to reach it.
    """
    results = calculate_goal_projection(
        target_amount=request.target_amount,
        current_savings=request.current_savings,
        monthly_contribution=request.monthly_contribution,
        annual_rate=request.expected_return_rate,
        target_years=request.target_years
    )
    
    assumptions = {
        "type": "goal",
        "target_amount": request.target_amount,
        "current_savings": request.current_savings,
        "monthly_contribution": request.monthly_contribution,
        "expected_return_rate": request.expected_return_rate,
        "target_years": request.target_years
    }
    
    simulation = models.Simulation(
        user_id=current_user.id,
        goal_id=request.goal_id,
        scenario_name=request.scenario_name,
        assumptions=assumptions,
        results=results
    )
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    
    return simulation


@app.post("/api/simulations/calculate/sip")
def calculate_sip_only(request: schemas.SIPSimulationRequest):
    """
    Calculate SIP without saving to database.
    Useful for quick calculations and previews.
    """
    return calculate_sip(
        monthly_investment=request.monthly_investment,
        years=request.years,
        annual_rate=request.expected_return_rate
    )


@app.post("/api/simulations/calculate/retirement")
def calculate_retirement_only(request: schemas.RetirementSimulationRequest):
    """
    Calculate retirement planning without saving to database.
    """
    return calculate_retirement(
        current_age=request.current_age,
        retirement_age=request.retirement_age,
        current_savings=request.current_savings,
        monthly_contribution=request.monthly_contribution,
        pre_retirement_rate=request.expected_return_rate,
        post_retirement_rate=request.post_retirement_return_rate,
        inflation_rate=request.inflation_rate,
        monthly_expense=request.monthly_expense_at_retirement
    )


@app.post("/api/simulations/calculate/loan")
def calculate_loan_only(request: schemas.LoanPayoffSimulationRequest):
    """
    Calculate loan payoff without saving to database.
    """
    return calculate_loan_payoff(
        principal=request.principal,
        annual_rate=request.annual_interest_rate,
        term_months=request.loan_term_months,
        extra_payment=request.extra_monthly_payment
    )


@app.post("/api/simulations/calculate/goal")
def calculate_goal_only(request: schemas.GoalSimulationRequest):
    """
    Calculate goal projection without saving to database.
    """
    return calculate_goal_projection(
        target_amount=request.target_amount,
        current_savings=request.current_savings,
        monthly_contribution=request.monthly_contribution,
        annual_rate=request.expected_return_rate,
        target_years=request.target_years
    )


@app.get("/api/simulations", response_model=schemas.PaginatedSimulationsResponse)
def get_user_simulations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    scenario_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get paginated list of user's saved simulations.
    Optionally filter by scenario type (sip, retirement, loan, goal).
    """
    query = db.query(models.Simulation).filter(
        models.Simulation.user_id == current_user.id
    )
    
    if scenario_type:
        # Filter by type stored in assumptions JSON
        query = query.filter(
            models.Simulation.assumptions["type"].astext == scenario_type
        )
    
    total = query.count()
    total_pages = (total + limit - 1) // limit
    
    simulations = query.order_by(
        models.Simulation.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": simulations,
        "total": total,
        "current_page": page,
        "total_pages": total_pages
    }


@app.get("/api/simulations/{simulation_id}", response_model=schemas.SimulationResponse)
def get_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific simulation by ID."""
    simulation = db.query(models.Simulation).filter(
        models.Simulation.id == simulation_id,
        models.Simulation.user_id == current_user.id
    ).first()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    return simulation


@app.delete("/api/simulations/{simulation_id}")
def delete_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a saved simulation."""
    simulation = db.query(models.Simulation).filter(
        models.Simulation.id == simulation_id,
        models.Simulation.user_id == current_user.id
    ).first()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    db.delete(simulation)
    db.commit()
    
    return {"message": "Simulation deleted successfully"}

@app.post("/api/market-refresh")
def refresh_prices():
    return {"status": "success", "message": "Run: python update_prices.py (Alpha Vantage)"}
