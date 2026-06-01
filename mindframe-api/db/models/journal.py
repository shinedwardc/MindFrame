from sqlalchemy import Column, Boolean, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    mood_score = Column(Integer, nullable=False)
    sentiment = Column(String)
    distortions = Column(JSON)
    positive_patterns = Column(JSON)
    acute_risk_detected = Column(Boolean, nullable=False, server_default='false')
    emotions = Column(JSON)
    recommended_exercises = Column(JSON)
    analysis_status = Column(String, nullable=False, server_default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="journal_entries")
