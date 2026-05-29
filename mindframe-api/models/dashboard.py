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
    created_at: datetime


class MoodPoint(BaseModel):
    date: str  # YYYY-MM-DD
    avg_mood: float


class SuggestedExercise(BaseModel):
    title: str
    description: str
    technique: str


class DashboardSummary(BaseModel):
    today_entry: Optional[TodayEntry]
    recent_entries: list[RecentEntry]
    streak_days: int
    entries_this_week: int
    mood_trend: list[MoodPoint]  # last 7 days that have entries
    top_distortions: list[str]   # top 3 from last 7 entries
    suggested_exercise: SuggestedExercise
