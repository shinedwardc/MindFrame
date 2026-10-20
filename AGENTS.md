# AGENTS.md

Working agreement for AI agents (and humans) contributing to **MindFrame** — a personal
journaling app with AI-powered reflection. This is the canonical guidance file for this repo;
tool-specific files (`CLAUDE.md`) just point here. It links out to one deeper doc rather than
repeating it:

- **[DESIGN.md](DESIGN.md)** — the "Grounded Warmth" design system. **Authoritative for any UI work.**

The guiding principle of the whole project: **a journal entry is the most private thing a user
will type into this app — treat it that way in every line of code.** Don't log entry content,
don't widen what leaves `mindframe-api`, and don't make the app depend on the model being right
or even available: the AI isolation in §5 exists so reflection (insights, exercises) can degrade
or fail without taking journaling itself down.

---

## 1. Repository structure

Monorepo with two services:

| Path | Responsibility |
|---|---|
| `mindframe/` | Next.js 16 frontend (App Router, Tailwind, Auth.js v5). |
| `mindframe-api/` | FastAPI backend (SQLAlchemy, Alembic, LiteLLM → Anthropic/OpenAI), managed with uv. |
| `docker-compose.yml` | PostgreSQL 16 only, on host port **5433** — both app servers run natively, not in containers. |

Within those:

| Path | Responsibility |
|---|---|
| `mindframe/app/` | App Router — pages and the single NextAuth API route. Signed-in pages live under `app/(app)/`. |
| `mindframe/components/ui/` | shadcn-generated primitives (see `components.json`) — regenerate with the shadcn CLI rather than hand-restyling. |
| `mindframe/lib/api.ts` | The only place that calls FastAPI — forwards the session token, hits `NEXT_PUBLIC_API_URL`. |
| `mindframe/lib/auth.ts` | Auth.js v5 config (Google provider, JWT session strategy). |
| `mindframe/proxy.ts` | Edge proxy (Next.js 16's renamed Middleware) — gates every non-public route on a valid session. |
| `mindframe-api/auth.py` | Decrypts the Auth.js session token; `get_current_user_id` dependency; creates the `users` row on first request. |
| `mindframe-api/routers/` | HTTP handlers only — validate input, delegate to services, return Pydantic models. |
| `mindframe-api/services/llm_service.py` | All LLM calls isolated here (see §5); calls Anthropic/OpenAI through LiteLLM (`litellm.acompletion`) and logs each attempt to `llm_calls`. |
| `mindframe-api/services/dashboard_service.py` | Dashboard aggregations behind `routers/dashboard.py`. |
| `mindframe-api/db/models/` | SQLAlchemy ORM models — source of truth for schema. |
| `mindframe-api/models/` | Pydantic request/response schemas — kept separate from ORM models on purpose. |
| `mindframe-api/db/session.py` | `get_db()` dependency injected into every route that needs DB access; `SessionLocal` for code outside a request (background tasks, call logging). |
| `mindframe-api/sql/` | `llm_call_stats.sql` (real-user cost and p50/p95 latency per task) and `eval_run_stats.sql` (the same for one eval run). |

Import alias: `@/*` maps to the `mindframe/` root (see `mindframe/tsconfig.json`).

---

## 2. Dev commands

### Start Postgres (repo root)
```bash
docker compose up -d     # postgres:16 on localhost:5433, user/password/db all "mindframe"
```

### Frontend (`mindframe/`) — pnpm 11 (pinned via `packageManager`), Node 26 (Volta)
```bash
pnpm install --frozen-lockfile
pnpm dev                 # http://localhost:3000
pnpm build               # production build; needs no env file
pnpm exec tsc --noEmit   # typecheck (no script for it)
pnpm lint                # Biome lint rules only
pnpm check               # Biome lint + formatting
pnpm check:fix           # apply Biome's safe fixes and formatting
```

`pnpm lint` and `pnpm check` currently **exit 1 on `main`** from pre-existing issues — two
`lint/suspicious/noArrayIndexKey` errors in `app/(app)/journal/entries/[id]/_components/AnalysisPanel.tsx`
and a formatting error in `lib/utils.ts`. Don't treat those as caused by your change, and don't
fix them in an unrelated PR; just don't add new ones.

### Backend (`mindframe-api/`) — uv (`pyproject.toml` + `uv.lock`), Python ≥ 3.11
```bash
uv sync                              # create/refresh .venv from uv.lock
uv run uvicorn main:app --reload     # http://localhost:8000 (GET /health → {"status":"ok"})
uv add <package>                     # add a dependency (updates pyproject.toml and uv.lock)
```

There is no `requirements.txt` and no pip workflow. Prefix every backend command with `uv run`:
it syncs `.venv` first. Running `.venv/bin/python` or an activated venv directly skips the sync
and fails with `ModuleNotFoundError` when `uv.lock` has moved on (e.g. `litellm`).

### Database migrations (run from `mindframe-api/`)
```bash
uv run alembic revision --autogenerate -m "description"
uv run alembic upgrade head
uv run alembic downgrade -1
uv run alembic check       # confirms the ORM models and migrations agree
```

When adding a new ORM model, import it in `db/models/__init__.py` and `alembic/env.py` so
Alembic detects it during `--autogenerate`. `alembic/env.py` and `db/session.py` read
`DATABASE_URL` (from `.env`, overridable in the environment) — point it at a throwaway database
when you want to test a migration without touching dev data.

---

## 3. Architecture

**Auth flow** — Auth.js v5 handles login via Google OAuth with the JWT session strategy (no
database session). The session lives in the `authjs.session-token` cookie as an **encrypted JWE**
(`dir` + `A256CBC-HS512`), not a signed JWT. `mindframe-api/auth.py` decrypts it with a key
derived from the shared secret via HKDF-SHA256, replicating Auth.js's key derivation —
`AUTH_SECRET` (frontend) and `JWT_SECRET` (backend) must be identical. The backend identifies
users by the token's `email` claim and creates the `users` row on first request. Next.js never
writes to the database directly.

**Next.js → FastAPI communication** — all data fetching goes through `mindframe/lib/api.ts`
(`apiFetch`), which reads the raw `authjs.session-token` cookie server-side, sends it as a
Bearer token, and calls FastAPI at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).
Next.js has no direct database access.

