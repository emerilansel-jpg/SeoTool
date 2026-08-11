#!/bin/bash
# auto-deploy.sh
# Script ini dipanggil oleh GitHub Action atau manual untuk update VPS.
# Lokasi: /home/seotool/JetDigitalSEO/auto-deploy.sh

set -e

cd /home/seotool/JetDigitalSEO

echo "🚀 Starting Auto-Deploy..."

# 1. Tarik perubahan terbaru dari GitHub
# Menggunakan fetch dan reset untuk menghindari konflik merge pada .env atau Caddyfile
echo "📥 Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# 2. Jalankan skrip deploy yang sudah ada
# Skrip ini akan me-rebuild Docker image dan restart container
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh --build

echo "✅ Auto-Deploy finished successfully!"
