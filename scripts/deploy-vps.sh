#!/usr/bin/env bash
# Deploy SeoTool.im hosted SaaS to a VPS.
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - .env.hosted file configured (see .env.hosted.example)
#   - Caddyfile updated with your domain name
#   - DNS A record pointing to this server's IP
#
# Usage:
#   ./scripts/deploy-vps.sh [--build]
#
# The --build flag forces a rebuild of the Docker image.
# The marketing site is built inside the open-seo container at startup.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE_FILE="docker-compose.hosted.yaml"
ENV_FILE=".env.hosted"

# ─── Pre-flight checks ──────────────────────────────────────────────────

echo "🔍 Running pre-flight checks..."

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Copy .env.hosted.example to $ENV_FILE and fill in the values."
  exit 1
fi

if grep -q "replace-with" "$ENV_FILE"; then
  echo "❌ $ENV_FILE contains placeholder values (replace-with-...). Fill in real values first."
  exit 1
fi

if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Install it first: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose v2 is not installed. Install it: https://docs.docker.com/compose/install/"
  exit 1
fi

echo "✅ Pre-flight checks passed."

# ─── Build (optional) ───────────────────────────────────────────────────

BUILD_FLAG=""
if [ "${1:-}" = "--build" ]; then
  echo "🔨 Building Docker image..."
  BUILD_FLAG="--build"
fi

# ─── Deploy ─────────────────────────────────────────────────────────────

echo "🚀 Starting SeoTool.im hosted stack..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d $BUILD_FLAG

echo ""
echo "⏳ Waiting for services to start..."

# Wait for the app to be healthy (up to 5 minutes for first build)
MAX_WAIT=300
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose -f "$COMPOSE_FILE" ps -q open-seo 2>/dev/null)" 2>/dev/null || echo "starting")
  if [ "$HEALTH" = "healthy" ]; then
    echo "✅ SeoTool.im is healthy!"
    break
  fi
  sleep 10
  WAITED=$((WAITED + 10))
  echo "   ...waiting (${WAITED}s elapsed, status: $HEALTH)"
done

if [ "$HEALTH" != "healthy" ]; then
  echo "⚠️  SeoTool.im hasn't become healthy after ${MAX_WAIT}s."
  echo "   Check logs: docker compose -f $COMPOSE_FILE logs open-seo"
  exit 1
fi

# ─── Reload Caddy ───────────────────────────────────────────────────────
if [ -f "gateway-caddy/docker-compose.yml" ]; then
  echo "🔄 Reloading seotool-caddy..."
  (cd gateway-caddy && docker compose up -d --force-recreate) 2>/dev/null || docker compose -f gateway-caddy/docker-compose.yml restart seotool-caddy 2>/dev/null || true
fi

# ─── Summary ────────────────────────────────────────────────────────────

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "   App:     https://seotool.im"
echo "   Health:  curl http://localhost:3001/api/health"
echo ""
echo "   Useful commands:"
echo "     Logs:        docker compose -f $COMPOSE_FILE logs -f open-seo"
echo "     Restart:     docker compose -f $COMPOSE_FILE restart open-seo"
echo "     Stop:        docker compose -f $COMPOSE_FILE down"
echo "     Update:      git pull && ./scripts/deploy-vps.sh --build"
