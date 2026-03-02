from sqlalchemy import Column, Integer, Numeric, Enum, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class GoalTypeEnum(str, enum.Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"


class GoalStatusEnum(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id",ondelete="CASCADE"),
        nullable=False
        )

    goal_type = Column(Enum(GoalTypeEnum))
    target_amount = Column(Numeric)
    target_date = Column(Date)

    monthly_contribution = Column(Numeric)
    status = Column(Enum(GoalStatusEnum), default=GoalStatusEnum.active)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="goals")