from sqlalchemy import Column, Integer, String, Numeric, Date, Enum, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class GoalType(str, enum.Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"


class GoalStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    goal_type = Column(Enum(GoalType), nullable=False, default=GoalType.custom)
    target_amount = Column(Numeric(15, 2), nullable=False)
    current_amount = Column(Numeric(15, 2), default=0)
    target_date = Column(Date, nullable=False)
    monthly_contribution = Column(Numeric(15, 2), default=0)
    status = Column(Enum(GoalStatus), default=GoalStatus.active)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    simulations = relationship("Simulation", back_populates="goal", cascade="all, delete-orphan")


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="CASCADE"), nullable=True)
    scenario_name = Column(String, nullable=False, default="Base Case")
    assumptions = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    goal = relationship("Goal", back_populates="simulations")
