from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class PatternItem(BaseModel):
    type: str
    quote: str
    reasoning: str
    confidence: str


MOOD_LABEL_FALLBACK = {
    "Struggling": 2,
    "Low": 4,
    "Okay": 6,
    "Good": 8,
    "Great": 10,
}


class JournalEntryCreate(BaseModel):
    content: str
    mood_label: str = Field(..., pattern="^(Struggling|Low|Okay|Good|Great)$")
    emotions: list[str] = Field(default_factory=list, max_length=3)


class Exercise(BaseModel):
    title: str
    description: str
    steps: list[str]
    exercise_type: str


class JournalEntryResponse(BaseModel):
    id: int
    content: str
    mood_score: int
    sentiment: Optional[str] = None
    distortions: Optional[list[PatternItem]] = None
    positive_patterns: Optional[list[PatternItem]] = None
    acute_risk_detected: bool = False
    emotions: Optional[list[str]] = None
    recommended_exercises: Optional[list[Exercise]] = None
    analysis_status: str = 'pending'
    created_at: datetime

    model_config = {"from_attributes": True}
