from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import models.models as models
import schemas.schemas as schemas
from core.database import SessionLocal
from core.auth import get_current_user
import shutil
import uuid
import os

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

    if age is not None:
        db_profile.age = age
    if address is not None:
        db_profile.address = address

    if profile_photo is not None:
        file_extension = profile_photo.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)
        
        db_profile.profile_photo = file_path

    db.commit()
    db.refresh(db_profile)
    return db_profile