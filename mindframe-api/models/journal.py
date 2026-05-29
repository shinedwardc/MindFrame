from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class Distortion(BaseModel):
    type: str
    evidence: str


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


class JournalEntryResponse(BaseModel):
    id: int
    content: str
    mood_score: int
    sentiment: Optional[str] = None
    distortions: Optional[list[Distortion]] = None
    emotions: Optional[list[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}
