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

chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh --build

# Reload / restart seotool-caddy if the gateway-caddy compose exists
if [ -f "gateway-caddy/docker-compose.yml" ]; then
  echo "🔄 Reloading seotool-caddy..."
  (cd gateway-caddy && docker compose up -d --force-recreate) 2>/dev/null || docker compose -f gateway-caddy/docker-compose.yml up -d --force-recreate 2>/dev/null || true
fi

echo "✅ Auto-Deploy finished successfully!"
