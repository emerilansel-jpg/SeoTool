import {
  and,
  count,
  countDistinct,
  eq,
  inArray,
  lte,
  sql,
  sum,
} from "drizzle-orm";
import { db } from "@/db";
import {
  keywordProMemberships,
  keywordProReferralAttributions,
  keywordProReferralCodes,
  keywordProReferralCommissions,
  member,
  planConfig,
} from "@/db/schema";
import {
  KEYWORD_PRO_COHORT_KEYS,
  type KeywordProCohortKey,
} from "@/shared/keyword-pro-membership";

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
      .where(inArray(planConfig.tier, KEYWORD_PRO_COHORT_KEYS));
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
        cohortKey === "krp_public"
          ? and(
              eq(keywordProMemberships.cohortKey, cohortKey),
              inArray(
                keywordProMemberships.status,
                RESERVED_MEMBERSHIP_STATUSES,
              ),
            )
          : and(
              eq(keywordProMemberships.cohortKey, cohortKey),
              eq(keywordProMemberships.seatReserved, true),
            ),
      );
    return row?.value ?? 0;
  },

  async countAllReservedMemberships() {
    const [row] = await db
      .select({ value: count() })
      .from(keywordProMemberships)
      .where(
        sql`(${keywordProMemberships.seatReserved} = true or (${keywordProMemberships.cohortKey} = 'krp_public' and ${keywordProMemberships.status} in ('APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED')))`,
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

  async claimCheckout(input: {
    organizationId: string;
    cohortKey: KeywordProCohortKey;
    lockedPriceUsdCents: number;
    paypalPlanId: string;
    checkoutToken: string;
    checkoutExpiresAt: string;
    referralCodeUsed?: string;
    seatReserved: boolean;
  }): Promise<KeywordProMembership | null> {
    const [row] = await db
      .insert(keywordProMemberships)
      .values({
        organizationId: input.organizationId,
        cohortKey: input.cohortKey,
        lockedPriceUsdCents: input.lockedPriceUsdCents,
        status: "CHECKOUT_CREATING",
        paypalPlanId: input.paypalPlanId,
        paypalSubscriptionId: `checkout:${input.checkoutToken}`,
        referralCodeUsed: input.referralCodeUsed,
        checkoutExpiresAt: input.checkoutExpiresAt,
        seatReserved: input.seatReserved,
      })
      .onConflictDoNothing()
      .returning();
    return row ?? null;
  },

  async attachCheckout(input: {
    organizationId: string;
    checkoutToken: string;
    paypalSubscriptionId: string;
    checkoutExpiresAt: string;
  }): Promise<KeywordProMembership | null> {
    const [row] = await db
      .update(keywordProMemberships)
      .set({
        status: "APPROVAL_PENDING",
        paypalSubscriptionId: input.paypalSubscriptionId,
        checkoutExpiresAt: input.checkoutExpiresAt,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(keywordProMemberships.organizationId, input.organizationId),
          eq(keywordProMemberships.status, "CHECKOUT_CREATING"),
          eq(
            keywordProMemberships.paypalSubscriptionId,
            `checkout:${input.checkoutToken}`,
          ),
        ),
      )
      .returning();
    return row ?? null;
  },

  async deleteReleasedMembership(organizationId: string) {
    await db
      .delete(keywordProMemberships)
      .where(
        and(
          eq(keywordProMemberships.organizationId, organizationId),
          eq(keywordProMemberships.seatReserved, false),
          inArray(keywordProMemberships.status, [
            "CHECKOUT_CREATING",
            "CANCELLED",
            "EXPIRED",
            "FAILED",
          ]),
        ),
      );
  },

  async listExpiredCheckoutReservations(now: string, limit = 20) {
    return db
      .select()
      .from(keywordProMemberships)
      .where(
        and(
          eq(keywordProMemberships.seatReserved, true),
          inArray(keywordProMemberships.status, [
            "CHECKOUT_CREATING",
            "APPROVAL_PENDING",
            "APPROVED",
          ]),
          lte(keywordProMemberships.checkoutExpiresAt, now),
        ),
      )
      .limit(limit);
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
      .set({
        ...input,
        checkoutExpiresAt: [
          "ACTIVE",
          "SUSPENDED",
          "CANCELLED",
          "EXPIRED",
          "FAILED",
        ].includes(input.status)
          ? null
          : undefined,
        updatedAt: sql`(current_timestamp)`,
      })
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
    const referredMembers = await db
      .select({ userId: member.userId })
      .from(member)
      .where(eq(member.organizationId, input.referredOrganizationId));
    if (referredMembers.length > 0) {
      const [sharedMember] = await db
        .select({ userId: member.userId })
        .from(member)
        .where(
          and(
            eq(member.organizationId, referralCode.organizationId),
            inArray(
              member.userId,
              referredMembers.map((row) => row.userId),
            ),
          ),
        )
        .limit(1);
      // A teammate cannot refer the same people through a second organization.
      if (sharedMember) return null;
    }
    const [existing] = await db
      .select({
        attribution: keywordProReferralAttributions,
        code: keywordProReferralCodes.code,
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
          input.referredOrganizationId,
        ),
      )
      .limit(1);
    // First valid attribution wins. Pending attributions are intentionally not
    // overwritten by a later code, preventing referral-code swapping.
    if (existing) return existing;
    const [row] = await db
      .insert(keywordProReferralAttributions)
      .values({
        id: crypto.randomUUID(),
        referralCodeId: referralCode.id,
        referredOrganizationId: input.referredOrganizationId,
      })
      .onConflictDoNothing({
        target: keywordProReferralAttributions.referredOrganizationId,
      })
      .returning();
    if (row) return { attribution: row, code: referralCode.code };

    // A concurrent checkout won the unique referred-organization insert.
    // Resolve and return that winner rather than overwriting its attribution.
    const [winner] = await db
      .select({
        attribution: keywordProReferralAttributions,
        code: keywordProReferralCodes.code,
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
          input.referredOrganizationId,
        ),
      )
      .limit(1);
    return winner ?? null;
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
        and(
          eq(
            keywordProReferralCommissions.attributionId,
            keywordProReferralAttributions.id,
          ),
          eq(keywordProReferralCommissions.status, "credited"),
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