**Entry analysis** — `POST /journal/` saves the entry with `analysis_status = "pending"` and
returns immediately; a FastAPI `BackgroundTask` (`_run_analysis` in `routers/journal.py`) then
calls `analyze_journal_entry` and `recommend_exercises` and sets the status to `complete` or
`failed`. A failed analysis must never lose the entry itself.

**LLM call logging** — every `litellm.acompletion` attempt (retries and failures included)
writes one `llm_calls` row: task, model, status, input and output tokens, latency, and
`cost_usd` priced from `PRICES_PER_MTOK` in `llm_service.py`. Prompt caching is deliberately
off (entries arrive far more than 5 minutes apart, so cache writes never pay back).
`eval_run_id` separates eval traffic: the eval runner passes it to `analyze_journal_entry` /
`recommend_exercises`; routers never do, so real-user rows keep it NULL. Never pass it from a
router, and filter on `eval_run_id IS NULL` for real-user numbers.
Rows hold numbers and labels only — never prompt or response text. A failed log write is
swallowed with a warning so it can't fail the analysis.

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

There is no `.env.example`; these are the names the code reads.

`mindframe/.env.local` — Auth.js v5 picks up its `AUTH_*` variables automatically:
`AUTH_SECRET`, `AUTH_URL` (e.g. `http://localhost:3000`), `AUTH_GOOGLE_ID`,
`AUTH_GOOGLE_SECRET`, plus `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8000`). The older
`NEXTAUTH_*` / `GOOGLE_CLIENT_*` names are not used.

