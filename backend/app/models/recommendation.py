from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    recommendation_text = Column(String, nullable=False)
    suggested_allocation = Column(JSON, nullable=False)  # Dict[str, float] e.g. {"stocks": 0.35, "etfs": 0.25}
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
