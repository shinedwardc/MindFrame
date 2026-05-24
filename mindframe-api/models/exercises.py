from pydantic import BaseModel
from typing import Optional

class ExerciseRequest(BaseModel):
    mood_score: int
    distortions: list[str] = []
    context: Optional[str] = None

class ExerciseResponse(BaseModel):
    title: str
    description: str
    steps: list[str]
    exercise_type: str
