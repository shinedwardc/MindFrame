import json
import logging
import os
import time
from decimal import Decimal
from dotenv import load_dotenv

load_dotenv()

# Use the bundled model cost map instead of fetching it from GitHub at import time.
os.environ.setdefault("LITELLM_LOCAL_MODEL_COST_MAP", "True")

import litellm

# Journal entries must never reach logs: redact message content from any LiteLLM
# logging callback and silence its debug/help output.
litellm.turn_off_message_logging = True
litellm.suppress_debug_info = True

from db.session import SessionLocal
from db.models.llm_call import LLMCall

logger = logging.getLogger(__name__)

# Models are "<provider>/<model>" LiteLLM ids, e.g. "openai/gpt-5.5". Each provider's
# key is read here and nowhere else (AGENTS.md §5).
PROVIDER_API_KEY_ENV = {
    "anthropic": "ANTHROPIC_API_KEY",
    "openai": "OPENAI_API_KEY",
}

ANALYZE_MODEL = os.getenv("LLM_ANALYZE_MODEL", "anthropic/claude-sonnet-5-5")
RECOMMEND_MODEL = os.getenv("LLM_RECOMMEND_MODEL", "anthropic/claude-haiku-5-5")

# USD per million tokens, used to price each row in llm_calls. LiteLLM's cost map can't be
# used instead: for models it doesn't know (Claude 5.5 on 1.103.3) it returns $0 rather than
# raising. A model missing here is logged with cost_usd NULL, so add any model you switch to.
# Cache writes are the 5-minute TTL rate (1.25x input). Haiku 5.5's rates apply up to 100K
# input tokens, far above any journal entry.
PRICES_PER_MTOK = {
    "anthropic/claude-sonnet-5-5": {
        "input": Decimal("2.00"),
        "output": Decimal("10.00"),
        "cache_read": Decimal("0.20"),
        "cache_write": Decimal("2.50"),
    },
    "anthropic/claude-haiku-5-5": {
        "input": Decimal("0.10"),
        "output": Decimal("0.50"),
        "cache_read": Decimal("0.01"),
        "cache_write": Decimal("0.125"),
    },
}


class LLMRefusalError(Exception):
    """The model declined the request (Anthropic stop_reason "refusal")."""


def _provider_kwargs(model: str, name: str, schema: dict, effort: str) -> dict:
    provider = model.split("/", 1)[0]
    if provider not in PROVIDER_API_KEY_ENV:
        raise ValueError(
            f"Unsupported model {model!r}: expected one of "
            f"{', '.join(f'{p}/<model>' for p in PROVIDER_API_KEY_ENV)}"
        )
    key = os.getenv(PROVIDER_API_KEY_ENV[provider])
    if not key:
        raise ValueError(f"{PROVIDER_API_KEY_ENV[provider]} is not set for model {model!r}")
    kwargs = {"model": model, "api_key": key}
    if provider == "anthropic":
        # Sent as output_config directly: LiteLLM 1.103.3 doesn't know the Claude 5.5 models
        # and would turn response_format into an unforced hidden tool call instead.
        kwargs["output_config"] = {"format": {"type": "json_schema", "schema": schema}, "effort": effort}
    else:
        kwargs["response_format"] = {
            "type": "json_schema",
            "json_schema": {"name": name, "schema": schema, "strict": True},
        }
        kwargs["reasoning_effort"] = effort
        # Lets models without effort control (e.g. gpt-4.1) ignore reasoning_effort.
        kwargs["drop_params"] = True
        # OpenAI's Responses API stores responses by default; keep entry analyses off their servers.
        kwargs["store"] = False
    return kwargs

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
        "additionalProperties": False,
    }


async def _structured_call(
    model: str,
    name: str,
    schema: dict,
    check,
    messages: list[dict],
    effort: str,
) -> dict:
    # Structured outputs constrain the reply to `schema`. `check` enforces what the schema
    # can't express there (number ranges, array lengths) and a failed check gets one retry.
    # Every attempt is recorded in llm_calls, since each one is billed.
    problem = None
    for _ in range(2):
        started = time.perf_counter()
        try:
            response = await litellm.acompletion(
                **_provider_kwargs(model, name, schema, effort),
                # Thinking counts toward max_tokens.
                max_tokens=16000,
                messages=messages,
            )
        except Exception as exc:
            _record_call(name, model, _elapsed_ms(started), "error", error_type=type(exc).__name__)
            raise
        call = {"latency_ms": _elapsed_ms(started), **_token_usage(response)}
        choice = response.choices[0]
        if choice.finish_reason == "content_filter":
            _record_call(name, model, status="refusal", **call)
            raise LLMRefusalError(f"{model} declined the {name} request")
        if choice.finish_reason == "length":
            _record_call(name, model, status="truncated", **call)
            raise ValueError(f"{name} response hit max_tokens before it was complete")
        try:
            result = json.loads(choice.message.content)
        except json.JSONDecodeError as exc:
            _record_call(name, model, status="invalid_output", error_type=type(exc).__name__, **call)
            raise
        problem = check(result)
        _record_call(name, model, status="success" if problem is None else "invalid_output", **call)
        if problem is None:
            return result
    raise ValueError(f"Invalid {name} response: {problem}")


