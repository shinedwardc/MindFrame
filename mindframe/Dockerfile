# syntax=docker/dockerfile:1

# Build targets:
#   --target dev     next dev, devDeps present, source bind-mounted by compose
#   --target runner  standalone production bundle, non-root, no toolchain

# ---------------------------------------------------------------- base ----
FROM node:26-alpine AS base
# Next.js' standalone server and sharp expect glibc symbols that musl lacks.
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1
# Node 26 images no longer bundle corepack, so pnpm is installed directly.
# Keep this pinned to the "packageManager" field in package.json.
RUN npm install -g pnpm@11.8.0
WORKDIR /app

# ---------------------------------------------------------------- deps ----
# Only the manifests are copied, so this layer is reused across source edits.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# strictDepBuilds=false: pnpm 11 fails the install when sharp and
# unrs-resolver skip their build scripts, and the onlyBuiltDependencies
# allowlist in pnpm-workspace.yaml does not suppress it. Skipping is safe
# here -- both ship prebuilt musl binaries as optional deps
# (@img/sharp-linuxmusl-x64, @img/sharp-libvips-linuxmusl-x64), which the
# build script would only be needed to compile from source.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store \
        --config.strictDepBuilds=false

# ----------------------------------------------------------------- dev ----
# Stops here for local work: devDeps intact, no source baked in — compose
# bind-mounts the host directory over /app at run time.
FROM deps AS dev
EXPOSE 3000
CMD ["pnpm", "dev"]

# ------------------------------------------------------------- builder ----
FROM deps AS builder
COPY . .
RUN pnpm build

# -------------------------------------------------------------- runner ----
# Carries only the standalone output — no pnpm store, no devDeps, no source.
# Not FROM base: the runtime needs neither pnpm nor the build toolchain.
FROM node:26-alpine AS runner
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# `output: 'standalone'` emits a self-contained server.js plus a pruned
# node_modules; static assets are not included and must be copied alongside.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
# Without HOSTNAME the standalone server binds 127.0.0.1 inside the container
# and the published port answers nothing.
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
