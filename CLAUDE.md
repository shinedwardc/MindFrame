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

## Code Style (TypeScript / React)

- **Arrow functions only** — never `function` declarations. Use `const Foo = () => {}` for components and `const bar = () => {}` for utilities.
- **`export default` at the bottom** — define the component/function first, export on the last line. Never `export default function` inline.
- This applies to all new files in `mindframe/`. Existing files don't need to be retrofitted unless already being edited.

```ts
// ✅
const getDailyPrompt = (): string => { ... };
export default getDailyPrompt;

// ✅
const JournalPage = () => { ... };
export default JournalPage;

// ❌
export default function JournalPage() { ... }
function getDailyPrompt() { ... }
```

## Frontend Design System

MindFrame uses a **"Grounded Warmth"** aesthetic — calm, literary, and deeply personal. The opposite of clinical.

### Fonts
- **`font-heading`** (Fraunces) — variable-axis old-style serif. Use for page titles, section headers, journal prompts, empty-state messages. Distinctive and warm.
- **`font-sans`** (DM Sans) — humanist geometric sans. Use for all body copy, UI labels, inputs, metadata.
- Large display: `text-4xl font-light tracking-tight font-heading` — editorial, not heavy
- Section heads: `text-xl font-medium font-heading`
- Never `font-bold` on Fraunces at large sizes — it kills the warmth
- Never use Inter, Roboto, or system fonts

### Brand Colors (Tailwind tokens)
- `brand-500` (#5a8a6c) — muted sage green. Primary actions, active states, accents.
- `brand-100` / `brand-50` — soft sage washes. Badges, chips, tinted backgrounds.
- `brand-700` — pressed/hover state for `brand-500` elements.
- `bg-surface` (#F5F3F0) — warm parchment. Use for elevated panels, sidebar, card backgrounds.
- `bg-background` — warm near-white page base. Never use raw `white` or `#fff`.

### Semantic Usage
- `text-muted-foreground` — use liberally for secondary info, timestamps, labels. Creates breathing room.
- `bg-accent` — subtle sage tint. Use for hover states on nav items, highlighted rows.
- `border-border` — warm stone. Use on all dividers and input outlines.
- `text-destructive` — only for actual error states. Never for emphasis.

### Layout Principles
- Spacing should feel intentional, not excessive — aim for `gap-6` between sections, `gap-4` within a section
- Prefer `py-8` for page sections; `py-6` for compact/inner sections; `py-4` for tight UI groups
- `space-y-6` between stacked content blocks; `space-y-3` within a card or panel
- Journal entries are flowing **text experiences**, not card thumbnails — full width, readable type
- Avoid uniform card grids (3 equal-width cards per row is the most predictable pattern — don't do it)
- Use asymmetric or variable-width layouts; mix `col-span` sizes in grids
- Empty states: centered, Fraunces italic, moderate padding (`py-12`) — intentional but not cavernous

### Backgrounds
- Create atmosphere and depth — never default to a flat solid color on large surfaces
- Layer subtle gradients over `bg-background` or `bg-surface`: e.g. `bg-gradient-to-b from-background to-brand-50/40` for a gentle sage wash at the bottom of a page
- Use radial gradients behind hero sections or empty states: `bg-[radial-gradient(ellipse_at_top,_var(--color-brand-50)_0%,_transparent_70%)]`
- Sidebar and panels: `bg-surface` with a faint inner border or very soft box shadow to lift them from the page
- Avoid: flat `bg-white`, flat `bg-background` with no variation, aggressive gradients or dark overlays

### Motion
- Use animations for effects and micro-interactions — but sparingly. One well-placed animation is better than ten scattered ones.
- Page/section entry: fade-in with staggered `animation-delay` on child elements (e.g. 0ms, 75ms, 150ms). Use `tw-animate-css` utilities already in the project.
- Hover states: `transition-colors duration-300` for color shifts; `transition-opacity duration-200` for reveal effects
- Subtle scale on interactive cards: `hover:scale-[1.01] transition-transform duration-300` — never more than 1–2%
- Loading skeletons: `animate-pulse` on `bg-muted` placeholders
- Duration: 200ms–400ms for intentional actions; 150ms for hover feedback. Never instant (0ms) for visible state changes.
- No spring physics, no bounce easings, no scale > 1.02 on click, no full-screen transitions

### What NOT to Build
- No red badges, notification dots, or urgency indicators (creates anxiety)
- No gamification: streak flames, XP bars, level-up animations, leaderboards
- No dense information panels — 2–3 key metrics max per section
- No `rounded-none` or `rounded-sm` on visible surfaces — minimum `rounded-md`
- No pure white backgrounds (`#fff`) — always use `bg-surface` or `bg-background`
- No generic "3 icon cards in a row" stat layouts — find a more editorial arrangement
