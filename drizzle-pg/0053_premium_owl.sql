DROP INDEX "gbp_profiles_project_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "gbp_profiles_project_idx" ON "gbp_profiles" USING btree ("project_id");