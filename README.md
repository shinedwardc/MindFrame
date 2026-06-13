# MindFrame

A personal journaling app with AI-powered reflection. Write free-text entries, track your mood, and let Claude surface emotional patterns, insights, and tailored mental-wellness exercises based on your entries. Over time, the app turns a pile of journal entries into a readable picture of how you think.

## Features

- **Journaling** — write how you felt during the day — can't think of anything to write? Get suggested prompts to start brainstorming.
- **AI analysis** — each entry is classified for cognitive distortions *and* positive strengths in your thoughts, not just sentiment.
- **Insights** — visualize recurring mood keywords across your entries for the week
- **Exercises** — AI-recommended mental-wellness exercises to help your mood, based on your recent journaling
- **Dashboard** — a calm overview of your recent activity

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Python, FastAPI, SQLAlchemy 2, Alembic, Pydantic 2 |
| Database | PostgreSQL 16 (Docker), SQLAlchemy (ORM), Alembic (migrations) |
| AI | Anthropic Claude (Sonnet 4.6 / Haiku 4.5) |
| Auth | Auth.js v5 (NextAuth), Google OAuth |

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
This runs PostgreSQL 16 in a container

### 2. Backend

```bash
cd mindframe-api
 
# Install dependencies — uv creates and manages the virtual environment for you
uv sync
 
# Apply database migrations
uv run alembic upgrade head
 
# Run the API
uv run uvicorn app.main:app --reload
```
> Uses [uv](https://docs.astral.sh/uv/) for dependency management. `uv run` executes
> commands inside the project environment automatically — no manual activate step.
> (If the project uses `requirements.txt` rather than `pyproject.toml`, swap `uv sync`
> for `uv venv && uv pip install -r requirements.txt`.)

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
npm run check        # Biome
npm run check:fix    # Biome with auto-fix
npm run build        # Production build
```

## License
 
Released under the [MIT License](LICENSE).