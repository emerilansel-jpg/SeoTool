CREATE TABLE "usage_credit_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"provider" text NOT NULL,
	"billing_mode" text DEFAULT 'standard' NOT NULL,
	"credit_feature" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reserved_credits" integer NOT NULL,
	"monthly_reserved" integer DEFAULT 0 NOT NULL,
	"topup_reserved" integer DEFAULT 0 NOT NULL,
	"actual_credits" integer,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"settled_at" text
);
--> statement-breakpoint
ALTER TABLE "usage_credit_reservations" ADD CONSTRAINT "usage_credit_reservations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "usage_credit_reservations_org_status_idx" ON "usage_credit_reservations" USING btree ("organization_id","status");
