from datetime import date, timedelta, datetime, timezone
from collections import Counter
from sqlalchemy import func, cast, Date
from sqlalchemy.orm import Session
from db.models.journal import JournalEntry
from models.dashboard import TodayEntry, RecentEntry, MoodPoint, SuggestedExercise

CONTENT_PREVIEW_LENGTH = 120

_EXERCISES: dict[str, SuggestedExercise] = {
    "low": SuggestedExercise(
        title="Box Breathing",
        description="A grounding technique to calm your nervous system when feeling overwhelmed or anxious.",
        technique="Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4–6 cycles.",
    ),
    "medium": SuggestedExercise(
        title="Thought Record",
        description="Examine a stressful thought by weighing the evidence — a core CBT technique for breaking distorted thinking.",
        technique="Write the automatic thought, rate belief (0–100%), list evidence for and against it, then write a balanced alternative.",
    ),
    "high": SuggestedExercise(
        title="Gratitude Reflection",
        description="Anchor what's going well to reinforce positive thinking patterns.",
        technique="Write 3 specific things you're grateful for today and one sentence on why each matters to you.",
    ),
}


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
            created_at=e.created_at,
        )
        for e in entries
    ]


def get_streak(user_id: int, db: Session) -> int:
    rows = (
        db.query(cast(JournalEntry.created_at, Date))
        .filter(JournalEntry.user_id == user_id)
        .distinct()
        .order_by(cast(JournalEntry.created_at, Date).desc())
        .all()
    )
    if not rows:
        return 0

    dates: set[date] = {r[0] for r in rows}
    today = date.today()
    # Start counting from today; if not journaled yet today, allow yesterday as start
    check = today if today in dates else today - timedelta(days=1)

    streak = 0
    while check in dates:
        streak += 1
        check -= timedelta(days=1)
    return streak


def get_entries_this_week(user_id: int, db: Session) -> int:
    week_ago = date.today() - timedelta(days=7)
    return (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user_id,
            cast(JournalEntry.created_at, Date) > week_ago,
        )
        .count()
    )


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


def get_suggested_exercise(recent_mood_avg: float | None) -> SuggestedExercise:
    if recent_mood_avg is None or recent_mood_avg <= 4:
        return _EXERCISES["low"]
    if recent_mood_avg <= 7:
        return _EXERCISES["medium"]
    return _EXERCISES["high"]
