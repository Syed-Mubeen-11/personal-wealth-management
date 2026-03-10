from sqlalchemy import Column, Integer, ForeignKey, String, JSON
from core.database import Base


class Recommendation(Base):

    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    recommendation_text = Column(String)

    suggested_allocation = Column(JSON)