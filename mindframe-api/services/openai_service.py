from openai import AsyncOpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def analyze_journal_entry(content: str) -> dict:
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a CBT-trained assistant. Analyze the journal entry for "
                    "emotional sentiment and cognitive distortions. Return JSON with: "
                    "sentiment (positive/negative/neutral), distortions (list of identified "
                    "cognitive distortions from CBT taxonomy)."
                ),
            },
            {"role": "user", "content": content},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)

async def recommend_exercises(mood_score: int, distortions: list[str], context: str = "") -> dict:
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a CBT therapist assistant. Based on the user's mood score and "
                    "identified cognitive distortions, recommend 3 CBT exercises. "
                    "Return JSON with: exercises (list of {title, description, steps, exercise_type})."
                ),
            },
            {
                "role": "user",
                "content": f"Mood score: {mood_score}/10. Distortions: {', '.join(distortions)}. Context: {context}",
            },
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
