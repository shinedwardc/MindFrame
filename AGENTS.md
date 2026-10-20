# AGENTS.md

Working agreement for AI agents (and humans) contributing to **MindFrame** — a personal
journaling app with AI-powered reflection. This is the canonical guidance file for this repo;
tool-specific files (`CLAUDE.md`) just point here. It links out to one deeper doc rather than
repeating it:

- **[DESIGN.md](DESIGN.md)** — the "Grounded Warmth" design system. **Authoritative for any UI work.**

The guiding principle of the whole project: **a journal entry is the most private thing a user
will type into this app — treat it that way in every line of code.** Don't log entry content,
don't widen what leaves `mindframe-api`, and don't make the app depend on Claude being right or
even available: the AI isolation in §5 exists so reflection (insights, exercises) can degrade
or fail without taking journaling itself down.

---

## 1. Repository structure

Monorepo with two services:

| Path | Responsibility |
|---|---|
| `mindframe/` | Next.js 16 frontend (App Router, Tailwind, Auth.js v5). |
| `mindframe-api/` | FastAPI backend (SQLAlchemy, Alembic, Anthropic Claude). |
| `docker-compose.yml` | PostgreSQL 16 only — both app servers run natively, not in containers. |

Within those:

| Path | Responsibility |
|---|---|
| `mindframe/app/` | App Router — pages and the single NextAuth API route. |
| `mindframe/lib/api.ts` | The only place that calls FastAPI — attaches the JWT, hits `NEXT_PUBLIC_API_URL`. |
| `mindframe/proxy.ts` | Edge proxy (Next.js 16's renamed Middleware) — gates every non-public route on a valid session. |
| `mindframe-api/routers/` | HTTP handlers only — validate input, delegate to services, return Pydantic models. |
| `mindframe-api/services/llm_service.py` | All LLM calls isolated here (see §5); calls Anthropic/OpenAI through LiteLLM (`litellm.acompletion`). |
| `mindframe-api/db/models/` | SQLAlchemy ORM models — source of truth for schema. |
| `mindframe-api/models/` | Pydantic request/response schemas — kept separate from ORM models on purpose. |
| `mindframe-api/db/session.py` | `get_db()` dependency injected into every route that needs DB access. |

Import alias: `@/*` maps to the `mindframe/` root (see `mindframe/tsconfig.json`).

---

## 2. Dev commands

### Start Postgres
```bash
docker compose up -d
```

### Frontend (`mindframe/`)
```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint         # Biome lint rules only
pnpm check        # Biome lint + formatting (check:fix to apply fixes)
```

### Backend (`mindframe-api/`)
```bash
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload    # http://localhost:8000
```

### Database migrations (run from `mindframe-api/`)
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
```

When adding a new ORM model, import it in `db/models/__init__.py` and `alembic/env.py` so
Alembic detects it during `--autogenerate`.

---

## 3. Architecture

**Auth flow** — NextAuth (Auth.js v5) handles login via Google OAuth and issues a **JWT stored
in a cookie** (no database session). FastAPI verifies that JWT on every request using the
shared secret (`NEXTAUTH_SECRET` = `JWT_SECRET`). Next.js never writes to the database directly.

**Next.js → FastAPI communication** — all data fetching goes through `mindframe/lib/api.ts`
(`apiFetch`), which reads the server-side session, attaches the JWT as a Bearer token, and
calls FastAPI at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Next.js has no direct
database access.

**FastAPI layers** — `routers/` are HTTP handlers only and delegate to services;
`services/llm_service.py` isolates all LLM calls; `db/models/` are SQLAlchemy ORM models
(source of truth for schema); `models/` are Pydantic request/response schemas, kept separate
from ORM models.

**Database** — Alembic owns all migrations. ORM models live in `mindframe-api/db/models/`.

**Edge proxy** — `mindframe/proxy.ts` (Next.js 16's renamed Middleware API) redirects
unauthenticated users to `/` before any page renders.

**FastAPI CORS** — `CORSMiddleware` in `main.py` trusts only `FRONTEND_URL`.

---

## 4. Environment variables

`mindframe/.env.local` — `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

`mindframe-api/.env` — `DATABASE_URL`, `ANTHROPIC_API_KEY`, `FRONTEND_URL`, `JWT_SECRET`
(must match `NEXTAUTH_SECRET`). Optional: `LLM_ANALYZE_MODEL` / `LLM_RECOMMEND_MODEL` pick the
model per call as a `<provider>/<model>` LiteLLM id (defaults `anthropic/claude-sonnet-5-5` /
`anthropic/claude-haiku-5-5`; `anthropic/` and `openai/` are supported), and
`OPENAI_API_KEY` is required once either points at `openai/`.

Never commit either file or print a provider API key / `JWT_SECRET` in logs — and never log
journal entry content, per the guiding principle above.

---

## 5. The rule that matters most: don't cross the service boundary

Two boundaries are load-bearing and routinely tempting to shortcut:

- **Next.js never touches Postgres.** All data access goes through `mindframe/lib/api.ts`,
  which attaches the JWT and calls FastAPI. Don't add a direct DB client to the frontend, ever.
- **`mindframe-api/services/llm_service.py` is the only file allowed to call an LLM
  provider or read a provider API key (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).** Routers and
  other services must work in terms of what that file returns, not call the model themselves.

Breaking either boundary is the easiest way to silently reintroduce a security or architecture
bug that the rest of this file's conventions assume doesn't exist.

---

## 6. Code style (TypeScript / React)

- **Arrow functions only** — never `function` declarations. Use `const Foo = () => {}` for
  components and `const bar = () => {}` for utilities.
- **`export default` at the bottom** — define the component/function first, export on the last
  line. Never `export default function` inline.
- This applies to all new files in `mindframe/`. Existing files don't need to be retrofitted
  unless already being edited.

```ts
// ✅
const getDailyPrompt = (): string => { ... };
export default getDailyPrompt;

const JournalPage = () => { ... };
export default JournalPage;

// ❌
export default function JournalPage() { ... }
function getDailyPrompt() { ... }
```

Enforced by Biome (`pnpm check` / `pnpm check:fix` from `mindframe/`) — see `mindframe/biome.json`.
Biome is the only linter and formatter in the frontend — there is no ESLint (Next.js 16 removed
`next lint`), so don't add an ESLint config or `eslint-config-next` back.

**Python** — no linter or formatter is configured yet. Until one is, match what's already
there: routers stay thin (validate → delegate → return), services hold the logic, Pydantic
schemas in `models/` stay separate from the SQLAlchemy classes in `db/models/`. If you're about
to add a formatter (Black, Ruff), raise it with the maintainer first and document the choice —
don't introduce one silently mid-PR.

---

## 7. Frontend design system

See **[DESIGN.md](DESIGN.md)** — authoritative for any UI work. It covers color tokens
(including the brand/mood families and the full semantic OKLch set), typography, shape and
components, layout/spacing, backgrounds, motion, responsive expectations, and the one
sanctioned exception to the "no white, no system fonts" rule (the Google sign-in button).

---

## 8. Testing

There is **no test framework set up** in either service — don't assume one exists or invent
commands. When tests are introduced, mock the LiteLLM call in `llm_service.py` rather than
hitting the live API, and confirm the framework choice with the maintainer before adding a new
dependency.

---

## 9. Conventions for agents

- **Read before you write.** Open the file you're changing; match its idiom.
- **Respect the service boundary in §5** before any other convention in this file.
- **Stay in your lane on UI.** Any visual change follows DESIGN.md exactly — Fraunces for
  editorial moments, DM Sans for everything else, no pure white, no gamification.
- **Don't introduce dependencies casually** in either service — justify any new package.
- **Branch, don't commit to `main` directly.** Name branches per §10. Run `pnpm check` (Biome
  lint + formatting) before committing frontend changes.

