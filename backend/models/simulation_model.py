from sqlalchemy import Column, Integer, ForeignKey, JSON
from core.database import Base


class Simulation(Base):

    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)

    goal_id = Column(Integer, ForeignKey("goals.id"))

    assumptions = Column(JSON)

    results = Column(JSON)