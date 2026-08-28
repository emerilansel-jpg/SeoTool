import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export const keywordProMemberships = pgTable(
  "keyword_pro_memberships",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    cohortKey: text("cohort_key").notNull(),
    lockedPriceUsdCents: integer("locked_price_usd_cents").notNull(),
    status: text("status").notNull().default("approval_pending"),
    paypalPlanId: text("paypal_plan_id").notNull(),
    paypalSubscriptionId: text("paypal_subscription_id").notNull(),
    referralCodeUsed: text("referral_code_used"),
    activatedAt: text("activated_at"),
    currentPeriodEnd: text("current_period_end"),
    checkoutExpiresAt: text("checkout_expires_at"),
    seatReserved: boolean("seat_reserved").notNull().default(false),
    seatReleaseToken: text("seat_release_token"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("keyword_pro_memberships_paypal_subscription_idx").on(
      table.paypalSubscriptionId,
    ),
    index("keyword_pro_memberships_cohort_status_idx").on(
      table.cohortKey,
      table.status,
    ),
    index("keyword_pro_memberships_checkout_expiry_idx").on(
      table.status,
      table.checkoutExpiresAt,
    ),
  ],
);

export const keywordProReferralCodes = pgTable(
  "keyword_pro_referral_codes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("keyword_pro_referral_codes_organization_idx").on(
      table.organizationId,
    ),
    uniqueIndex("keyword_pro_referral_codes_code_idx").on(table.code),
  ],
);

export const keywordProReferralAttributions = pgTable(
  "keyword_pro_referral_attributions",
  {
    id: text("id").primaryKey(),
    referralCodeId: text("referral_code_id")
      .notNull()
      .references(() => keywordProReferralCodes.id, { onDelete: "cascade" }),
    referredOrganizationId: text("referred_organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    rewardedMonths: integer("rewarded_months").notNull().default(0),
    maxRewardMonths: integer("max_reward_months").notNull().default(12),
    referredRewardGranted: boolean("referred_reward_granted")
      .notNull()
      .default(false),
    qualifiedAt: text("qualified_at"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("keyword_pro_referral_attributions_referred_org_idx").on(
      table.referredOrganizationId,
    ),
    index("keyword_pro_referral_attributions_code_status_idx").on(
      table.referralCodeId,
      table.status,
    ),
  ],
);

export const keywordProReferralCommissions = pgTable(
  "keyword_pro_referral_commissions",
  {
    id: text("id").primaryKey(),
    attributionId: text("attribution_id")
      .notNull()
      .references(() => keywordProReferralAttributions.id, {
        onDelete: "cascade",
      }),
    paypalSaleId: text("paypal_sale_id").notNull(),
    grossAmountUsdCents: integer("gross_amount_usd_cents").notNull(),
    rewardCredits: integer("reward_credits").notNull(),
    status: text("status").notNull().default("credited"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("keyword_pro_referral_commissions_paypal_sale_idx").on(
      table.paypalSaleId,
    ),
    index("keyword_pro_referral_commissions_attribution_idx").on(
      table.attributionId,
    ),
  ],
);

export const keywordProMembershipPayments = pgTable(
  "keyword_pro_membership_payments",
  {
    paypalSaleId: text("paypal_sale_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    paypalSubscriptionId: text("paypal_subscription_id").notNull(),
    grossAmountUsdCents: integer("gross_amount_usd_cents").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("keyword_pro_membership_payments_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
  ],
);
