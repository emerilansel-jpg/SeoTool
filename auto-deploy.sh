#!/bin/bash
# auto-deploy.sh
# Dipanggil oleh GitHub Action atau manual untuk update VPS.

set -e

cd /home/seotool/JetDigitalSEO

echo "🚀 Starting Auto-Deploy..."

# Backup .env.hosted (contains secrets that should never be in git).
# Caddyfile is now version-controlled with the real domain, so it does
# NOT need to be preserved across git pulls.
cp .env.hosted .env.hosted.bak 2>/dev/null || true

echo "📥 Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# Restore .env.hosted
cp .env.hosted.bak .env.hosted 2>/dev/null || true
rm -f .env.hosted.bak

# Run via bash: the checkout may contain root-owned files (from past root
# logins) that the seotool user cannot chmod.
bash scripts/deploy-vps.sh --build

# Apply pending Postgres migrations inside the freshly built container.
# The entrypoint deliberately skips runtime migrations (drizzle-kit can
# exit non-zero on journal mismatches), so they run here instead, after
# the container is up, as a logged but non-fatal step.
echo "🗄️  Applying Postgres migrations..."
bash scripts/migrate-pg.sh \
  || echo "⚠️  Postgres migration step failed or was skipped (see logs above)."

# Reload / restart seotool-caddy if the gateway-caddy compose exists
if [ -f "gateway-caddy/docker-compose.yml" ]; then
  echo "🔄 Reloading seotool-caddy..."
  (cd gateway-caddy && docker compose up -d --force-recreate) 2>/dev/null || docker compose -f gateway-caddy/docker-compose.yml up -d --force-recreate 2>/dev/null || true
fi

echo "🩺 Post-deploy diagnostics..."
echo "--- container errors (10m) ---"
docker logs open-seo --since 10m 2>&1 | grep -iE "error|cannot|failed" | tail -15 || echo "(none)"
echo "--- app asset dir ---"
docker compose -f docker-compose.hosted.yaml --env-file .env.hosted exec -T open-seo sh -c \
  'ls /app/dist/client/assets 2>/dev/null | head -5; ls /app/.output/public/assets 2>/dev/null | head -5' || true
echo "--- SSR HTML asset refs (direct :3001) ---"
curl -s --max-time 10 http://127.0.0.1:3001/ | grep -oE '/assets/[^"]+\.(js|css)' | head -6 || echo "(no refs)"
echo "--- end diagnostics ---"

echo "✅ Auto-Deploy finished successfully!"
