from anthropic import AsyncAnthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def analyze_journal_entry(content: str) -> dict:
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=(
            "You are a CBT-trained assistant. Analyze the journal entry for "
            "emotional sentiment and cognitive distortions. Return JSON with: "
            "sentiment (positive/negative/neutral), distortions (list of identified "
            "cognitive distortions from CBT taxonomy). Return only valid JSON, no other text."
        ),
        messages=[{"role": "user", "content": content}],
    )
    return json.loads(response.content[0].text)

async def recommend_exercises(mood_score: int, distortions: list[str], context: str = "") -> dict:
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=(
            "You are a CBT therapist assistant. Based on the user's mood score and "
            "identified cognitive distortions, recommend 3 CBT exercises. "
            "Return JSON with: exercises (list of {title, description, steps, exercise_type}). "
            "Return only valid JSON, no other text."
        ),
        messages=[
            {
                "role": "user",
                "content": f"Mood score: {mood_score}/10. Distortions: {', '.join(distortions)}. Context: {context}",
            }
        ],
    )
    return json.loads(response.content[0].text)
