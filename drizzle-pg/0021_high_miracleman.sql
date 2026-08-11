CREATE TABLE "alert_rules" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"condition_json" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"frequency" varchar(20) DEFAULT 'daily' NOT NULL,
	"next_check_at" timestamp,
	"last_triggered_at" timestamp,
	"recipients" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_rules_project_id_idx" ON "alert_rules" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "alert_rules_next_check_idx" ON "alert_rules" USING btree ("enabled","next_check_at");