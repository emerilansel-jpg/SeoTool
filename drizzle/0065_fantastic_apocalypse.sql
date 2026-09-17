CREATE UNIQUE INDEX `ai_tracking_configs_id_project_id_uniq` ON `ai_tracking_configs` (`id`,`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_tracking_obs_id_run_uniq` ON `ai_tracking_observations` (`id`,`run_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_tracking_obs_id_run_config_uniq` ON `ai_tracking_observations` (`id`,`run_id`,`config_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_tracking_runs_id_config_id_uniq` ON `ai_tracking_runs` (`id`,`config_id`);