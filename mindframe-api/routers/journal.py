from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.journal import JournalEntryCreate, JournalEntryResponse
from db.session import get_db
from db.models.journal import JournalEntry
from services.openai_service import analyze_journal_entry

router = APIRouter()

@router.post("/", response_model=JournalEntryResponse)
async def create_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    analysis = await analyze_journal_entry(entry.content)

    db_entry = JournalEntry(
        user_id=1,  # TODO: extract from verified JWT
        content=entry.content,
        mood_score=entry.mood_score,
        sentiment=analysis.get("sentiment"),
        distortions=analysis.get("distortions", []),
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/", response_model=list[JournalEntryResponse])
def list_journal_entries(db: Session = Depends(get_db)):
    return db.query(JournalEntry).filter(JournalEntry.user_id == 1).all()  # TODO: extract from verified JWT
