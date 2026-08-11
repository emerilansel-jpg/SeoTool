#!/bin/bash
# auto-deploy.sh
# Dipanggil oleh GitHub Action atau manual untuk update VPS.

set -e

cd /home/seotool/JetDigitalSEO

echo "🚀 Starting Auto-Deploy..."

# Backup config files yang tidak boleh ditimpa oleh git
cp .env.hosted .env.hosted.bak 2>/dev/null || true
cp Caddyfile Caddyfile.bak 2>/dev/null || true

echo "📥 Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# Restore config files
cp .env.hosted.bak .env.hosted 2>/dev/null || true
cp Caddyfile.bak Caddyfile 2>/dev/null || true
rm -f .env.hosted.bak Caddyfile.bak

chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh --build

echo "✅ Auto-Deploy finished successfully!"
