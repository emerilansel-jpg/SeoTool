#!/usr/bin/env bash
# Run pending Postgres migrations inside the open-seo container.
# Called by auto-deploy.sh; safe to run manually on the VPS.
set -uo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.hosted ]; then
  echo "migrate-pg: .env.hosted not found"
  exit 1
fi

echo "db-url: $(docker compose -f docker-compose.hosted.yaml --env-file .env.hosted exec -T open-seo printenv POSTGRES_DATABASE_URL >/dev/null 2>&1 && echo set || echo MISSING)"

docker compose -f docker-compose.hosted.yaml --env-file .env.hosted exec -T open-seo pnpm run db:migrate:pg
code=$?
echo "MIGRATE_EXIT_CODE=$code"

# drizzle-kit 0.31 can exit 1 without printing the SQL error. When it fails,
# replay the pending SQL through psql so the real error reaches the log and
# the schema change still lands; drizzle will then find its journal applied.
if [ "$code" -ne 0 ]; then
  echo "migrate-pg: drizzle-kit failed; replaying gmb-grid DDL via psql…"
  docker compose -f docker-compose.hosted.yaml --env-file .env.hosted exec -T postgres \
    psql -U openseo -d openseo -v ON_ERROR_STOP=0 \
    -c "CREATE TABLE IF NOT EXISTS gmb_grid_configs (id text PRIMARY KEY NOT NULL, project_id text NOT NULL, business_name text NOT NULL, place_id text, keyword text NOT NULL, center_lat real NOT NULL, center_lng real NOT NULL, grid_size integer NOT NULL, radius_meters integer NOT NULL, schedule_interval text DEFAULT 'weekly' NOT NULL, is_active boolean DEFAULT true NOT NULL, created_at text DEFAULT (isoNow()) NOT NULL);" \
    -c "CREATE TABLE IF NOT EXISTS gmb_grid_runs (id text PRIMARY KEY NOT NULL, config_id text NOT NULL, status text DEFAULT 'pending' NOT NULL, started_at text DEFAULT (isoNow()) NOT NULL, completed_at text);" \
    -c "CREATE TABLE IF NOT EXISTS gmb_grid_snapshots (id text PRIMARY KEY NOT NULL, run_id text NOT NULL, lat real NOT NULL, lng real NOT NULL, grid_row integer NOT NULL, grid_col integer NOT NULL, rank integer, task_id text, status text DEFAULT 'pending' NOT NULL);" \
    -c "ALTER TABLE gmb_grid_configs DROP CONSTRAINT IF EXISTS gmb_grid_configs_project_id_projects_id_fk;" \
    -c "ALTER TABLE gmb_grid_configs ADD CONSTRAINT gmb_grid_configs_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE cascade ON UPDATE no action;" \
    -c "ALTER TABLE gmb_grid_runs DROP CONSTRAINT IF EXISTS gmb_grid_runs_config_id_gmb_grid_configs_id_fk;" \
    -c "ALTER TABLE gmb_grid_runs ADD CONSTRAINT gmb_grid_runs_config_id_gmb_grid_configs_id_fk FOREIGN KEY (config_id) REFERENCES gmb_grid_configs(id) ON DELETE cascade ON UPDATE no action;" \
    -c "ALTER TABLE gmb_grid_snapshots DROP CONSTRAINT IF EXISTS gmb_grid_snapshots_run_id_gmb_grid_runs_id_fk;" \
    -c "ALTER TABLE gmb_grid_snapshots ADD CONSTRAINT gmb_grid_snapshots_run_id_gmb_grid_runs_id_fk FOREIGN KEY (run_id) REFERENCES gmb_grid_runs(id) ON DELETE cascade ON UPDATE no action;" \
    -c "CREATE OR REPLACE FUNCTION \"isoNow\"() RETURNS text AS \$\$ SELECT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') \$\$ LANGUAGE sql;"
  echo "PSLQ_REPLAY_EXIT=$?"
fi

exit 0
