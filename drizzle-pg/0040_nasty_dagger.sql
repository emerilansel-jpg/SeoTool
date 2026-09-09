CREATE TABLE "ai_tracking_citations" (
	"id" text PRIMARY KEY NOT NULL,
	"observation_id" text NOT NULL,
	"run_id" text NOT NULL,
	"url" text NOT NULL,
	"domain" text NOT NULL,
	"title" text,
	"is_target_brand" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tracking_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"brand_name" text NOT NULL,
	"domain" text NOT NULL,
	"brand_aliases" text DEFAULT '[]' NOT NULL,
	"platforms" text DEFAULT '["chat_gpt","gemini","perplexity"]' NOT NULL,
	"schedule" text DEFAULT 'manual' NOT NULL,
	"schedule_status" text DEFAULT 'idle' NOT NULL,
	"next_run_at" text,
	"last_run_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tracking_mentions" (
	"id" text PRIMARY KEY NOT NULL,
	"observation_id" text NOT NULL,
	"run_id" text NOT NULL,
	"config_id" text NOT NULL,
	"brand_name" text NOT NULL,
	"domain" text NOT NULL,
	"is_target_brand" boolean DEFAULT false NOT NULL,
	"position" integer,
	"sentiment" text DEFAULT 'neutral' NOT NULL,
	"evidence" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tracking_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"config_id" text NOT NULL,
	"prompt_id" text NOT NULL,
	"prompt" text NOT NULL,
	"platform" text NOT NULL,
	"status" text NOT NULL,
	"response_text" text,
	"error_message" text,
	"observed_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tracking_prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"prompt" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tracking_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"project_id" text NOT NULL,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"prompts_total" integer DEFAULT 0 NOT NULL,
	"prompts_completed" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"completed_at" text
);
--> statement-breakpoint
ALTER TABLE "ai_tracking_citations" ADD CONSTRAINT "ai_tracking_citations_observation_id_ai_tracking_observations_id_fk" FOREIGN KEY ("observation_id") REFERENCES "public"."ai_tracking_observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_citations" ADD CONSTRAINT "ai_tracking_citations_run_id_ai_tracking_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ai_tracking_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_configs" ADD CONSTRAINT "ai_tracking_configs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_mentions" ADD CONSTRAINT "ai_tracking_mentions_observation_id_ai_tracking_observations_id_fk" FOREIGN KEY ("observation_id") REFERENCES "public"."ai_tracking_observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_mentions" ADD CONSTRAINT "ai_tracking_mentions_run_id_ai_tracking_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ai_tracking_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_mentions" ADD CONSTRAINT "ai_tracking_mentions_config_id_ai_tracking_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ai_tracking_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_observations" ADD CONSTRAINT "ai_tracking_observations_run_id_ai_tracking_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ai_tracking_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_observations" ADD CONSTRAINT "ai_tracking_observations_config_id_ai_tracking_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ai_tracking_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_prompts" ADD CONSTRAINT "ai_tracking_prompts_config_id_ai_tracking_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ai_tracking_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_runs" ADD CONSTRAINT "ai_tracking_runs_config_id_ai_tracking_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."ai_tracking_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tracking_runs" ADD CONSTRAINT "ai_tracking_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_tracking_citations_obs_idx" ON "ai_tracking_citations" USING btree ("observation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tracking_configs_project_id_uniq" ON "ai_tracking_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "ai_tracking_mentions_obs_idx" ON "ai_tracking_mentions" USING btree ("observation_id");--> statement-breakpoint
CREATE INDEX "ai_tracking_mentions_config_brand_idx" ON "ai_tracking_mentions" USING btree ("config_id","domain");--> statement-breakpoint
CREATE INDEX "ai_tracking_obs_run_idx" ON "ai_tracking_observations" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "ai_tracking_obs_config_date_idx" ON "ai_tracking_observations" USING btree ("config_id","observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tracking_obs_run_prompt_platform_uniq" ON "ai_tracking_observations" USING btree ("run_id","prompt_id","platform");--> statement-breakpoint
CREATE INDEX "ai_tracking_prompts_config_id_idx" ON "ai_tracking_prompts" USING btree ("config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tracking_prompts_config_prompt_uniq" ON "ai_tracking_prompts" USING btree ("config_id","prompt");--> statement-breakpoint
CREATE INDEX "ai_tracking_runs_config_idx" ON "ai_tracking_runs" USING btree ("config_id","started_at");--> statement-breakpoint
CREATE INDEX "ai_tracking_runs_project_idx" ON "ai_tracking_runs" USING btree ("project_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tracking_runs_one_active_per_config_idx" ON "ai_tracking_runs" USING btree ("config_id") WHERE "ai_tracking_runs"."status" IN ('pending', 'running');