from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()


def _with_psycopg_driver(url: str | None) -> str | None:
    # Hosted Postgres (Railway, Neon, ...) hands out postgres:// or postgresql:// URLs, which
    # SQLAlchemy maps to psycopg2. Only psycopg 3 is installed, so name the driver explicitly.
    if url is None:
        return None
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


DATABASE_URL = _with_psycopg_driver(os.getenv("DATABASE_URL"))

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
