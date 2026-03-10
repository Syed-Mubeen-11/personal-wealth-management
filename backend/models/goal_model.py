from sqlalchemy import Column, Integer, String, ForeignKey, Date
from core.database import Base


class Goal(Base):

    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    goal_type = Column(String)

    target_amount = Column(Integer)

    target_date = Column(Date)

    monthly_contribution = Column(Integer)

    status = Column(String, default="active")