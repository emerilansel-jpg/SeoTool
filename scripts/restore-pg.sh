#!/usr/bin/env bash
# Restore a backup produced by scripts/backup-pg.sh.
#
# Two modes:
#   1. Verify (default, safe): restores into a temporary database
#      `openseo_restore_test` inside the running Postgres container, prints a
#      row-count summary, then drops the temp database. Never touches prod.
#   2. Restore for real:  ./restore-pg.sh <dump-file> --write
#      Drops and recreates the `openseo` database from the dump. DESTRUCTIVE —
#      the current production data is replaced. Requires typing RESTORE to
#      confirm.
#
# Usage:
#   ./scripts/restore-pg.sh /var/backups/seotool/openseo-YYYYMMDD-HHMM.dump.gz [--write]

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.hosted.yaml"
ENV_FILE="$PROJECT_DIR/.env.hosted"

DUMP_FILE="${1:?Usage: restore-pg.sh <dump-file> [--write]}"
MODE="${2:-verify}"

if [ ! -f "$DUMP_FILE" ]; then
  echo "ERROR: dump file not found: $DUMP_FILE"
  exit 1
fi

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

restore_into() {
  local target_db="$1"
  compose exec -T postgres sh -c "dropdb --if-exists -U openseo '$target_db' && createdb -U openseo '$target_db'"
  gunzip -c "$DUMP_FILE" | compose exec -T postgres pg_restore --no-owner -U openseo -d "$target_db"
}

case "$MODE" in
  --write)
    echo "This will DROP and REPLACE the production 'openseo' database with:"
    echo "  $DUMP_FILE"
    read -r -p "Type RESTORE to continue: " confirm
    if [ "$confirm" != "RESTORE" ]; then
      echo "Aborted."
      exit 1
    fi
    compose exec -T postgres sh -c "dropdb --if-exists -U openseo openseo && createdb -U openseo openseo"
    gunzip -c "$DUMP_FILE" | compose exec -T postgres pg_restore --no-owner -U openseo -d openseo
    echo "Restore complete. Restarting app so pools reconnect:"
    compose restart open-seo
    ;;
  verify)
    echo "Verifying $DUMP_FILE against a temporary database (production untouched)..."
    restore_into openseo_restore_test
    echo "--- table row counts in restored copy ---"
    compose exec -T postgres psql -U openseo -d openseo_restore_test -c \
      "select relname as table, n_live_tup as rows from pg_stat_user_tables order by n_live_tup desc limit 15;"
    compose exec -T postgres dropdb -U openseo openseo_restore_test
    echo "Verification passed: the dump restores cleanly."
    ;;
  *)
    echo "Unknown mode: $MODE (use --write or omit for verify)"
    exit 1
    ;;
esac
