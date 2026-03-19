from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Simulation(Base):

    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)

    scenario_name = Column(String)

    assumptions = Column(JSON)

    results = Column(JSON)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User",backref="simulations")

    goal = relationship("Goal",backref="simulations")