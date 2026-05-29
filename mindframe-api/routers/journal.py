from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.journal import JournalEntryCreate, JournalEntryResponse, MOOD_LABEL_FALLBACK
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
    analysis = await analyze_journal_entry(entry.content, entry.mood_label)

    db_entry = JournalEntry(
        user_id=user_id,
        content=entry.content,
        mood_score=analysis.get("mood_score", MOOD_LABEL_FALLBACK[entry.mood_label]),
        sentiment=analysis.get("sentiment"),
        distortions=analysis.get("distortions", []),
        emotions=entry.emotions,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

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


@router.delete("/", status_code=204)
def delete_all_journal_entries(
    confirm: bool = Query(default=False),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not confirm:
        raise HTTPException(status_code=422, detail="Pass confirm=true to delete all entries.")
    db.query(JournalEntry).filter(JournalEntry.user_id == user_id).delete()
    db.commit()


@router.delete("/{entry_id}", status_code=204)
def delete_journal_entry(
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
    db.delete(entry)
    db.commit()