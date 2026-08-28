ALTER TABLE "plan_config" ADD COLUMN "reserved_seats" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "keyword_pro_memberships" ADD COLUMN "seat_reserved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "keyword_pro_memberships"
SET "seat_reserved" = true
WHERE "cohort_key" IN ('krp_founder_10', 'krp_early_20', 'krp_growth_50')
  AND upper("status") IN ('APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED');--> statement-breakpoint
UPDATE "plan_config"
SET "reserved_seats" = (
  SELECT count(*)
  FROM "keyword_pro_memberships"
  WHERE "keyword_pro_memberships"."cohort_key" = "plan_config"."tier"
    AND "keyword_pro_memberships"."seat_reserved" = true
)
WHERE "tier" IN ('krp_founder_10', 'krp_early_20', 'krp_growth_50');
