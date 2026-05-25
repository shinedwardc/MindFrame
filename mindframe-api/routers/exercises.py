from fastapi import APIRouter
from models.exercises import ExerciseRequest, ExerciseResponse
from services.claude_service import recommend_exercises

router = APIRouter()

@router.post("/recommend", response_model=list[ExerciseResponse])
async def get_exercise_recommendations(request: ExerciseRequest):
    result = await recommend_exercises(
        mood_score=request.mood_score,
        distortions=request.distortions,
        context=request.context or "",
    )
    return result.get("exercises", [])
