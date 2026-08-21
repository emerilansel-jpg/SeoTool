#!/bin/sh
# Self-host container entrypoint. vite build inlines the envPrefix'd client
# envs (see vite.config.ts) into the bundle, so the build must run at container
# start. The marketing site is also built here and shared with Caddy via a
# Docker volume.
set -e

echo 'SeoTool.im sends an anonymous usage heartbeat (counts only). Disable: OPENSEO_TELEMETRY_DISABLED=1.'

# ─── Build marketing site (static HTML served by Caddy) ─────────────────
# If web/dist/client/index.html exists (pre-built locally and copied into
# the Docker image via .dockerignore exception), skip the build. Otherwise
# build with DOCKER_BUILD=1 (no Cloudflare plugin, no prerendering).
MARKETING_INDEX="/app/web/dist/client/index.html"
if [ -f "$MARKETING_INDEX" ]; then
  echo "📦 Marketing site already built (pre-built HTML found)."
else
  echo "📦 Building marketing site (no pre-built HTML found)..."
  cd /app/web
  DOCKER_BUILD=1 pnpm run build
  cd /app
  echo "✅ Marketing site built."
fi

# ─── Preflight ──────────────────────────────────────────────────────────
# Validates env BEFORE the slow steps, so misconfiguration fails in seconds
# with the exact fix instead of after a multi-minute build.
pnpm exec tsx scripts/selfhost-preflight.ts

# Run the correct migration based on the database provider. D1 is the default
# (local SQLite); Postgres is used for hosted SaaS deployments.
if [ "${DATABASE_PROVIDER:-}" = "postgres" ]; then
  echo "Running Postgres migrations..."
  pnpm run db:migrate:pg
else
  echo "Running D1 (SQLite) migrations..."
  pnpm run db:migrate:local
fi

# Build client + server to ensure latest code, CSS, and assets are compiled
echo "Building client + server..."
pnpm run build

exec pnpm exec vite preview --host 0.0.0.0 --port "${PORT:-3001}"
