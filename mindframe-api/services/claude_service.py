from anthropic import AsyncAnthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

DISTORTIONS = [
    "all_or_nothing_thinking",
    "overgeneralization",
    "catastrophizing",
    "disqualifying_the_positive",
    "mind_reading",
    "fortune_telling",
    "labeling",
    "should_statements",
    "personalization",
]
 
POSITIVE_PATTERNS = [
    "acceptance",
    "reframing",
    "balanced_thinking",
    "gratitude",
    "optimism",
    "self_compassion",
    "self_efficacy",
    "social_connection",
    "problem_focused_coping",
]
 
SYSTEM_PROMPT = """You are a CBT-trained assistant analyzing personal journal entries. Work carefully and conservatively. Your job is to observe, not to diagnose or pathologize.
 
GENERAL RULES
- Only flag a pattern when there is clear, specific evidence in the text. When in doubt, do not flag.
- An accurate description of a genuinely hard day is not a distortion.
- Never invent an adaptive pattern to be kind or to balance the negatives. An empty array is an honest, valid result for either list.
- For every flag, set a confidence level (low/medium/high) reflecting how unambiguous the evidence is, and quote or closely paraphrase the specific span of the entry that supports it.
 
COGNITIVE DISTORTIONS
- all_or_nothing_thinking: binary, black-and-white judgments with no middle ground ("total failure", "completely ruined").
- overgeneralization: treating one event as a never-ending pattern ("this always happens", "I never get it right").
- catastrophizing: predicting and exaggerating a worst-case outcome as unbearable ("this is a disaster", "I won't cope").
- disqualifying_the_positive: dismissing good things so they don't count, or attending only to the negative ("that doesn't count", "they were just being polite").
- mind_reading: assuming without evidence that you know what others think, usually negatively ("she thinks I'm incompetent").
- fortune_telling: predicting a negative future as if it were certain ("I'll never get the job").
- labeling: attaching a fixed, global negative label to yourself or someone else ("I'm a failure", "he's worthless").
- should_statements: rigid demands about how you or others must be, often carrying guilt or pressure ("I should be over this", "I have to be perfect").
- personalization: taking blame for, or responsibility over, things outside your control ("it's my fault he's upset").
 
ADAPTIVE PATTERNS
- acceptance: acknowledging a hard reality that can't be changed, without denial or harsh judgment ("I can't change this, and I'm letting it be").
- reframing: reinterpreting a situation in a more accurate or helpful light, or finding meaning in it ("this setback showed me what to work on").
- balanced_thinking: holding multiple sides at once rather than going to extremes ("parts of today were hard, parts were fine").
- gratitude: genuinely noticing and appreciating something of value (not performed positivity).
- optimism: a positive expectation about how things will turn out ("I think this will work out").
- self_compassion: treating yourself with the kindness you'd give a friend in the same spot ("it's okay that I struggled").
- self_efficacy: recognizing your own capability to handle a specific challenge ("I've gotten through worse; I can do this").
- social_connection: drawing on relationships as a real resource (reaching out, feeling supported, leaning on others).
- problem_focused_coping: actively tackling a difficulty with concrete steps or a plan rather than avoiding it.
 
DISAMBIGUATION (when two could apply, use these contrasts)
- reframing vs balanced_thinking: reframing shifts the MEANING of a situation; balanced_thinking adds NUANCE / both-sides.
- acceptance vs self_compassion: acceptance is about an unchangeable SITUATION; self_compassion is about kindness toward ONESELF.
- acceptance vs problem_focused_coping: acceptance fits what CAN'T be changed; problem_focused_coping fits what CAN.
- catastrophizing vs fortune_telling: fortune_telling predicts a negative OUTCOME; catastrophizing adds that it would be UNBEARABLE/disastrous.
- all_or_nothing vs overgeneralization: all_or_nothing is BINARY CATEGORIES; overgeneralization is ONE INSTANCE -> UNIVERSAL RULE.
 
MOOD
- mood_score: 1-3 = significant distress, 4-6 = mixed/mild, 7-10 = positive.
 
SAFETY (highest priority)
- If the entry contains any indication of suicidal thoughts, intent to self-harm, or acute crisis, set acute_risk_detected to true. This assessment overrides everything else; when true, the application will surface support resources and will not present the entry as a list of distortions."""
 
 
def _pattern_item(enum_values: list[str]) -> dict:
    return {
        "type": "object",
        "properties": {
            "type": {"type": "string", "enum": enum_values},
            "quote": {
                "type": "string",
                "description": "A direct quote or close paraphrase from the entry that shows this pattern.",
            },
            "reasoning": {
                "type": "string",
                "description": "One sentence explaining why this quote evidences the pattern.",
            },
            "confidence": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "description": "How unambiguous the textual evidence is.",
            },
        },
        "required": ["type", "quote", "reasoning", "confidence"],
    }
 
 
