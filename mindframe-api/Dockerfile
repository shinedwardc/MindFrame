# syntax=docker/dockerfile:1

# Build targets:
#   --target dev     uvicorn --reload, source bind-mounted by compose
#   --target runner  source baked in, non-root, no reloader

# ---------------------------------------------------------------- base ----
FROM python:3.12-slim AS base
# uv ships as a static binary; copying it beats installing it via pip.
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    PYTHONUNBUFFERED=1 \
    PATH=/app/.venv/bin:$PATH
WORKDIR /app

# ---------------------------------------------------------------- deps ----
# pyproject.toml declares no [build-system], so uv treats this as a virtual
# project and syncs dependencies without trying to build the app itself.
FROM base AS deps
COPY pyproject.toml uv.lock ./
# No cache mount, for the same reason as in mindframe/Dockerfile: Railway rejects
# cache ids that aren't tied to its own service ids. --no-cache keeps uv's
# download cache out of the layer, since only the virtualenv is carried forward.
RUN uv sync --frozen --no-install-project --no-cache

# ----------------------------------------------------------------- dev ----
FROM deps AS dev
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# -------------------------------------------------------------- runner ----
# Deliberately FROM base's parent rather than `deps`: the final image needs the
# virtualenv but not uv itself. Ownership is set during COPY, because a
# `RUN chown -R` would rewrite every file into a second, duplicate layer.
FROM python:3.12-slim AS runner
ENV PYTHONUNBUFFERED=1 PATH=/app/.venv/bin:$PATH
WORKDIR /app
RUN useradd --system --uid 1001 mindframe
COPY --from=deps --chown=mindframe:mindframe /app/.venv /app/.venv
COPY --chown=mindframe:mindframe . .
USER mindframe
EXPOSE 8000
# 0.0.0.0, not localhost: uvicorn's default bind is unreachable from outside
# the container regardless of how the port is published. Hosting platforms
# (Railway, Fly, Cloud Run) assign the port through $PORT, so the shell form is
# needed to expand it; exec keeps uvicorn as PID 1 so it receives SIGTERM.
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
