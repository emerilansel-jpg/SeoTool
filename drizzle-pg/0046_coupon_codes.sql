CREATE TABLE "coupon_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"credits" integer NOT NULL,
	"max_redemptions" integer,
	"redeemed_count" integer DEFAULT 0 NOT NULL,
	"expires_at" text,
	"note" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	CONSTRAINT "coupon_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"credits_granted" integer NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupon_codes_active_idx" ON "coupon_codes" USING btree ("is_active","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemptions_coupon_org_idx" ON "coupon_redemptions" USING btree ("coupon_id","organization_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_org_idx" ON "coupon_redemptions" USING btree ("organization_id");
