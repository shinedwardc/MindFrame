from anthropic import AsyncAnthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def analyze_journal_entry(content: str, mood_score: int) -> dict:
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=(
            "You are a CBT-trained assistant. Analyze journal entries carefully and conservatively. "
            "Only flag cognitive distortions when there is clear, specific evidence in the text. "
            "Do not pathologize normal emotional responses. "
            "If no distortions are present, return an empty array. "
            "mood_score: 1-3 = significant distress, 4-6 = mixed/mild, 7-10 = positive."
        ),
        tools=[{
            "name": "analyze_entry",
            "description": "Return sentiment analysis and cognitive distortions found in the journal entry.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "mood_score": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 10,
                        "description": "Overall emotional tone of the entry."
                    },
                    "sentiment": {
                        "type": "string",
                        "enum": ["positive", "negative", "neutral", "mixed"],
                        "description": "Overall emotional sentiment."
                    },
                    "distortions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "enum": [
                                        "all_or_nothing_thinking",
                                        "overgeneralization",
                                        "mental_filter",
                                        "disqualifying_the_positive",
                                        "mind_reading",
                                        "fortune_telling",
                                        "magnification",
                                        "emotional_reasoning",
                                        "should_statements",
                                        "personalization"
                                    ]
                                },
                                "evidence": {
                                    "type": "string",
                                    "description": "Brief quote or paraphrase from the entry showing this distortion."
                                }
                            },
                            "required": ["type", "evidence"]
                        },
                        "description": "Cognitive distortions clearly evidenced in the entry. Empty array if none."
                    }
                },
                "required": ["mood_score", "sentiment", "distortions"]
            }
        }],
        tool_choice={"type": "tool", "name": "analyze_entry"},
        messages=[{
            "role": "user",
            "content": (
                f"Journal entry: {content}\n\n"
                f"User's self-reported mood score: {mood_score}"
            )
        }],
    )
    return response.content[0].input


async def recommend_exercises(mood_score: int, distortions: list[str], context: str = "") -> dict:
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=(
            "You are a CBT therapist assistant. Recommend exactly 3 CBT exercises "
            "based on the user's mood score (1–10, lower = worse) and detected cognitive distortions. "
            "exercise_type must be one of: thought_record, behavioral_activation, breathing, grounding. "
            "Each step should be a single, actionable sentence. Prioritize exercises that directly "
            "address the identified distortions."
        ),
        tools=[{
            "name": "recommend_exercises",
            "description": "Return 3 CBT exercise recommendations based on mood and distortions.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "exercises": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "description": {"type": "string"},
                                "steps": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                                "exercise_type": {
                                    "type": "string",
                                    "enum": ["thought_record", "behavioral_activation", "breathing", "grounding"]
                                }
                            },
                            "required": ["title", "description", "steps", "exercise_type"],
                        },
                    },
                },
                "required": ["exercises"],
            },
        }],
        tool_choice={"type": "tool", "name": "recommend_exercises"},
        messages=[
            {
                "role": "user",
                "content": f"Mood score: {mood_score}/10. Distortions: {', '.join(distortions)}. Context: {context}",
            }
        ],
    )
    return response.content[0].input
