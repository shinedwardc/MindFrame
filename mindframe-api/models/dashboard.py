from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TodayEntry(BaseModel):
    id: int
    mood_score: int
    content_preview: str
    created_at: datetime


class RecentEntry(BaseModel):
    id: int
    mood_score: int
    content_preview: str
    acute_risk_detected: bool
    created_at: datetime


class MoodPoint(BaseModel):
    date: str  # YYYY-MM-DD
    avg_mood: float


class EmotionCount(BaseModel):
    word: str
    count: int


class SuggestedExercise(BaseModel):
    title: str
    description: str
    steps: list[str]
    exercise_type: str


class DashboardSummary(BaseModel):
    today_entry: Optional[TodayEntry]
    recent_entries: list[RecentEntry]
    streak_days: int
    entries_this_week: int
    mood_trend: list[MoodPoint]  # last 7 days that have entries
    emotions_summary: list[EmotionCount]  # most-tagged feelings, last 7 days
    top_distortions: list[str]         # top 3 from last 7 entries
    top_positive_patterns: list[str]   # top 3 from last 7 entries
    suggested_exercise: Optional[SuggestedExercise] = None
