#!/usr/bin/env bash
# Nightly Postgres backup for the hosted SaaS stack (docker-compose.hosted.yaml).
#
# Dumps the `openseo` database in PostgreSQL custom format (-Fc), compresses
# it, keeps RETENTION_DAYS newest files in BACKUP_DIR, and validates each dump
# so an empty/corrupt file never counts as a successful backup.
#
# Install on the VPS (as root or a user in the docker group):
#   crontab -e
#   15 3 * * * /home/seotool/JetDigitalSEO/scripts/backup-pg.sh >> /var/log/seotool-backup.log 2>&1
#
# Restore: see scripts/restore-pg.sh and runbooks/production-runbook.md.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.hosted.yaml"
ENV_FILE="$PROJECT_DIR/.env.hosted"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/seotool}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M)"
DUMP_FILE="$BACKUP_DIR/openseo-$STAMP.dump.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date -Is)] starting pg_dump -> $DUMP_FILE"

# -T ignores the tee pipe's exit status so a pg_dump failure still fails here.
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  pg_dump -Fc --no-owner -U openseo openseo \
  | tee >(gzip > "$DUMP_FILE") >/dev/null

# ─── Validate: non-trivial size + PostgreSQL custom-format magic bytes ────
# A custom-format dump starts with "PGDMP".
SIZE=$(stat -c%s "$DUMP_FILE")
MAGIC=$(head -c 5 "$DUMP_FILE")
if [ "$SIZE" -lt 1024 ] || [ "$MAGIC" != "PGDMP" ]; then
  echo "[$(date -Is)] ERROR: dump invalid (size=$SIZE, magic=$MAGIC) — keeping file for inspection"
  exit 1
fi

echo "[$(date -Is)] dump valid ($SIZE bytes)"

# ─── Retention ─────────────────────────────────────────────────────────────
find "$BACKUP_DIR" -name 'openseo-*.dump.gz' -mtime +"$RETENTION_DAYS" -delete

echo "[$(date -Is)] backup complete; retained dumps:"
ls -1t "$BACKUP_DIR"/openseo-*.dump.gz | head -n 5
