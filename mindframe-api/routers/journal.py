from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.journal import JournalEntryCreate, JournalEntryResponse
from db.session import get_db
from db.models.journal import JournalEntry
from auth import get_current_user_id
from services.claude_service import analyze_journal_entry

router = APIRouter()

@router.post("/", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry: JournalEntryCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    analysis = await analyze_journal_entry(entry.content, entry.mood_score)

    db_entry = JournalEntry(
        user_id=user_id,
        content=entry.content,
        # Use mood score from analysis if available, otherwise fall back to user-reported score
        mood_score=analysis.get("mood_score", entry.mood_score), 
        sentiment=analysis.get("sentiment"),
        distortions=analysis.get("distortions", []),
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.get("/{entry_id}", response_model=JournalEntryResponse)
def get_journal_entry(
    entry_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == user_id)
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.get("/", response_model=list[JournalEntryResponse])
def list_journal_entries(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=10, ge=1, le=100),
):
    return (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )
