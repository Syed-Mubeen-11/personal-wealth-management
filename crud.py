from sqlalchemy.orm import Session
from models import User
from auth import hash_password

def create_user(db: Session, user):
    db_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        riskprofile=user.riskprofile
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()
