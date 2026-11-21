CREATE TABLE "internal_link_suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"audit_id" text,
	"source_url" text NOT NULL,
	"target_url" text NOT NULL,
	"target_keyword" text NOT NULL,
	"gsc_position" text,
	"anchor_text" text NOT NULL,
	"sentence" text NOT NULL,
	"rationale" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "internal_link_suggestions" ADD CONSTRAINT "internal_link_suggestions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_link_suggestions" ADD CONSTRAINT "internal_link_suggestions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "internal_link_suggestions_project_status_idx" ON "internal_link_suggestions" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "internal_link_suggestions_organization_idx" ON "internal_link_suggestions" USING btree ("organization_id");