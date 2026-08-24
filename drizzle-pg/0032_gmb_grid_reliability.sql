ALTER TABLE "gmb_grid_configs" ADD COLUMN "cid" text;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ADD COLUMN "language_code" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ADD COLUMN "device" text DEFAULT 'mobile' NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ADD COLUMN "map_zoom" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ADD COLUMN "next_check_at" text;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ADD COLUMN "updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL;--> statement-breakpoint
UPDATE "gmb_grid_configs" SET "place_id" = 'legacy:' || "id" WHERE "place_id" IS NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ALTER COLUMN "place_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ALTER COLUMN "schedule_interval" SET DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "trigger" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "total_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "completed_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "failed_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "found_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "solv" real;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "average_rank" real;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "cost_usd" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "gmb_grid_runs" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "gmb_grid_snapshots" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "gmb_grid_snapshots" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "gmb_grid_snapshots" ADD COLUMN "checked_at" text;--> statement-breakpoint
UPDATE "gmb_grid_runs" r SET
	"total_points" = stats.total_points,
	"completed_points" = stats.completed_points,
	"failed_points" = stats.failed_points,
	"found_points" = stats.found_points
FROM (
	SELECT "run_id", COUNT(*)::integer AS total_points,
		COUNT(*) FILTER (WHERE "status" = 'completed')::integer AS completed_points,
		COUNT(*) FILTER (WHERE "status" = 'failed')::integer AS failed_points,
		COUNT(*) FILTER (WHERE "rank" IS NOT NULL)::integer AS found_points
	FROM "gmb_grid_snapshots" GROUP BY "run_id"
) stats WHERE r."id" = stats."run_id";--> statement-breakpoint
WITH ranked AS (
	SELECT "id", ROW_NUMBER() OVER (
		PARTITION BY "config_id" ORDER BY "started_at" DESC, "id" DESC
	) AS rn
	FROM "gmb_grid_runs" WHERE "status" IN ('pending', 'running')
)
UPDATE "gmb_grid_runs" SET
	"status" = 'failed',
	"error_code" = 'MIGRATION_DEDUPED',
	"error_message" = 'Superseded active run during reliability migration',
	"completed_at" = to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
WHERE "id" IN (SELECT "id" FROM ranked WHERE rn > 1);--> statement-breakpoint
CREATE INDEX "gmb_grid_configs_project_created_idx" ON "gmb_grid_configs" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "gmb_grid_configs_active_next_idx" ON "gmb_grid_configs" USING btree ("is_active","next_check_at");--> statement-breakpoint
CREATE INDEX "gmb_grid_runs_config_started_idx" ON "gmb_grid_runs" USING btree ("config_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "gmb_grid_runs_one_active_per_config_idx" ON "gmb_grid_runs" USING btree ("config_id") WHERE "status" IN ('pending', 'running');--> statement-breakpoint
CREATE UNIQUE INDEX "gmb_grid_snapshots_run_grid_idx" ON "gmb_grid_snapshots" USING btree ("run_id","grid_row","grid_col");--> statement-breakpoint
CREATE INDEX "gmb_grid_snapshots_task_idx" ON "gmb_grid_snapshots" USING btree ("task_id");
