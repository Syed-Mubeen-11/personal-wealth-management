from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from jose import jwt, JWTError
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import date

# --- IMPORTS ---
from app.core.celery_app import celery_app
from celery.result import AsyncResult
from app.services.tasks import run_simulation_task
from app.models import models
from app.core.database import engine, SessionLocal
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    SECRET_KEY, 
    ALGORITHM
)

# ---------------------------------------------------------
# DATABASE CONFIGURATION (REPAIR MODE)
# ---------------------------------------------------------
# This ensures your database columns match your models exactly
#models.Base.metadata.drop_all(bind=engine) 
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ---------------------------------------------------------
# CORS SETTINGS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
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
# SCHEMAS (Corrected to map Frontend -> Backend)
# ---------------------------------------------------------
# Change "full_name" to "name" to match the frontend precisely
class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None      # Changed from full_name to name
    risk_profile: Optional[str] = "moderate"

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email, 
        password=hashed_pw, 
        name=user.name,              # Matches the schema above
        risk_profile=user.risk_profile 
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully", "user": db_user}

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

class TransactionCreate(BaseModel):
    amount: float
    category: str
    description: str

class TransactionResponse(TransactionCreate):
    id: int
    owner_id: int
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

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    
    # CORRECTED: Explicitly mapping 'full_name' and 'risk_profile' to the database
    db_user = models.User(
        email=user.email, 
        password=hashed_pw, 
        name=user.full_name,          # Fixes NULL name
        risk_profile=user.risk_profile # Fixes NULL risk_profile
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully", "email": db_user.email}

@app.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

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

# --- REMAINING ROUTES (STOCKS, ASSETS, GOALS, SIMULATION) ---
# ... (The rest of your existing logic remains the same)

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

@app.post("/assets/")
def buy_asset(asset: AssetCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    db_asset = models.Asset(**asset.dict(), owner_id=user.id)
    db.add(db_asset)
    total_cost = asset.quantity * asset.buy_price
    db_txn = models.Transaction(
        amount=-total_cost, 
        category="Investment", 
        description=f"Bought {asset.quantity} {asset.symbol}", 
        owner_id=user.id
    )
    db.add(db_txn)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.get("/portfolio/")
def get_portfolio(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    assets = db.query(models.Asset).filter(models.Asset.owner_id == user.id).all()
    portfolio_data = []
    total_invested = 0
    current_value = 0
    for asset in assets:
        try:
            stock = yf.Ticker(asset.symbol)
            history = stock.history(period="1d")
            live_price = history['Close'].iloc[-1] if not history.empty else asset.buy_price
        except:
            live_price = asset.buy_price
        val = live_price * asset.quantity
        profit = val - (asset.buy_price * asset.quantity)
        portfolio_data.append({
            "symbol": asset.symbol,
            "quantity": asset.quantity,
            "buy_price": asset.buy_price,
            "live_price": round(live_price, 2),
            "total_value": round(val, 2),
            "gain_loss": round(profit, 2)
        })
        total_invested += (asset.buy_price * asset.quantity)
        current_value += val
    return {
        "holdings": portfolio_data,
        "summary": {
            "invested": round(total_invested, 2),
            "current_value": round(current_value, 2),
            "total_profit": round(current_value - total_invested, 2)
        }
    }

@app.get("/summary/")
def get_summary(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    txns = db.query(models.Transaction).filter(models.Transaction.owner_id == user.id).all()
    inc = sum(t.amount for t in txns if t.amount > 0)
    exp = sum(t.amount for t in txns if t.amount < 0)
    return {"balance": inc + exp, "income": inc, "expense": abs(exp)}

@app.post("/goals/", response_model=GoalResponse)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_goal = models.Goal(**goal.dict(), owner_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals/progress/")
def get_goals_progress(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    goals = db.query(models.Goal).filter(models.Goal.owner_id == user.id).all()
    transactions = db.query(models.Transaction).filter(models.Transaction.owner_id == user.id).all()
    current_balance = sum(t.amount for t in transactions)
    results = []
    for goal in goals:
        progress = (current_balance / goal.target_amount) * 100 if goal.target_amount > 0 else 0
        results.append({
            "id": goal.id,
            "owner_id": user.id,
            "target_name": goal.target_name,
            "target_amount": goal.target_amount,
            "current_balance": current_balance,
            "percent_complete": min(round(progress, 2), 100.0)
        })
    return results

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.owner_id == user.id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(db_goal)
    db.commit()
    return {"message": "Goal deleted"}

@app.get("/recommendations/")
def get_recommendations(risk: str):
    risk = risk.lower()
    if risk in ["conservative", "low"]:
        return [{"symbol": "BND", "name": "Bonds", "allocation": 70}, {"symbol": "VTI", "name": "Stocks", "allocation": 30}]
    elif risk in ["aggressive", "high"]:
        return [{"symbol": "QQQ", "name": "Tech", "allocation": 50}, {"symbol": "BTC", "name": "Crypto", "allocation": 20}, {"symbol": "SPY", "name": "S&P 500", "allocation": 30}]
    return [{"symbol": "VTI", "name": "Stocks", "allocation": 60}, {"symbol": "BND", "name": "Bonds", "allocation": 40}]

@app.post("/simulate/start/")
def start_simulation(monthly_investment: float, years: int):
    task = run_simulation_task.delay(monthly_investment, years, 0.07)
    return {"task_id": task.id}

@app.get("/simulate/result/{task_id}")
def get_simulation_result(task_id: str):
    res = AsyncResult(task_id, app=celery_app)
    if res.state == 'SUCCESS': return {"status": "Completed", "result": res.result}
    if res.state == 'FAILURE': return {"status": "Failed"}
    return {"status": "Processing..."}