-- Add search_engine column to rank_tracking_configs
ALTER TABLE "rank_tracking_configs" ADD COLUMN "search_engine" text NOT NULL DEFAULT 'google';--> statement-breakpoint

-- Create serp_volatility_snapshots table
CREATE TABLE "serp_volatility_snapshots" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"date" text NOT NULL,
	"volatility_score" real NOT NULL,
	"keywords_sampled" integer NOT NULL,
	"avg_position_change" real NOT NULL,
	"top_movers_json" text,
	"created_at" text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
	CONSTRAINT "serp_volatility_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
CREATE INDEX "serp_volatility_project_date_idx" ON "serp_volatility_snapshots" USING btree ("project_id","date");