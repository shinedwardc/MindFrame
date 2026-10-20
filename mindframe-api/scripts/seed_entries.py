"""Add a batch of journal entries for one user and analyze them, for local testing.

Run from mindframe-api/:
    uv run python -m scripts.seed_entries                    # all of scripts/sample_entries.json
    uv run python -m scripts.seed_entries --limit 1          # cheap smoke test
    uv run python -m scripts.seed_entries --file my.json --email me@example.com

The file is a JSON list of {"content", "mood_label", "emotions"?} objects, validated with the
same schema as POST /journal/. Each entry is analyzed by routers.journal._run_analysis, the
background task that route schedules, one entry at a time, so its llm_calls rows look exactly
like real-user rows (eval_run_id NULL). Entry content is never printed.
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

from pydantic import ValidationError

from db.models.journal import JournalEntry
from db.models.user import User
from db.session import SessionLocal
from models.journal import JournalEntryCreate, MOOD_LABEL_FALLBACK
from routers.journal import _run_analysis

DEFAULT_FILE = Path(__file__).with_name("sample_entries.json")


def _load_entries(path: Path) -> list[JournalEntryCreate]:
    entries = []
    for i, item in enumerate(json.loads(path.read_text(encoding="utf-8")), start=1):
        try:
            entries.append(JournalEntryCreate(**item))
        except ValidationError as exc:
            # include_input=False keeps the entry text out of the error message.
            problems = "; ".join(
                f"{'.'.join(map(str, e['loc']))}: {e['msg']}"
                for e in exc.errors(include_input=False, include_url=False)
            )
            sys.exit(f"{path} entry {i} is invalid: {problems}")
    return entries


def _find_user_id(email: str | None) -> int:
    db = SessionLocal()
    try:
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user is None:
                sys.exit(f"No user with email {email}. Sign in to the app once to create it.")
            return user.id
        users = db.query(User).limit(2).all()
        if not users:
            sys.exit("No users yet. Sign in to the app once to create one.")
        if len(users) > 1:
            sys.exit("More than one user exists; pass --email to pick one.")
        return users[0].id
    finally:
        db.close()


def _create_entry(user_id: int, entry: JournalEntryCreate) -> int:
    # Mirrors create_journal_entry in routers/journal.py.
    db = SessionLocal()
    try:
        db_entry = JournalEntry(
            user_id=user_id,
            content=entry.content,
            mood_score=MOOD_LABEL_FALLBACK[entry.mood_label],
            emotions=entry.emotions,
            analysis_status="pending",
        )
        db.add(db_entry)
        db.commit()
        return db_entry.id
    finally:
        db.close()


def _analysis_status(entry_id: int) -> str:
    db = SessionLocal()
    try:
        return db.get(JournalEntry, entry_id).analysis_status
    finally:
        db.close()


async def _seed(user_id: int, entries: list[JournalEntryCreate]) -> int:
    failed = 0
    for n, entry in enumerate(entries, start=1):
        entry_id = _create_entry(user_id, entry)
        await _run_analysis(entry_id, entry.content, entry.mood_label)
        status = _analysis_status(entry_id)
        failed += status != "complete"
        print(f"[{n}/{len(entries)}] entry {entry_id} ({entry.mood_label}): {status}")
    return failed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--file", type=Path, default=DEFAULT_FILE, help="JSON list of entries")
    parser.add_argument("--email", help="user to add entries for (default: the only user)")
    parser.add_argument("--limit", type=int, help="add only the first N entries")
    args = parser.parse_args()

    entries = _load_entries(args.file)[: args.limit]
    user_id = _find_user_id(args.email)
    print(f"Adding {len(entries)} entries for user {user_id}, analyzing each in turn.")
    failed = asyncio.run(_seed(user_id, entries))
    print(f"Done: {len(entries) - failed} complete, {failed} failed.")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
