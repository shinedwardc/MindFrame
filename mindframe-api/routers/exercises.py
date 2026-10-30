from fastapi import APIRouter, Depends
from auth import get_current_user_id
from models.exercises import ExerciseRequest, ExerciseResponse
from services.llm_service import recommend_exercises

router = APIRouter()

# Auth-gated: each call is a paid model call, so it must not be reachable anonymously.
@router.post("/recommend", response_model=list[ExerciseResponse])
async def get_exercise_recommendations(
    request: ExerciseRequest,
    user_id: int = Depends(get_current_user_id),
):
    result = await recommend_exercises(
        mood_score=request.mood_score,
        distortions=request.distortions,
        context=request.context or "",
    )
    return result.get("exercises", [])
