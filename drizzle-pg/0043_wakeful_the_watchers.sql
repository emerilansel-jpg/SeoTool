CREATE UNIQUE INDEX "ai_tracking_configs_id_project_id_uniq" ON "ai_tracking_configs" USING btree ("id","project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tracking_obs_id_run_uniq" ON "ai_tracking_observations" USING btree ("id","run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tracking_obs_id_run_config_uniq" ON "ai_tracking_observations" USING btree ("id","run_id","config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tracking_runs_id_config_id_uniq" ON "ai_tracking_runs" USING btree ("id","config_id");