def _elapsed_ms(started: float) -> int:
    return round((time.perf_counter() - started) * 1000)


def _token_usage(response) -> dict:
    # LiteLLM normalizes usage across providers: prompt_tokens is all input, of which
    # cached_tokens were cache reads and cache_creation_tokens (Anthropic only) cache writes.
    usage = response.usage
    details = usage.prompt_tokens_details
    cache_read = (details.cached_tokens if details else None) or 0
    cache_creation = getattr(details, "cache_creation_tokens", None) or 0
    return {
        "input_tokens": usage.prompt_tokens - cache_read - cache_creation,
        "cache_read_input_tokens": cache_read,
        "cache_creation_input_tokens": cache_creation,
        "output_tokens": usage.completion_tokens,
    }


def _cost_usd(
    model: str,
    input_tokens: int,
    cache_read_input_tokens: int,
    cache_creation_input_tokens: int,
    output_tokens: int,
) -> Decimal | None:
    prices = PRICES_PER_MTOK.get(model)
    if prices is None:
        return None
    return (
        input_tokens * prices["input"]
        + cache_read_input_tokens * prices["cache_read"]
        + cache_creation_input_tokens * prices["cache_write"]
        + output_tokens * prices["output"]
    ) / 1_000_000


def _record_call(
    task: str,
    model: str,
    latency_ms: int,
    status: str,
    error_type: str | None = None,
    input_tokens: int = 0,
    cache_read_input_tokens: int = 0,
    cache_creation_input_tokens: int = 0,
    output_tokens: int = 0,
) -> None:
    tokens = {
        "input_tokens": input_tokens,
        "cache_read_input_tokens": cache_read_input_tokens,
        "cache_creation_input_tokens": cache_creation_input_tokens,
        "output_tokens": output_tokens,
    }
    db = SessionLocal()
    try:
        db.add(LLMCall(
            task=task,
            model=model,
            status=status,
            error_type=error_type,
            latency_ms=latency_ms,
            cost_usd=_cost_usd(model, **tokens),
            **tokens,
        ))
        db.commit()
    except Exception:
        # Losing a log row must never fail the analysis itself.
        logger.warning("Could not record LLM call for task %s", task, exc_info=True)
    finally:
        db.close()


def _check_analysis(result: dict) -> str | None:
    if not 1 <= result["mood_score"] <= 10:
        return f"mood_score {result['mood_score']} is outside 1-10"
    return None


ANALYZE_SCHEMA = {
    "type": "object",
    "properties": {
        "mood_score": {
            "type": "integer",
            "description": "Overall emotional tone of the entry, from 1 to 10.",
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
    "additionalProperties": False,
}


async def analyze_journal_entry(content: str, mood_label: str) -> dict:
    return await _structured_call(
        ANALYZE_MODEL,
        "analyze_entry",
        ANALYZE_SCHEMA,
        _check_analysis,
        # High effort because the safety flag rides on this call.
        effort="high",
        # No prompt caching on either call: entries arrive far more than 5 minutes apart, so a
        # cache write (1.25x input price) would almost never be read back.
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Journal entry: {content}\n\n"
                    f"User's self-reported mood: {mood_label}"
                ),
            },
        ],
    )


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

RECOMMEND_SCHEMA = {
    "type": "object",
    "properties": {
        "exercises": {
            "type": "array",
            "description": "Exactly 3 CBT exercise recommendations, each with a different exercise_type.",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "steps": {"type": "array", "items": {"type": "string"}},
                    "exercise_type": {"type": "string", "enum": EXERCISE_TYPES},
                },
                "required": ["title", "description", "steps", "exercise_type"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["exercises"],
    "additionalProperties": False,
}


def _check_exercises(result: dict) -> str | None:
    types = [exercise["exercise_type"] for exercise in result["exercises"]]
    if len(types) != 3:
        return f"expected 3 exercises, got {len(types)}"
    if len(set(types)) != len(types):
        return "an exercise_type is repeated"
    return None


async def recommend_exercises(
    mood_score: int,
    distortions: list[str] | None = None,
    positive_patterns: list[str] | None = None,
    context: str = "",
) -> dict:
    return await _structured_call(
        RECOMMEND_MODEL,
        "recommend_exercises",
        RECOMMEND_SCHEMA,
        _check_exercises,
        effort="low",
        messages=[
            {"role": "system", "content": RECOMMEND_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Mood score: {mood_score}/10.\n"
                    f"Cognitive distortions: {', '.join(distortions) if distortions else 'none'}.\n"
                    f"Adaptive patterns already present: {', '.join(positive_patterns) if positive_patterns else 'none'}.\n"
                    f"Journal entry:\n{context}"
                ),
            },
        ],
    )
