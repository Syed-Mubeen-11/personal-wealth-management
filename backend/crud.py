from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import get_password_hash

def create_user(db: Session, user):
    db_user = User(
        name=user.name,
        email=user.email,
        password=get_password_hash(user.password),
        riskprofile=user.riskprofile
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()
