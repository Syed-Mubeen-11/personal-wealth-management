from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String, unique=True)

    password = Column(String)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    risk_profile = Column(String, default="moderate")


class UserProfile(Base):

    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    age = Column(Integer)

    address = Column(String)

    profile_photo = Column(String)

    user = relationship("User", back_populates="profile")

class Income(Base):

    __tablename__ = "income_sources"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    source = Column(String)

    amount = Column(Integer)

    created_at = Column(String)

class Expense(Base):

    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    category = Column(String)

    amount = Column(Integer)

    description = Column(String)

    created_at = Column(String)