---

## 10. Branch naming

Branches follow **[Conventional Branch 1.1.0](https://conventionalbranch.org)**. Never
commit to `main` directly (§9) — always branch off it. Format:

```
<type>/<description>
```

Trunk branches (`main`) carry no prefix. This repo's history so far predates this convention
and uses plain feature names (`dashboard`, `exercises`, `journals`) — that history isn't being
retroactively rewritten; the scheme below applies going forward.

**Prefixes:**

| Prefix | When |
|---|---|
| `feature/` (or `feat/`) | A new feature. |
| `bugfix/` (or `fix/`) | A bug fix. |
| `hotfix/` | An urgent production fix. |
| `release/` | Release prep — version numbers, so dots are allowed here (e.g. `release/v1.2.0`). |
| `chore/` | Everything else — docs, dependencies, config, tooling. |

Conventional Branch's prefix set is narrower than the commit types in §11: work that lands
as a `docs` / `style` / `refactor` / `test` / `ci` commit belongs on a `chore/` branch.
Optional AI-source prefixes (`ai/`, `claude/`, `copilot/`, `cursor/`, `codex/`) are permitted
when authorship matters more than intent, but prefer a purpose prefix above.

**Rules:**

- Lowercase `a-z`, digits `0-9`, and `-` to separate words — no spaces, underscores, or other
  special characters. (Dots only in `release/` version numbers.)
- No consecutive `-` / `.`, and no leading or trailing `-` / `.` in the description.
- Descriptive but concise; include a ticket number when there is one, e.g.
  `feature/issue-123-add-login`.

**Examples:**

```
feature/journal-search
fix/empty-mood-chart
chore/agents-branch-naming
release/v1.2.0
```

---

## 11. Commit conventions

Commits follow **[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)**.
Existing history in this repo is free-form (e.g. `Aggregate pattern types; UI polish and
README update`) — it does **not** follow this today. Going forward, prefer:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types used in this repo:**

| Type | When |
|---|---|
| `feat` | A new feature (→ MINOR in semver). |
| `fix` | A bug fix (→ PATCH). |
| `docs` | Docs only — `README.md`, `DESIGN.md`, `AGENTS.md`. |
| `style` | Formatting / whitespace, no code-meaning change (e.g. a Biome reformat). |
| `refactor` | Code change that neither fixes a bug nor adds a feature. |
| `perf` | A performance improvement. |
| `test` | Adding or fixing tests. |
| `build` | Dependencies, lockfiles, package config. |
| `ci` | CI configuration. |
| `chore` | Anything else that doesn't touch src or tests. |

**Rules:**

- Description is lowercase, imperative mood, no trailing period: `fix: handle empty mood
  entry`, not `Fixed the mood entry.`.
- Scope is optional and names the affected area, e.g. `feat(journal): …`,
  `fix(llm-service): …`, `feat(dashboard): …`.
- **Breaking changes** are marked either with a `!` before the colon (`feat(api)!: …`) **or**
  a `BREAKING CHANGE: <description>` footer (→ MAJOR). The `!` may be used without the footer.
- Footers use git-trailer style, e.g. `Refs: #12`.

**Examples:**

```
feat(journal): add full-text search across entries
fix(dashboard): handle empty mood entry on first login
docs: tighten the README setup steps
build: bump next to 16.1
refactor(llm-service)!: route Claude calls through a retry wrapper

BREAKING CHANGE: llm_service.generate_insight now returns a Result type instead of raising.
```
