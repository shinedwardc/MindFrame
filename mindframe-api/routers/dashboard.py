from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from auth import get_current_user_id
from models.dashboard import DashboardSummary
from services import dashboard_service as svc

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    trend = svc.get_mood_trend(user_id, db)
    recent_mood_avg = (
        sum(p.avg_mood for p in trend) / len(trend) if trend else None
    )

    return DashboardSummary(
        today_entry=svc.get_today_entry(user_id, db),
        recent_entries=svc.get_recent_entries(user_id, db),
        streak_days=svc.get_streak(user_id, db),
        entries_this_week=svc.get_entries_this_week(user_id, db),
        mood_trend=trend,
        emotions_summary=svc.get_emotion_summary(user_id, db),
        top_distortions=svc.get_top_distortions(user_id, db),
        suggested_exercise=svc.get_suggested_exercise(recent_mood_avg),
    )