ANALYZE_TOOL = {
    "name": "analyze_entry",
    "description": (
        "Return sentiment, cognitive distortions, adaptive thinking patterns, "
        "and a safety flag for the journal entry."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "mood_score": {
                "type": "integer",
                "minimum": 1,
                "maximum": 10,
                "description": "Overall emotional tone of the entry.",
            },
            "sentiment": {
                "type": "string",
                "enum": ["positive", "negative", "neutral", "mixed"],
                "description": "Overall emotional sentiment.",
            },
            "acute_risk_detected": {
                "type": "boolean",
                "description": (
                    "True if the entry indicates suicidal ideation, intent to self-harm, "
                    "or acute crisis. When true, the app should surface support resources "
                    "and must NOT present this entry as a set of 'distortions'."
                ),
            },
            "distortions": {
                "type": "array",
                "items": _pattern_item(DISTORTIONS),
                "description": "Cognitive distortions clearly evidenced in the entry. Empty array if none.",
            },
            "positive_patterns": {
                "type": "array",
                "items": _pattern_item(POSITIVE_PATTERNS),
                "description": "Adaptive/healthy thinking patterns clearly evidenced in the entry. Empty array if none.",
            },
        },
        "required": [
            "mood_score",
            "sentiment",
            "acute_risk_detected",
            "distortions",
            "positive_patterns",
        ],
    },
    "cache_control": {"type": "ephemeral"},
}
 
 
async def analyze_journal_entry(content: str, mood_label: str) -> dict:
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=[ANALYZE_TOOL],
        tool_choice={"type": "tool", "name": "analyze_entry"},
        messages=[
            {
                "role": "user",
                "content": (
                    f"Journal entry: {content}\n\n"
                    f"User's self-reported mood: {mood_label}"
                ),
            }
        ],
    )
    tool_block = next(
        (
            block
            for block in response.content
            if getattr(block, "type", None) == "tool_use"
            and getattr(block, "name", None) == "analyze_entry"
        ),
        None,
    )
    if tool_block is None:
        raise ValueError("Expected analyze_entry tool_use block in Claude response")
    return tool_block.input


EXERCISE_TYPES = [
    "thought_record",
    "behavioral_activation",
    #"behavioral_experiment",
    "breathing",
    "grounding",
    "mindfulness",
    "progressive_muscle_relaxation",
    "problem_solving",
    "self_compassion",
    "gratitude_practice",
    "worry_journaling",
    "values_clarification",
]

RECOMMEND_SYSTEM_PROMPT = """You are a CBT therapist assistant. Recommend exactly 3 CBT exercises based on the user's mood score, detected cognitive distortions, and adaptive patterns already present in the entry.

RULES
- Each step must be a single, actionable sentence.
- Prioritize exercises that directly address the identified distortions.
- When adaptive patterns are already present, reinforce and build on them rather than ignoring them.
- When mood is high and distortions are absent, prefer maintenance-focused types: gratitude_practice, values_clarification, mindfulness.
- Never recommend the same exercise_type more than once.

EXERCISE TYPE GUIDE
- thought_record: identify an automatic thought, examine the evidence for and against it, generate a balanced alternative.
- behavioral_activation: schedule a specific rewarding activity to counter low mood or withdrawal.
- behavioral_experiment: form a testable prediction from a belief, design a real-world action to test it, record the outcome.
- breathing: use regulated breathing (e.g. box or 4-7-8) to reduce physiological arousal.
- grounding: use sensory input (5-4-3-2-1 or similar) to anchor attention to the present moment.
- mindfulness: observe thoughts and feelings as passing events without judgment or suppression.
- progressive_muscle_relaxation: systematically tense and release muscle groups to release physical tension.
- problem_solving: define the problem clearly, generate options, evaluate and commit to one action.
- self_compassion: respond to your own distress as you would respond to a close friend in the same situation.
- gratitude_practice: identify and write about specific things of genuine value — not performed positivity.
- worry_journaling: write worries down in a dedicated slot, then consciously set them aside until next time.
- values_clarification: identify what matters most to you and examine how today's actions align with those values."""

RECOMMEND_TOOL = {
    "name": "recommend_exercises",
    "description": "Return exactly 3 CBT exercise recommendations tailored to the entry's mood, distortions, and adaptive patterns.",
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
                        "steps": {"type": "array", "items": {"type": "string"}},
                        "exercise_type": {"type": "string", "enum": EXERCISE_TYPES},
                    },
                    "required": ["title", "description", "steps", "exercise_type"],
                },
            },
        },
        "required": ["exercises"],
    },
    "cache_control": {"type": "ephemeral"},
}


async def recommend_exercises(
    mood_score: int,
    distortions: list[str] | None = None,
    positive_patterns: list[str] | None = None,
    context: str = "",
) -> dict:
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=[{"type": "text", "text": RECOMMEND_SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        tools=[RECOMMEND_TOOL],
        tool_choice={"type": "tool", "name": "recommend_exercises"},
        messages=[
            {
                "role": "user",
                "content": (
                    f"Mood score: {mood_score}/10.\n"
                    f"Cognitive distortions: {', '.join(distortions) if distortions else 'none'}.\n"
                    f"Adaptive patterns already present: {', '.join(positive_patterns) if positive_patterns else 'none'}.\n"
                    f"Journal entry:\n{context}"
                ),
            }
        ],
    )
    tool_block = next(
        (
            block for block in response.content
            if getattr(block, "type", None) == "tool_use"
            and getattr(block, "name", None) == "recommend_exercises"
        ),
        None,
    )
    if tool_block is None:
        raise ValueError("Expected recommend_exercises tool_use block in Claude response")
    return tool_block.input
