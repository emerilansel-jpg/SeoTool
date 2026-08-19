#!/usr/bin/env bash
# Deploy seotool-caddy — dedicated Caddy for seotool.im
# Usage: ./gateway-caddy/deploy.sh [--copy-marketing]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== SeoTool Caddy Deploy ==="

# Step 1: Check if pesat-caddy is using port 443
echo "[1/4] Checking port conflicts..."
if docker ps --format '{{.Names}} {{.Ports}}' | grep -q "pesat-control-plane-caddy.*0.0.0.0:443"; then
    echo "WARNING: pesat-control-plane-caddy-1 is using port 443!"
    echo "Options:"
    echo "  A) Stop it:  docker stop pesat-control-plane-caddy-1"
    echo "  B) Change seotool-caddy port to 4443 in gateway-caddy/docker-compose.yml"
    echo "     and configure Cloudflare origin rule for port 4443"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Start seotool-caddy
echo "[2/4] Starting seotool-caddy..."
cd "$PROJECT_DIR"
docker compose -f gateway-caddy/docker-compose.yml up -d

# Step 3: Copy marketing files
if [[ "${1:-}" == "--copy-marketing" ]] || [[ ! -f "$PROJECT_DIR/web/dist/client/index.html" ]]; then
    echo "[3/4] Copying marketing files..."
    if [[ -d "$PROJECT_DIR/web/dist/client" ]]; then
        docker cp "$PROJECT_DIR/web/dist/client/." seotool-caddy:/srv/marketing/
        echo "Marketing files copied."
    else
        echo "WARNING: web/dist/client not found. Run 'cd web && npm run build' first."
    fi
else
    echo "[3/4] Skipping marketing copy (use --copy-marketing to force)"
fi

# Step 4: Verify
echo "[4/4] Verifying..."
sleep 3
if docker ps --format '{{.Names}} {{.Status}}' | grep -q "seotool-caddy.*healthy\|seotool-caddy.*Up"; then
    echo "✓ seotool-caddy is running"
else
    echo "✗ seotool-caddy may not be running. Check: docker logs seotool-caddy"
fi

# Test connectivity
if docker exec seotool-caddy wget --spider -q http://open-seo:3001/api/health 2>/dev/null; then
    echo "✓ open-seo:3001 is reachable from seotool-caddy"
else
    echo "✗ Cannot reach open-seo:3001 from seotool-caddy"
    echo "  Check network: docker network inspect jetdigitalseo_default"
fi

echo ""
echo "=== Done ==="
echo "Verify: curl -k https://seotool.im/api/health"