`mindframe-api/.env` — `DATABASE_URL`
(`postgresql+psycopg://mindframe:mindframe@localhost:5433/mindframe` for the compose database),
`ANTHROPIC_API_KEY`, `FRONTEND_URL`, `JWT_SECRET` (must equal `AUTH_SECRET`). Optional:
`LLM_ANALYZE_MODEL` / `LLM_RECOMMEND_MODEL` pick the model per call as a `<provider>/<model>`
LiteLLM id (defaults `anthropic/claude-sonnet-5-5` /
`anthropic/claude-haiku-5-5`; `anthropic/` and `openai/` are supported), and
`OPENAI_API_KEY` is required once either points at `openai/`. Every model attempt is logged to
the `llm_calls` table and priced from `PRICES_PER_MTOK` in `llm_service.py`; add an entry
whenever you point either variable at a new model, or its rows get `cost_usd` NULL.

Never commit either file or print a provider API key / `JWT_SECRET` in logs — and never log
journal entry content, per the guiding principle above.

---

## 5. The rule that matters most: don't cross the service boundary

Two boundaries are load-bearing and routinely tempting to shortcut:

- **Next.js never touches Postgres.** All data access goes through `mindframe/lib/api.ts`,
  which forwards the session token and calls FastAPI. Don't add a direct DB client to the frontend, ever.
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
  unless already being edited. shadcn-generated files in `components/ui/` are exempt — leave
  their `function` declarations as generated.

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

Biome does **not** enforce these two rules — they're kept by review. Biome
(`mindframe/biome.json`) enforces formatting (tabs, 100-column lines, single quotes in JS/TS,
double quotes in JSX, semicolons, ES5 trailing commas), import organizing, and its recommended
lint rules plus a few overrides. Biome is the only linter and formatter in the frontend — there is no ESLint (Next.js 16 removed
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

Until then, verify changes with what does exist: `pnpm exec tsc --noEmit` and `pnpm build` for
the frontend; for the backend, `uv run uvicorn main:app` plus `GET /health`, and
`uv run alembic upgrade head` / `downgrade -1` / `check` for schema changes.

---

## 9. Conventions for agents

- **Read before you write.** Open the file you're changing; match its idiom.
- **Respect the service boundary in §5** before any other convention in this file.
- **Stay in your lane on UI.** Any visual change follows DESIGN.md exactly — Fraunces for
  editorial moments, DM Sans for everything else, no pure white, no gamification.
- **Don't introduce dependencies casually** in either service — justify any new package.
- **Committing and pushing directly to `main` is allowed.** Use a branch (named per §10) and a
  PR when you want review. Run `pnpm check` (Biome lint + formatting) before committing
  frontend changes and make sure it reports nothing beyond the pre-existing issues listed in §2.

---

## 10. Branch naming

Branches follow **[Conventional Branch 1.1.0](https://conventionalbranch.org)**. Direct
commits to `main` are allowed (§9); when you do branch, branch off `main`. Format:

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

---

## 12. Known gotchas

- **LiteLLM's cost map prices unknown models at $0.** `litellm.cost_per_token` returns
  `(0.0, 0.0)` instead of raising for models it doesn't know (Claude 5.5 on LiteLLM 1.103.3).
  Price calls from `PRICES_PER_MTOK`, never from LiteLLM's map.
- **LiteLLM doesn't know the Claude 5.5 models yet.** For `anthropic/` models `llm_service.py`
  sends `output_config` directly instead of `response_format`, which LiteLLM would otherwise
  turn into an unforced tool call. Keep that branch when touching `_provider_kwargs`.
- **`LITELLM_LOCAL_MODEL_COST_MAP=True` is set before `import litellm`** so importing it doesn't
  fetch the cost map from GitHub. Keep the import order in `llm_service.py`.
- **The session cookie name is hardcoded** as `authjs.session-token` in `lib/api.ts` and
  `auth.py` (it is also the HKDF salt). Auth.js prefixes it with `__Secure-` when served over
  HTTPS, so both places need updating before an HTTPS deploy.
- **`POST /exercises/recommend` has no auth dependency.** Anyone who can reach the API can trigger
  paid model calls through it; its calls do show up in `llm_calls`.
- **`next-env.d.ts` is generated and gitignored** — `pnpm dev` / `pnpm build` rewrite it; don't
  commit it.
