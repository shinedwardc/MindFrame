# MindFrame

An AI-powered CBT companion and mood journal. Users work through structured CBT exercises while their journal entries are analyzed to surface emotional patterns over time. The AI adapts exercise recommendations to what the user is actually struggling with.

## Features

### CBT Exercise Engine
- **Thought Records** — guided walks through situation → automatic thought → emotion → cognitive distortion → reframe
- **Behavioral Activation** — schedule small positive activities and log completion
- **Breathing & Grounding timers** — 4-7-8 breathing, 5-4-3-2-1 grounding technique

### AI Mood Journal
- Free-text daily check-ins
- Sentiment and cognitive distortion detection (e.g. "I notice catastrophizing in your entry")
- AI suggests which CBT exercise fits the current journal entry

### Progress Dashboard
- Mood trend chart over time
- Distortion frequency breakdown — which patterns appear most
- Streak tracking for consistency

## Tech Stack

- **Frontend** — Next.js 16 (App Router), Tailwind CSS, Auth.js v5
- **Backend** — FastAPI, SQLAlchemy, Alembic
- **Database** — PostgreSQL 16 (Docker)
- **AI** — Anthropic Claude Sonnet
- **Auth** — Google OAuth via Auth.js JWT strategy

## Prerequisites

- Node.js 18+
- Python 3.12+
- Docker Desktop
- Anthropic API key
- Google OAuth credentials

## Setup

### 1. Configure environment variables

**`mindframe/.env.local`**
```
NEXTAUTH_SECRET=<random 32-byte hex string>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=<your Google client ID>
GOOGLE_CLIENT_SECRET=<your Google client secret>
```

**`mindframe-api/.env`**
```
DATABASE_URL=postgresql+psycopg://mindframe:mindframe@localhost:5433/mindframe
ANTHROPIC_API_KEY=<your Anthropic API key>
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<same value as NEXTAUTH_SECRET>
```

### 2. Google OAuth

In [Google Cloud Console](https://console.cloud.google.com), create an OAuth 2.0 client and add this authorized redirect URI:
```
http://localhost:3000/api/auth/callback/google
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Backend

```bash
cd mindframe-api
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

API runs at `http://localhost:8000` — docs at `http://localhost:8000/docs`.

### 5. Frontend

```bash
cd mindframe
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Architecture

```
mindframe/              Next.js frontend
  app/                  App Router pages and API routes
  lib/auth.ts           Auth.js config (Google OAuth, JWT strategy)
  lib/api.ts            Typed fetch wrapper for all FastAPI calls
  middleware.ts         Route protection — redirects unauthenticated users

mindframe-api/          FastAPI backend
  routers/              HTTP route handlers
  services/             Claude AI calls (claude_service.py)
  db/models/            SQLAlchemy ORM models
  models/               Pydantic request/response schemas
  alembic/              Database migrations
```

Next.js never writes to the database directly. All data flows through FastAPI, which verifies the JWT on every request using the shared secret (`NEXTAUTH_SECRET` = `JWT_SECRET`).

## Database Migrations

```bash
# From mindframe-api/ with venv activated
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
```
