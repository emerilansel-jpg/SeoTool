import { and, count, countDistinct, eq, inArray, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import {
  keywordProMemberships,
  keywordProReferralAttributions,
  keywordProReferralCodes,
  keywordProReferralCommissions,
  planConfig,
} from "@/db/schema";
import type { KeywordProCohortKey } from "@/shared/keyword-pro-membership";

const RESERVED_MEMBERSHIP_STATUSES = [
  "APPROVAL_PENDING",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
];

type KeywordProMembership = typeof keywordProMemberships.$inferSelect;

export const KeywordProRepository = {
  async listCohortConfigs() {
    return db
      .select()
      .from(planConfig)
      .where(
        inArray(planConfig.tier, [
          "krp_founder_10",
          "krp_early_20",
          "krp_growth_45",
          "krp_scale_75",
          "krp_public",
        ]),
      );
  },

  async upsertCohortConfig(input: {
    key: KeywordProCohortKey;
    priceUsdCents: number;
    paypalPlanId: string | null;
    active: boolean;
    updatedByUserId: string;
  }) {
    await db
      .insert(planConfig)
      .values({
        tier: input.key,
        priceUsdCents: input.priceUsdCents,
        monthlyCredits: 0,
        paypalPlanId: input.paypalPlanId,
        syncStatus: "synced",
        active: input.active,
        updatedByUserId: input.updatedByUserId,
      })
      .onConflictDoUpdate({
        target: planConfig.tier,
        set: {
          priceUsdCents: input.priceUsdCents,
          paypalPlanId: input.paypalPlanId,
          syncStatus: "synced",
          active: input.active,
          updatedByUserId: input.updatedByUserId,
          updatedAt: sql`(current_timestamp)`,
        },
      });
  },

  async countReservedMemberships(cohortKey: KeywordProCohortKey) {
    const [row] = await db
      .select({ value: count() })
      .from(keywordProMemberships)
      .where(
        and(
          eq(keywordProMemberships.cohortKey, cohortKey),
          inArray(keywordProMemberships.status, RESERVED_MEMBERSHIP_STATUSES),
        ),
      );
    return row?.value ?? 0;
  },

  async countAllReservedMemberships() {
    const [row] = await db
      .select({ value: count() })
      .from(keywordProMemberships)
      .where(
        inArray(keywordProMemberships.status, RESERVED_MEMBERSHIP_STATUSES),
      );
    return row?.value ?? 0;
  },

  async getMembership(
    organizationId: string,
  ): Promise<KeywordProMembership | null> {
    const [row] = await db
      .select()
      .from(keywordProMemberships)
      .where(eq(keywordProMemberships.organizationId, organizationId))
      .limit(1);
    return row ?? null;
  },

  async getMembershipByPaypalSubscription(
    paypalSubscriptionId: string,
  ): Promise<KeywordProMembership | null> {
    const [row] = await db
      .select()
      .from(keywordProMemberships)
      .where(
        eq(keywordProMemberships.paypalSubscriptionId, paypalSubscriptionId),
      )
      .limit(1);
    return row ?? null;
  },

  async upsertMembership(input: {
    organizationId: string;
    cohortKey: KeywordProCohortKey;
    lockedPriceUsdCents: number;
    status: string;
    paypalPlanId: string;
    paypalSubscriptionId: string;
    referralCodeUsed?: string;
    activatedAt?: string | null;
    currentPeriodEnd?: string | null;
  }) {
    const [row] = await db
      .insert(keywordProMemberships)
      .values(input)
      .onConflictDoUpdate({
        target: keywordProMemberships.organizationId,
        set: {
          cohortKey: input.cohortKey,
          lockedPriceUsdCents: input.lockedPriceUsdCents,
          status: input.status,
          paypalPlanId: input.paypalPlanId,
          paypalSubscriptionId: input.paypalSubscriptionId,
          referralCodeUsed: input.referralCodeUsed,
          activatedAt: input.activatedAt,
          currentPeriodEnd: input.currentPeriodEnd,
          updatedAt: sql`(current_timestamp)`,
        },
      })
      .returning();
    if (!row) throw new Error("Failed to save Keyword Research Pro membership");
    return row;
  },

  async updateMembershipStatus(
    paypalSubscriptionId: string,
    input: {
      status: string;
      activatedAt?: string | null;
      currentPeriodEnd?: string | null;
    },
  ): Promise<KeywordProMembership | null> {
    const [row] = await db
      .update(keywordProMemberships)
      .set({ ...input, updatedAt: sql`(current_timestamp)` })
      .where(
        eq(keywordProMemberships.paypalSubscriptionId, paypalSubscriptionId),
      )
      .returning();
    return row ?? null;
  },

  async getOrCreateReferralCode(organizationId: string) {
    const [existing] = await db
      .select()
      .from(keywordProReferralCodes)
      .where(eq(keywordProReferralCodes.organizationId, organizationId))
      .limit(1);
    if (existing) return existing;

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = crypto
        .randomUUID()
        .replaceAll("-", "")
        .slice(0, 8)
        .toUpperCase();
      const [created] = await db
        .insert(keywordProReferralCodes)
        .values({ id: crypto.randomUUID(), organizationId, code })
        .onConflictDoNothing()
        .returning();
      if (created) return created;
    }
    throw new Error("Failed to create a unique referral code");
  },

  async createOrUpdateAttribution(input: {
    code: string;
    referredOrganizationId: string;
  }) {
    const [referralCode] = await db
      .select()
      .from(keywordProReferralCodes)
      .where(
        and(
          eq(keywordProReferralCodes.code, input.code.toUpperCase()),
          eq(keywordProReferralCodes.active, true),
        ),
      )
      .limit(1);
    if (!referralCode) return null;
    if (referralCode.organizationId === input.referredOrganizationId) {
      return null;
    }
    const [existing] = await db
      .select()
      .from(keywordProReferralAttributions)
      .where(
        eq(
          keywordProReferralAttributions.referredOrganizationId,
          input.referredOrganizationId,
        ),
      )
      .limit(1);
    if (existing?.status !== "pending") return existing ?? null;
    const [row] = await db
      .insert(keywordProReferralAttributions)
      .values({
        id: existing?.id ?? crypto.randomUUID(),
        referralCodeId: referralCode.id,
        referredOrganizationId: input.referredOrganizationId,
      })
      .onConflictDoUpdate({
        target: keywordProReferralAttributions.referredOrganizationId,
        set: {
          referralCodeId: referralCode.id,
          updatedAt: sql`(current_timestamp)`,
        },
      })
      .returning();
    return row ?? null;
  },

  async getAttributionForReferredOrganization(organizationId: string) {
    const [row] = await db
      .select({
        attribution: keywordProReferralAttributions,
        referrerOrganizationId: keywordProReferralCodes.organizationId,
      })
      .from(keywordProReferralAttributions)
      .innerJoin(
        keywordProReferralCodes,
        eq(
          keywordProReferralCodes.id,
          keywordProReferralAttributions.referralCodeId,
        ),
      )
      .where(
        eq(
          keywordProReferralAttributions.referredOrganizationId,
          organizationId,
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async qualifyAttribution(id: string, referredRewardGranted: boolean) {
    const [row] = await db
      .update(keywordProReferralAttributions)
      .set({
        status: "qualified",
        referredRewardGranted,
        qualifiedAt: sql`coalesce(${keywordProReferralAttributions.qualifiedAt}, current_timestamp)`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(eq(keywordProReferralAttributions.id, id))
      .returning();
    return row ?? null;
  },

  async recordCommission(input: {
    attributionId: string;
    paypalSaleId: string;
    grossAmountUsdCents: number;
    rewardCredits: number;
  }) {
    const [commission] = await db
      .insert(keywordProReferralCommissions)
      .values({ id: crypto.randomUUID(), ...input })
      .onConflictDoNothing()
      .returning();
    if (!commission) return null;
    await db
      .update(keywordProReferralAttributions)
      .set({
        rewardedMonths: sql`${keywordProReferralAttributions.rewardedMonths} + 1`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(eq(keywordProReferralAttributions.id, input.attributionId));
    return commission;
  },

  async getReferralStats(organizationId: string) {
    const code = await this.getOrCreateReferralCode(organizationId);
    const [summary] = await db
      .select({
        referrals: countDistinct(keywordProReferralAttributions.id),
        rewardCredits: sum(keywordProReferralCommissions.rewardCredits),
      })
      .from(keywordProReferralAttributions)
      .leftJoin(
        keywordProReferralCommissions,
        eq(
          keywordProReferralCommissions.attributionId,
          keywordProReferralAttributions.id,
        ),
      )
      .where(eq(keywordProReferralAttributions.referralCodeId, code.id));
    return {
      code: code.code,
      referrals: summary?.referrals ?? 0,
      rewardCredits: Number(summary?.rewardCredits ?? 0),
    };
  },
};
