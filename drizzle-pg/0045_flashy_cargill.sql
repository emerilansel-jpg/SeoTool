CREATE TABLE "brand_lookup_platform_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"snapshot_id" text NOT NULL,
	"platform" text NOT NULL,
	"status" text NOT NULL,
	"mentions" integer,
	"ai_search_volume" integer
);
--> statement-breakpoint
CREATE TABLE "brand_lookup_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"snapshot_date" text NOT NULL,
	"query" text NOT NULL,
	"target_type" text NOT NULL,
	"target_value" text NOT NULL,
	"location_code" integer NOT NULL,
	"language_code" text NOT NULL,
	"fetched_at" text NOT NULL,
	"has_data" boolean NOT NULL,
	"total_mentions" integer,
	"total_ai_search_volume" integer,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_lookup_sov_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"snapshot_id" text NOT NULL,
	"label" text NOT NULL,
	"is_target" boolean NOT NULL,
	"mentions" integer,
	"share_pct" real,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "report_period" text DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "month_of_year" integer;--> statement-breakpoint
ALTER TABLE "brand_lookup_platform_snapshots" ADD CONSTRAINT "brand_lookup_platform_snapshots_snapshot_id_brand_lookup_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."brand_lookup_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_lookup_snapshots" ADD CONSTRAINT "brand_lookup_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_lookup_sov_entries" ADD CONSTRAINT "brand_lookup_sov_entries_snapshot_id_brand_lookup_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."brand_lookup_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brand_lookup_platform_snapshot_uniq" ON "brand_lookup_platform_snapshots" USING btree ("snapshot_id","platform");--> statement-breakpoint
CREATE INDEX "brand_lookup_platform_snapshot_idx" ON "brand_lookup_platform_snapshots" USING btree ("snapshot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_lookup_snapshots_daily_uniq" ON "brand_lookup_snapshots" USING btree ("project_id","snapshot_date","target_type","target_value","location_code","language_code");--> statement-breakpoint
CREATE INDEX "brand_lookup_snapshots_project_date_idx" ON "brand_lookup_snapshots" USING btree ("project_id","snapshot_date");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_lookup_sov_snapshot_label_uniq" ON "brand_lookup_sov_entries" USING btree ("snapshot_id","label");--> statement-breakpoint
CREATE INDEX "brand_lookup_sov_snapshot_idx" ON "brand_lookup_sov_entries" USING btree ("snapshot_id");
