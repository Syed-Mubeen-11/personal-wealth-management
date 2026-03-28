from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
from app.core.security import verify_password
from app.core.auth import create_access_token
from app.core.auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserUpdate, ChangePassword
from app.models.user import KYCStatusEnum

router = APIRouter()



@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = hash_password(user.password)

    # Create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        risk_profile=user.risk_profile
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }



@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "risk_profile": current_user.risk_profile,
        "kyc_status": current_user.kyc_status,
        "phone_number": current_user.phone_number,
        "address": current_user.address,
        "dob": current_user.dob
    }
@router.put("/update-profile")
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()

    if user_data.name:
        user.name = user_data.name

    if user_data.email:
        user.email = user_data.email

    if user_data.risk_profile:
        user.risk_profile = user_data.risk_profile

    if user_data.phone_number is not None:
        user.phone_number = user_data.phone_number

    if user_data.address is not None:
        user.address = user_data.address

    if user_data.dob is not None:
        user.dob = user_data.dob


    db.commit()

    return {"message": "Profile updated successfully"}

@router.put("/change-password")
def change_password(
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()

    if not verify_password(password_data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect")

    user.password_hash = hash_password(password_data.new_password)

    db.commit()

    return {"message": "Password updated successfully"}
@router.put("/verify-kyc")
def verify_kyc(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.kyc_status = KYCStatusEnum.verified

    db.commit()

    return {"message": "KYC verified"}


@router.patch("/users/risk-profile")
def update_risk_profile(
    risk_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    risk_profile = risk_data.get("risk_profile")
    if risk_profile not in ["conservative", "moderate", "aggressive"]:
        raise HTTPException(status_code=400, detail="Invalid risk profile")
    
    current_user.risk_profile = risk_profile
    db.commit()
    return {"message": "Risk profile updated successfully"}


@router.post("/users/verify-kyc")
def post_verify_kyc(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.kyc_status = KYCStatusEnum.verified
    db.commit()
    return {"message": "KYC verified"}