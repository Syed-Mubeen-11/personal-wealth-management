from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    goal_type = Column(String, nullable=False)

    target_amount = Column(Float, nullable=False)
    target_date = Column(Date, nullable=False)
    monthly_contribution = Column(Float, nullable=False)

    status = Column(String, default="active")