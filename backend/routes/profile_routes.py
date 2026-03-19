from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import models.models as models
import schemas.schemas as schemas
from core.database import SessionLocal
from core.auth import get_current_user
import shutil
import uuid
import os
from typing import Optional, Any

router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ensure the upload directory exists
UPLOAD_DIR = "uploads/profile_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=schemas.ProfileResponse)
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

    # Handle file upload
    file_extension = profile_photo.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

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
    return new_profile

@router.get("", response_model=schemas.ProfileResponse)
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

@router.put("", response_model=schemas.ProfileResponse)
def update_profile(
    username: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    address: Optional[str] = Form(None),
    aadhaar_no: Optional[str] = Form(None),
    pan_no: Optional[str] = Form(None),
    investment_risk: Optional[str] = Form(None),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # --- 1. DYNAMIC RISK CALCULATION LOGIC ---
    # Fetch all incomes and expenses for the current user
    # Note: Ensure 'Income' and 'Expense' are imported from models.models
    user_incomes = db.query(models.Income).filter(models.Income.user_id == current_user.id).all()
    user_expenses = db.query(models.Expense).filter(models.Expense.user_id == current_user.id).all()

    total_in = sum(inc.amount for inc in user_incomes)
    total_ex = sum(exp.amount for exp in user_expenses)
    
    # Calculate Savings Ratio
    surplus = total_in - total_ex
    savings_ratio = (surplus / total_in) if total_in > 0 else 0

    # Determine Calculated Risk Profile based on Financial Capacity
    if total_in == 0 or savings_ratio < 0.15:
        db_profile.risk_profile = "CONSERVATIVE"
    elif 0.15 <= savings_ratio < 0.35:
        db_profile.risk_profile = "MODERATE"
    else:
        db_profile.risk_profile = "AGGRESSIVE"

    # --- 2. UPDATE ACCOUNT & IDENTITY DETAILS ---
    if username: current_user.username = username
    if email: current_user.email = email
    if phone_number: current_user.phone_number = phone_number
    
    if age is not None: db_profile.age = age
    if address is not None: db_profile.address = address
    
    if aadhaar_no: 
        db_profile.aadhaar_no = aadhaar_no
        db_profile.kyc_status = "pending"
    if pan_no: 
        db_profile.pan_no = pan_no
        db_profile.kyc_status = "pending"
        
    # Save the User's manual preference
    if investment_risk: 
        db_profile.investment_risk = investment_risk

    # --- 3. HANDLE PHOTO UPLOAD ---
    if profile_photo:
        file_extension = profile_photo.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)
        db_profile.profile_photo = file_path

    db.commit()
    db.refresh(db_profile)
    return db_profile