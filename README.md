# MindFrame

A personal journaling app with AI-powered reflection. Write free-text entries, track your mood, and let an LLM (Claude by default) surface emotional patterns, insights, and tailored mental-wellness exercises based on your entries. Over time, the app turns a pile of journal entries into a readable picture of how you think.

## Features

- **Journaling** — write how you felt during the day — can't think of anything to write? Get suggested prompts to start brainstorming.
- **AI analysis** — each entry is classified for cognitive distortions *and* positive strengths in your thoughts, not just sentiment. Analysis runs in the background after you save, so writing never waits on the model.
- **Safety first** — if an entry reads as an acute crisis, the app shows support resources (988 Suicide & Crisis Lifeline) instead of a list of "distortions."
- **Exercises** — AI-recommended mental-wellness exercises to help your mood, based on your recent journaling
- **Dashboard** — a calm overview: today's check-in, an emotion word cloud, your most frequent distortions and strengths, a suggested exercise, and recent entries
- **Insights** — *(in progress)* a dedicated page for longer-term patterns across your entries
- **Cost and latency tracking** — every model call is logged with its token counts, latency and USD cost, so you can see what each feature costs to run — never with the entry text.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, Biome |
| Backend | Python, FastAPI, SQLAlchemy 2, Alembic, Pydantic 2, uv |
| Database | PostgreSQL 16 (Docker), SQLAlchemy (ORM), Alembic (migrations) |
| AI | LiteLLM → Anthropic Claude (Sonnet 5.5 for analysis, Haiku 5.5 for exercises by default); OpenAI models are configurable |
| Auth | Auth.js v5 (NextAuth), Google OAuth |

## Repository Structure

```
.
├── mindframe/          # Next.js frontend
│   ├── app/            # App Router pages (dashboard, journal, insights, exercises)
│   ├── components/     # UI components (shadcn primitives in components/ui/)
│   ├── lib/            # apiFetch, Auth.js config, shared utilities
│   └── proxy.ts        # Redirects signed-out users to the landing page
├── mindframe-api/      # FastAPI backend
│   ├── routers/        # HTTP handlers (dashboard, journal, exercises)
│   ├── services/       # Business logic, incl. all LLM calls (llm_service.py)
│   ├── db/models/      # SQLAlchemy ORM models
│   ├── models/         # Pydantic request/response schemas
│   ├── alembic/        # Database migrations
│   └── sql/            # Reporting queries (LLM cost and latency)
└── docker-compose.yml  # PostgreSQL only
```

## Getting Started

### Prerequisites

- Node.js and pnpm 11 (versions pinned in `mindframe/package.json`: Volta pins Node 26.3.0, `packageManager` pins pnpm)
- Python 3.11+ and [uv](https://docs.astral.sh/uv/)
- Docker (for PostgreSQL)
- A Google OAuth client (for sign-in), with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
- An Anthropic API key

### 1. Start the database

```bash
docker compose up -d
```
This runs PostgreSQL 16 in a container on **localhost:5433** (user, password and database are all `mindframe`).

### 2. Backend

Create `mindframe-api/.env` first — migrations and the API both read `DATABASE_URL` from it:

```env
DATABASE_URL=postgresql+psycopg://mindframe:mindframe@localhost:5433/mindframe
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<must match AUTH_SECRET>
```

Then:

```bash
cd mindframe-api
 
# Install dependencies — uv creates and manages the virtual environment for you
uv sync
 
# Apply database migrations
uv run alembic upgrade head
 
# Run the API
uv run uvicorn main:app --reload   # http://localhost:8000 — GET /health returns {"status":"ok"}
```
> Uses [uv](https://docs.astral.sh/uv/) for dependency management. `uv run` executes
> commands inside the project environment and syncs it with `uv.lock` first — no manual
> activate step. Running an activated `.venv` directly skips that sync, so prefer `uv run`.

### 3. Frontend

Create `mindframe/.env.local`. Auth.js v5 reads its `AUTH_*` variables automatically:

```env
AUTH_SECRET=<must match JWT_SECRET>    # e.g. openssl rand -base64 32
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

Then:

```bash
cd mindframe
pnpm install
pnpm dev                         # http://localhost:3000
```

## Configuration

Optional backend settings in `mindframe-api/.env`:

| Variable | Default | Notes |
|---|---|---|
| `LLM_ANALYZE_MODEL` | `anthropic/claude-sonnet-5-5` | Model for entry analysis, as a `<provider>/<model>` LiteLLM id (`anthropic/` or `openai/`). |
| `LLM_RECOMMEND_MODEL` | `anthropic/claude-haiku-5-5` | Model for exercise recommendations, same format. |
| `OPENAI_API_KEY` | — | Required once either model points at `openai/`. |

Costs are computed from the price table `PRICES_PER_MTOK` in `mindframe-api/services/llm_service.py`. When you switch to a model that isn't listed there, add it, or its calls are logged without a cost.

## Architecture

- **Auth** — Auth.js v5 handles Google OAuth and keeps the session in an encrypted token (JWE) in the `authjs.session-token` cookie. FastAPI decrypts that token on every request using the shared secret (`AUTH_SECRET` = `JWT_SECRET`), so there are no database sessions and Next.js never touches the database directly. The backend creates a user row on a signed-in user's first API request.
- **Data flow** — all frontend data fetching goes through `mindframe/lib/api.ts`, which forwards the session token as a Bearer token and calls FastAPI.
- **AI calls** — isolated in `mindframe-api/services/llm_service.py` (entry analysis and exercise recommendations), which calls the provider through [LiteLLM](https://docs.litellm.ai/) with structured outputs. Saving an entry returns immediately; analysis runs as a background task and moves the entry from `pending` to `complete` or `failed`.
- **Cost tracking** — each model call attempt, retries and failures included, writes a row to the `llm_calls` table: task, model, status, tokens (uncached, prompt-cache read/write, output), latency and USD cost. No entry text is stored there. For per-task cost and p50/p95 latency over the last 7 days (from the repo root):

  ```bash
  docker compose exec -T db psql -U mindframe -d mindframe < mindframe-api/sql/llm_call_stats.sql
  ```

- **Migrations** — Alembic owns the schema. After changing ORM models (from `mindframe-api/`):

  ```bash
  uv run alembic revision --autogenerate -m "description"
  uv run alembic upgrade head
  ```

## Development

Frontend (from `mindframe/`):

```bash
pnpm check               # Biome lint + formatting
pnpm check:fix           # Biome with auto-fix
pnpm exec tsc --noEmit   # Typecheck
pnpm build               # Production build
```

Backend (from `mindframe-api/`):

```bash
uv run alembic check     # Confirm ORM models and migrations agree
```

Contributor and AI-agent conventions (branching, commits, code style, service boundaries) live in [AGENTS.md](AGENTS.md); the design system is in [DESIGN.md](DESIGN.md).

## License
 
Released under the [MIT License](LICENSE).
