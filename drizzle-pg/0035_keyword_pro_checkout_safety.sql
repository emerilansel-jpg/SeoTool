CREATE TABLE "keyword_pro_membership_payments" (
	"paypal_sale_id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"paypal_subscription_id" text NOT NULL,
	"gross_amount_usd_cents" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "keyword_pro_memberships" ADD COLUMN "checkout_expires_at" text;--> statement-breakpoint
ALTER TABLE "keyword_pro_memberships" ADD COLUMN "seat_release_token" text;--> statement-breakpoint
ALTER TABLE "keyword_pro_membership_payments" ADD CONSTRAINT "keyword_pro_membership_payments_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "keyword_pro_membership_payments_org_created_idx" ON "keyword_pro_membership_payments" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "keyword_pro_memberships_checkout_expiry_idx" ON "keyword_pro_memberships" USING btree ("status","checkout_expires_at");
