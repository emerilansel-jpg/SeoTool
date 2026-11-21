CREATE TABLE "ai_bot_daily_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"day" text NOT NULL,
	"bot" text NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"unique_urls" integer DEFAULT 0 NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_bot_hits" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"bot" text NOT NULL,
	"url" text NOT NULL,
	"user_agent" text,
	"status_code" integer,
	"ip_hash" text,
	"source" text NOT NULL,
	"hit_at" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_bot_sites" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"domain" text NOT NULL,
	"ingest_token" text NOT NULL,
	"robots_compliance" text,
	"robots_checked_at" text,
	"last_hit_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gsc_rank_history" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"keyword_id" text NOT NULL,
	"day" text NOT NULL,
	"position" real,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"url" text,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gsc_tracked_keywords" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"keyword" text NOT NULL,
	"last_position" real,
	"last_impressions" integer DEFAULT 0 NOT NULL,
	"last_clicks" integer DEFAULT 0 NOT NULL,
	"last_url" text,
	"last_day" text,
	"status" text DEFAULT 'active' NOT NULL,
	"first_seen_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"last_synced_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indexnow_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"host" text NOT NULL,
	"key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"verified_at" text,
	"last_error" text,
	"auto_submit" boolean DEFAULT false NOT NULL,
	"auto_submitted_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indexnow_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"host" text NOT NULL,
	"urls" text NOT NULL,
	"url_count" integer DEFAULT 0 NOT NULL,
	"trigger" text NOT NULL,
	"status" text NOT NULL,
	"response_status" integer,
	"response_summary" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_bot_daily_stats" ADD CONSTRAINT "ai_bot_daily_stats_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_bot_daily_stats" ADD CONSTRAINT "ai_bot_daily_stats_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_bot_hits" ADD CONSTRAINT "ai_bot_hits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_bot_hits" ADD CONSTRAINT "ai_bot_hits_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_bot_sites" ADD CONSTRAINT "ai_bot_sites_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_bot_sites" ADD CONSTRAINT "ai_bot_sites_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gsc_rank_history" ADD CONSTRAINT "gsc_rank_history_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gsc_rank_history" ADD CONSTRAINT "gsc_rank_history_keyword_id_gsc_tracked_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."gsc_tracked_keywords"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gsc_tracked_keywords" ADD CONSTRAINT "gsc_tracked_keywords_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gsc_tracked_keywords" ADD CONSTRAINT "gsc_tracked_keywords_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexnow_keys" ADD CONSTRAINT "indexnow_keys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexnow_keys" ADD CONSTRAINT "indexnow_keys_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexnow_submissions" ADD CONSTRAINT "indexnow_submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexnow_submissions" ADD CONSTRAINT "indexnow_submissions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_bot_daily_stats_project_day_bot_idx" ON "ai_bot_daily_stats" USING btree ("project_id","day","bot");--> statement-breakpoint
CREATE INDEX "ai_bot_daily_stats_project_day_idx" ON "ai_bot_daily_stats" USING btree ("project_id","day");--> statement-breakpoint
CREATE INDEX "ai_bot_hits_project_hit_idx" ON "ai_bot_hits" USING btree ("project_id","hit_at");--> statement-breakpoint
CREATE INDEX "ai_bot_hits_project_bot_idx" ON "ai_bot_hits" USING btree ("project_id","bot","hit_at");--> statement-breakpoint
CREATE INDEX "ai_bot_hits_project_url_idx" ON "ai_bot_hits" USING btree ("project_id","url");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_bot_sites_project_idx" ON "ai_bot_sites" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_bot_sites_token_idx" ON "ai_bot_sites" USING btree ("ingest_token");--> statement-breakpoint
CREATE INDEX "ai_bot_sites_organization_idx" ON "ai_bot_sites" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gsc_rank_history_keyword_day_idx" ON "gsc_rank_history" USING btree ("keyword_id","day");--> statement-breakpoint
CREATE INDEX "gsc_rank_history_project_day_idx" ON "gsc_rank_history" USING btree ("project_id","day");--> statement-breakpoint
CREATE UNIQUE INDEX "gsc_tracked_keywords_project_keyword_idx" ON "gsc_tracked_keywords" USING btree ("project_id","keyword");--> statement-breakpoint
CREATE INDEX "gsc_tracked_keywords_project_idx" ON "gsc_tracked_keywords" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "gsc_tracked_keywords_organization_idx" ON "gsc_tracked_keywords" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "indexnow_keys_project_idx" ON "indexnow_keys" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "indexnow_keys_organization_idx" ON "indexnow_keys" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "indexnow_keys_key_idx" ON "indexnow_keys" USING btree ("key");--> statement-breakpoint
CREATE INDEX "indexnow_submissions_project_idx" ON "indexnow_submissions" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "indexnow_submissions_organization_idx" ON "indexnow_submissions" USING btree ("organization_id");