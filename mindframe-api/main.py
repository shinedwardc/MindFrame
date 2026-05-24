from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import journal, exercises
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MindFrame API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(journal.router, prefix="/journal", tags=["journal"])
app.include_router(exercises.router, prefix="/exercises", tags=["exercises"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
