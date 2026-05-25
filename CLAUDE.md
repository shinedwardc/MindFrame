# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Monorepo with two services:
- `mindframe/` — Next.js 16 frontend (App Router, Tailwind, Auth.js v5)
- `mindframe-api/` — FastAPI backend (SQLAlchemy, Alembic, OpenAI GPT-4o)
- `docker-compose.yml` — PostgreSQL 16 only; both app servers run natively

## Dev Commands

### Start Postgres
```bash
docker compose up -d
```

### Frontend (mindframe/)
```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

### Backend (mindframe-api/)
```bash
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload    # http://localhost:8000
```

### Database Migrations (run from mindframe-api/)
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
```

## Architecture

### Auth Flow
NextAuth (Auth.js v5) handles login via Google OAuth and issues a **JWT stored in a cookie** (no database session). FastAPI verifies that JWT on every request using the shared secret (`NEXTAUTH_SECRET` = `JWT_SECRET`). Next.js never writes to the database directly.

### Next.js → FastAPI Communication
All data fetching goes through `mindframe/lib/api.ts` (`apiFetch`), which reads the server-side session, attaches the JWT as a Bearer token, and calls FastAPI at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Next.js has no direct database access.

### FastAPI Layers
- `routers/` — HTTP handlers only; delegate to services
- `services/openai_service.py` — all GPT-4o calls isolated here; uses `AsyncOpenAI`
- `db/models/` — SQLAlchemy ORM models (source of truth for schema)
- `models/` — Pydantic request/response schemas (separate from ORM models)
- `db/session.py` — `get_db()` dependency injected into every route that needs DB access

### Database
Alembic owns all migrations. ORM models live in `mindframe-api/db/models/`. When adding a new model, import it in `db/models/__init__.py` and `alembic/env.py` so Alembic detects it during `--autogenerate`.

### Middleware
- **FastAPI**: `CORSMiddleware` in `main.py` — trusts only `FRONTEND_URL`
- **Next.js**: `middleware.ts` at root — redirects unauthenticated users to `/` before any page renders

## Environment Variables

`mindframe/.env.local` — `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

`mindframe-api/.env` — `DATABASE_URL`, `OPENAI_API_KEY`, `FRONTEND_URL`, `JWT_SECRET` (must match `NEXTAUTH_SECRET`)

## Current TODOs
- `routers/journal.py` has `user_id=1` hardcoded — needs JWT extraction middleware in FastAPI
- `next-auth` version may need updating for Next.js 16 compatibility — check peer dep warnings after `npm install`
