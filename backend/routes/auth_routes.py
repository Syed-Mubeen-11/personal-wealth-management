from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
import models.models as models
import schemas.schemas as schemas
from core.database import SessionLocal
from core.auth import verify_password, create_access_token, hash_password, get_current_user

router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing_user = db.query(models.User).filter(
        or_(
            models.User.username == user.username,
            models.User.email == user.email,
            models.User.phone_number == user.phone_number
        )
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = hash_password(user.password)
    
    # 1. Create the User
    new_user = models.User(
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit() # Commit here to generate the new_user.id
    db.refresh(new_user)

    # 2. Create the linked UserProfile automatically
    new_profile = models.UserProfile(
        user_id=new_user.id,
        age=0,
        address="",
        profile_photo=None,
        aadhaar_no="",
        pan_no="",
        kyc_status="not-submitted",
        investment_risk="pending",  # As per your update
        risk_profile="pending"      # As per your update
    )
    db.add(new_profile)
    db.commit()

    return new_user

@router.post("/login", response_model=schemas.TokenResponse)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        or_(
            models.User.username == user.login_id,
            models.User.email == user.login_id,
            models.User.phone_number == user.login_id
        )
    ).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"user_id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_logged_user(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "phone_number": current_user.phone_number
    }