CREATE TABLE "automation_webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"event" text NOT NULL,
	"payload" text NOT NULL,
	"status" text NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"response_status" integer,
	"last_error" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"events" text DEFAULT '[]' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "automation_webhook_deliveries" ADD CONSTRAINT "automation_webhook_deliveries_webhook_id_automation_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."automation_webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_webhook_deliveries" ADD CONSTRAINT "automation_webhook_deliveries_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_webhooks" ADD CONSTRAINT "automation_webhooks_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_webhooks" ADD CONSTRAINT "automation_webhooks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "automation_webhook_deliveries_webhook_idx" ON "automation_webhook_deliveries" USING btree ("webhook_id","created_at");--> statement-breakpoint
CREATE INDEX "automation_webhooks_organization_idx" ON "automation_webhooks" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automation_webhooks_project_idx" ON "automation_webhooks" USING btree ("project_id");