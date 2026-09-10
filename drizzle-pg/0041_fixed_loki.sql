CREATE TABLE "ai_discovered_prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"prompt" text NOT NULL,
	"platform" text DEFAULT 'all' NOT NULL,
	"ai_search_volume" integer DEFAULT 0 NOT NULL,
	"has_mention" boolean DEFAULT false NOT NULL,
	"has_citation" boolean DEFAULT false NOT NULL,
	"citation_url" text,
	"brand_entities" text DEFAULT '[]' NOT NULL,
	"sources" text DEFAULT '[]' NOT NULL,
	"is_tracked" boolean DEFAULT false NOT NULL,
	"first_response_at" text,
	"last_response_at" text,
	"discovered_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_top_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"url" text NOT NULL,
	"platform" text DEFAULT 'all' NOT NULL,
	"mentions" integer DEFAULT 0 NOT NULL,
	"ai_search_volume" integer DEFAULT 0 NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_visibility_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"snapshot_date" text NOT NULL,
	"platform" text DEFAULT 'all' NOT NULL,
	"visibility_score" integer DEFAULT 0 NOT NULL,
	"mention_rate" integer DEFAULT 0 NOT NULL,
	"citation_rate" integer DEFAULT 0 NOT NULL,
	"share_of_voice" integer DEFAULT 0 NOT NULL,
	"prompts_tracked" integer DEFAULT 0 NOT NULL,
	"prompts_mentioned" integer DEFAULT 0 NOT NULL,
	"prompts_cited" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_tracking_configs" ADD COLUMN "location_code" integer DEFAULT 2840 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_tracking_configs" ADD COLUMN "language_code" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_tracking_configs" ADD COLUMN "last_discovery_at" text;--> statement-breakpoint
ALTER TABLE "ai_discovered_prompts" ADD CONSTRAINT "ai_discovered_prompts_config_id_ai_tracking_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ai_tracking_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_top_pages" ADD CONSTRAINT "ai_top_pages_config_id_ai_tracking_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ai_tracking_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_visibility_snapshots" ADD CONSTRAINT "ai_visibility_snapshots_config_id_ai_tracking_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ai_tracking_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_discovered_prompts_config_idx" ON "ai_discovered_prompts" USING btree ("config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_discovered_prompts_config_prompt_uniq" ON "ai_discovered_prompts" USING btree ("config_id","prompt");--> statement-breakpoint
CREATE INDEX "ai_discovered_prompts_volume_idx" ON "ai_discovered_prompts" USING btree ("config_id","ai_search_volume");--> statement-breakpoint
CREATE INDEX "ai_top_pages_config_idx" ON "ai_top_pages" USING btree ("config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_top_pages_config_url_platform_uniq" ON "ai_top_pages" USING btree ("config_id","url","platform");--> statement-breakpoint
CREATE INDEX "ai_visibility_snapshots_config_idx" ON "ai_visibility_snapshots" USING btree ("config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_visibility_snapshots_config_date_plat_uniq" ON "ai_visibility_snapshots" USING btree ("config_id","snapshot_date","platform");