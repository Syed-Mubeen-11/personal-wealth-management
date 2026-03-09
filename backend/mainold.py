from fastapi import FastAPI, Depends, Request, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from core.auth import verify_password, create_access_token, hash_password, get_current_user
from sqlalchemy import or_, func
import models.models as models
import schemas.schemas as schemas
from core.database import engine, SessionLocal
import shutil
import os
import uuid
from fastapi.staticfiles import StaticFiles
from datetime import datetime

# Routes
from routes import goal_routes
from routes import investment_routes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Wealth Management API")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

templates = Jinja2Templates(directory="templates")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("backend.html", {"request": request})

@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):

    # Check password match
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check username
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Check email
    existing_email = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Check phone
    existing_phone = db.query(models.User).filter(
        models.User.phone_number == user.phone_number
    ).first()

    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already exists")

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user
    new_user = models.User(
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/api/login", response_model=schemas.TokenResponse)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        or_(
            models.User.username == user.login_id,
            models.User.email == user.login_id,
            models.User.phone_number == user.login_id
        )
    ).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"user_id": db_user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/api/me")
def get_logged_user(current_user: models.User = Depends(get_current_user)):

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "phone_number": current_user.phone_number
    }

@app.post("/api/profile")
def create_profile(
    age: int = Form(...),
    address: str = Form(...),
    profile_photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    existing_profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    # generate unique filename
    file_extension = profile_photo.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"

    file_path = f"uploads/profile_photos/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(profile_photo.file, buffer)

    new_profile = models.UserProfile(
        user_id=current_user.id,
        age=age,
        address=address,
        profile_photo=file_path
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "age": new_profile.age,
        "address": new_profile.address,
        "profile_photo": new_profile.profile_photo
    }

@app.get("/api/profile", response_model=schemas.ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile

@app.put("/api/profile")
def update_profile(
    age: int = Form(None),
    address: str = Form(None),
    profile_photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    db_profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).first()

    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update age if provided
    if age is not None:
        db_profile.age = age

    # Update address if provided
    if address is not None:
        db_profile.address = address

    # Update profile photo if new file uploaded
    if profile_photo is not None:

        file_extension = profile_photo.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"

        file_path = f"uploads/profile_photos/{filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)

        db_profile.profile_photo = file_path

    db.commit()
    db.refresh(db_profile)

    return {
        "age": db_profile.age,
        "address": db_profile.address,
        "profile_photo": db_profile.profile_photo
    }

@app.post("/api/income", response_model=schemas.IncomeResponse)
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

@app.get("/api/income", response_model=list[schemas.IncomeResponse])
def get_incomes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    incomes = db.query(models.Income).filter(
        models.Income.user_id == current_user.id
    ).all()

    return incomes

@app.delete("/api/income/{income_id}")
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

@app.post("/api/expenses", response_model=schemas.ExpenseResponse)
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

@app.get("/api/expenses", response_model=list[schemas.ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).all()

    return expenses

@app.delete("/api/expenses/{expense_id}")
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
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()

    return {"message": "Expense deleted successfully"}

@app.get("/api/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # total income
    total_income = db.query(
        func.sum(models.Income.amount)
    ).filter(
        models.Income.user_id == current_user.id
    ).scalar() or 0

    # total expenses
    total_expenses = db.query(
        func.sum(models.Expense.amount)
    ).filter(
        models.Expense.user_id == current_user.id
    ).scalar() or 0

    # savings
    savings = total_income - total_expenses

    # expense breakdown by category
    expenses = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount)
    ).filter(
        models.Expense.user_id == current_user.id
    ).group_by(models.Expense.category).all()

    expense_breakdown = {
        category: amount for category, amount in expenses
    }

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "savings": savings,
        "expense_breakdown": expense_breakdown
    }

app.include_router(goal_routes.router)
app.include_router(investment_routes.router)