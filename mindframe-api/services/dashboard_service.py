import random
from datetime import date, timedelta, datetime, timezone
from collections import Counter
from sqlalchemy import func, cast, Date
from sqlalchemy.orm import Session
from db.models.journal import JournalEntry
from models.dashboard import TodayEntry, RecentEntry, MoodPoint, EmotionCount, SuggestedExercise

CONTENT_PREVIEW_LENGTH = 120


def _preview(content: str) -> str:
    return content[:CONTENT_PREVIEW_LENGTH] + ("…" if len(content) > CONTENT_PREVIEW_LENGTH else "")


def get_today_entry(user_id: int, db: Session) -> TodayEntry | None:
    today = date.today()
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user_id,
            cast(JournalEntry.created_at, Date) == today,
        )
        .order_by(JournalEntry.created_at.desc())
        .first()
    )
    if not entry:
        return None
    return TodayEntry(
        id=entry.id,
        mood_score=entry.mood_score,
        content_preview=_preview(entry.content),
        created_at=entry.created_at,
    )


def get_recent_entries(user_id: int, db: Session, limit: int = 3) -> list[RecentEntry]:
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        RecentEntry(
            id=e.id,
            mood_score=e.mood_score,
            content_preview=_preview(e.content),
            acute_risk_detected=bool(e.acute_risk_detected),
            created_at=e.created_at,
        )
        for e in entries
    ]


def get_last_entry_date(user_id: int, db: Session) -> str | None:
    result = (
        db.query(cast(JournalEntry.created_at, Date))
        .filter(JournalEntry.user_id == user_id)
        .order_by(cast(JournalEntry.created_at, Date).desc())
        .limit(1).scalar()
    )
    return str(result) if result else None


def get_total_entries(user_id: int, db: Session) -> int:
    return db.query(JournalEntry).filter(JournalEntry.user_id == user_id).count()


def get_mood_trend(user_id: int, db: Session) -> list[MoodPoint]:
    rows = (
        db.query(
            cast(JournalEntry.created_at, Date).label("day"),
            func.avg(JournalEntry.mood_score).label("avg_mood"),
        )
        .filter(
            JournalEntry.user_id == user_id,
            cast(JournalEntry.created_at, Date) > date.today() - timedelta(days=7),
        )
        .group_by("day")
        .order_by("day")
        .all()
    )
    return [MoodPoint(date=str(r.day), avg_mood=round(float(r.avg_mood), 1)) for r in rows]


def get_top_distortions(user_id: int, db: Session, top_n: int = 3) -> list[str]:
    entries = (
        db.query(JournalEntry.distortions)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.distortions.isnot(None),
        )
        .order_by(JournalEntry.created_at.desc())
        .limit(7)
        .all()
    )
    counter: Counter = Counter()
    for (distortions,) in entries:
        if isinstance(distortions, list):
            counter.update(
                d["type"]
                for d in distortions
                if isinstance(d, dict) and "type" in d
            )
    return [d for d, _ in counter.most_common(top_n)]


def get_top_positive_patterns(user_id: int, db: Session, top_n: int = 3) -> list[str]:
    entries = (
        db.query(JournalEntry.positive_patterns)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.positive_patterns.isnot(None),
        )
        .order_by(JournalEntry.created_at.desc())
        .limit(7)
        .all()
    )
    counter: Counter = Counter()
    for (positive_patterns,) in entries:
        if isinstance(positive_patterns, list):
            counter.update(
                p["type"]
                for p in positive_patterns
                if isinstance(p, dict) and "type" in p
            )
    return [p for p, _ in counter.most_common(top_n)]


def get_emotion_summary(
    user_id: int, db: Session, days: int = 7, top_n: int = 6
) -> list[EmotionCount]:
    rows = (
        db.query(JournalEntry.emotions)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.emotions.isnot(None),
            cast(JournalEntry.created_at, Date) > date.today() - timedelta(days=days),
        )
        .all()
    )
    counter: Counter = Counter()
    for (emotions,) in rows:
        if isinstance(emotions, list):
            counter.update(e for e in emotions if isinstance(e, str))
    return [EmotionCount(word=w, count=c) for w, c in counter.most_common(top_n)]


def get_suggested_exercise(user_id: int, db: Session) -> SuggestedExercise | None:
    entries = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.analysis_status == "complete",
            JournalEntry.recommended_exercises.isnot(None),
        )
        .order_by(JournalEntry.created_at.desc())
        .limit(5)
        .all()
    )
    pool = [
        exercise
        for entry in entries
        if isinstance(entry.recommended_exercises, list)
        for exercise in entry.recommended_exercises
        if isinstance(exercise, dict) and exercise.get("title")
    ]
    if not pool:
        return None
    ex = random.choice(pool)
    return SuggestedExercise(
        title=ex.get("title", ""),
        description=ex.get("description", ""),
        steps=ex.get("steps", []),
        exercise_type=ex.get("exercise_type", ""),
    )
