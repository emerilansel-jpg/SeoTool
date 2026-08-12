#!/bin/sh
# Self-host container entrypoint. vite build inlines the envPrefix'd client
# envs (see vite.config.ts) into the bundle, so the build must run at container
# start. The marketing site is also built here and shared with Caddy via a
# Docker volume.
set -e

echo 'SeoTool.im sends an anonymous usage heartbeat (counts only). Disable: OPENSEO_TELEMETRY_DISABLED=1.'

# ─── Build marketing site (static HTML served by Caddy) ─────────────────
echo "📦 Building marketing site..."
cd /app/web
# node_modules already installed at Docker build time; just build.
pnpm run build
cd /app
echo "✅ Marketing site built."

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

# POSTHOG_SOURCEMAPS (CI sourcemap uploads) moves vite's outDir; keep the
# fingerprint marker beside the output it describes.
if [ "${POSTHOG_SOURCEMAPS:-}" = "true" ]; then OUT_DIR=dist-sourcemaps; else OUT_DIR=dist; fi
FP_FILE="$OUT_DIR/.openseo-build-env"

# Everything that changes build output: the envPrefix prefixes from
# vite.config.ts (keep in sync) plus POSTHOG_SOURCEMAPS.
FINGERPRINT="$(env | grep -E '^(VITE_|AUTH_MODE|BYPASS_EMAIL_VERIFICATION|POSTHOG_PUBLIC_KEY|POSTHOG_HOST|TURNSTILE_SITE_KEY|POSTHOG_SOURCEMAPS)' | sort | sha256sum | cut -d' ' -f1)"
# A missing sha256sum would yield an empty, always-matching fingerprint and
# silently disable rebuilds, fail loudly instead.
test -n "$FINGERPRINT"

if [ -f "$FP_FILE" ] && [ "$(cat "$FP_FILE")" = "$FINGERPRINT" ]; then
  echo "Reusing existing SaaS build (build-relevant env unchanged)."
else
  echo "Building client + server (first start, changed build env, or new image)..."
  rm -f "$FP_FILE"
  pnpm run build
  printf '%s' "$FINGERPRINT" > "$FP_FILE"
fi

exec pnpm exec vite preview --host 0.0.0.0 --port "${PORT:-3001}"
