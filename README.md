# MindFrame

A personal journaling app with AI-powered reflection. Write entries, track your mood, and let Claude surface emotional patterns, insights, and tailored mental-wellness exercises based on your entries.

## Features

- **Journaling** — daily prompts and free-form entries with mood tracking
- **AI analysis** — each entry is analyzed by Claude for themes and emotional patterns
- **Insights** — visualize recurring patterns across your entries
- **Exercises** — AI-recommended mental-wellness exercises based on your recent journaling
- **Dashboard** — a calm overview of your recent activity

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, Auth.js v5 |
| Backend | FastAPI, SQLAlchemy 2, Alembic, Pydantic 2 |
| Database | PostgreSQL 16 (Docker) |
| AI | Anthropic Claude (Sonnet 4.6 / Haiku 4.5) |
| Auth | Google OAuth via NextAuth, JWT shared with FastAPI |

## Repository Structure

```
.
├── mindframe/          # Next.js frontend
│   ├── app/            # App Router pages (dashboard, journal, insights, exercises)
│   ├── components/     # UI components
│   └── lib/            # apiFetch and shared utilities
├── mindframe-api/      # FastAPI backend
│   ├── routers/        # HTTP handlers (dashboard, journal, exercises)
│   ├── services/       # Business logic, incl. all Claude calls
│   ├── db/models/      # SQLAlchemy ORM models
│   ├── models/         # Pydantic request/response schemas
│   └── alembic/        # Database migrations
└── docker-compose.yml  # PostgreSQL only
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (for PostgreSQL)
- A Google OAuth client (for sign-in)
- An Anthropic API key

### 1. Start the database

```bash
docker compose up -d
```

### 2. Backend

```bash
cd mindframe-api
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload        # http://localhost:8000
```

Create `mindframe-api/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/mindframe
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<must match NEXTAUTH_SECRET>
```

### 3. Frontend

```bash
cd mindframe
npm install
npm run dev                      # http://localhost:3000
```

Create `mindframe/.env.local`:

```env
NEXTAUTH_SECRET=<must match JWT_SECRET>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Architecture

- **Auth** — NextAuth (Auth.js v5) handles Google OAuth and issues a JWT stored in a cookie. FastAPI verifies that JWT on every request using the shared secret, so there are no database sessions and Next.js never touches the database directly.
- **Data flow** — all frontend data fetching goes through `mindframe/lib/api.ts`, which attaches the JWT as a Bearer token and calls FastAPI.
- **AI calls** — isolated in `mindframe-api/services/claude_service.py` (entry analysis and exercise recommendations).
- **Migrations** — Alembic owns the schema. After changing ORM models:

  ```bash
  alembic revision --autogenerate -m "description"
  alembic upgrade head
  ```

## Development

```bash
# Frontend (from mindframe/)
npm run lint         # ESLint
npm run check        # Biome
npm run check:fix    # Biome with auto-fix
npm run build        # Production build
```

API docs are available at http://localhost:8000/docs when the backend is running.
