from sqlalchemy import Column, Integer, String, Numeric, Date
from ..database import Base

class GoalDB(Base):
    __tablename__ = "goals"  # table name in DB
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    target_amount = Column(Numeric(10,2), nullable=False)
    current_amount = Column(Numeric(10,2), default=0)
    start_date = Column(Date)
    end_date = Column(Date)