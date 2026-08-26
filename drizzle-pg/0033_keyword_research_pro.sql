CREATE TABLE "keyword_pro_memberships" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"cohort_key" text NOT NULL,
	"locked_price_usd_cents" integer NOT NULL,
	"status" text DEFAULT 'approval_pending' NOT NULL,
	"paypal_plan_id" text NOT NULL,
	"paypal_subscription_id" text NOT NULL,
	"referral_code_used" text,
	"activated_at" text,
	"current_period_end" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "keyword_pro_memberships" ADD CONSTRAINT "keyword_pro_memberships_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "keyword_pro_memberships_paypal_subscription_idx" ON "keyword_pro_memberships" USING btree ("paypal_subscription_id");--> statement-breakpoint
CREATE INDEX "keyword_pro_memberships_cohort_status_idx" ON "keyword_pro_memberships" USING btree ("cohort_key","status");--> statement-breakpoint
CREATE TABLE "keyword_pro_referral_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "keyword_pro_referral_codes" ADD CONSTRAINT "keyword_pro_referral_codes_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "keyword_pro_referral_codes_organization_idx" ON "keyword_pro_referral_codes" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "keyword_pro_referral_codes_code_idx" ON "keyword_pro_referral_codes" USING btree ("code");--> statement-breakpoint
CREATE TABLE "keyword_pro_referral_attributions" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_code_id" text NOT NULL,
	"referred_organization_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"rewarded_months" integer DEFAULT 0 NOT NULL,
	"max_reward_months" integer DEFAULT 12 NOT NULL,
	"referred_reward_granted" boolean DEFAULT false NOT NULL,
	"qualified_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "keyword_pro_referral_attributions" ADD CONSTRAINT "keyword_pro_referral_attributions_referral_code_id_keyword_pro_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."keyword_pro_referral_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_pro_referral_attributions" ADD CONSTRAINT "keyword_pro_referral_attributions_referred_organization_id_organization_id_fk" FOREIGN KEY ("referred_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "keyword_pro_referral_attributions_referred_org_idx" ON "keyword_pro_referral_attributions" USING btree ("referred_organization_id");--> statement-breakpoint
CREATE INDEX "keyword_pro_referral_attributions_code_status_idx" ON "keyword_pro_referral_attributions" USING btree ("referral_code_id","status");--> statement-breakpoint
CREATE TABLE "keyword_pro_referral_commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"attribution_id" text NOT NULL,
	"paypal_sale_id" text NOT NULL,
	"gross_amount_usd_cents" integer NOT NULL,
	"reward_credits" integer NOT NULL,
	"status" text DEFAULT 'credited' NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "keyword_pro_referral_commissions" ADD CONSTRAINT "keyword_pro_referral_commissions_attribution_id_keyword_pro_referral_attributions_id_fk" FOREIGN KEY ("attribution_id") REFERENCES "public"."keyword_pro_referral_attributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "keyword_pro_referral_commissions_paypal_sale_idx" ON "keyword_pro_referral_commissions" USING btree ("paypal_sale_id");--> statement-breakpoint
CREATE INDEX "keyword_pro_referral_commissions_attribution_idx" ON "keyword_pro_referral_commissions" USING btree ("attribution_id");
