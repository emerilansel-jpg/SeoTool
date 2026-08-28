import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { runBatch } from "@/db/runBatch";
import { keywordProMemberships, planConfig } from "@/db/schema";
import type { KeywordProCohortKey } from "@/shared/keyword-pro-membership";

async function releaseReservedMembership(input: {
  organizationId: string;
  expectedPaypalSubscriptionId?: string;
  replacementStatus?: "FAILED";
}) {
  const releaseToken = crypto.randomUUID();
  const claimConditions = [
    eq(keywordProMemberships.organizationId, input.organizationId),
    eq(keywordProMemberships.seatReserved, true),
  ];
  if (input.expectedPaypalSubscriptionId) {
    claimConditions.push(
      eq(
        keywordProMemberships.paypalSubscriptionId,
        input.expectedPaypalSubscriptionId,
      ),
    );
  }

  const reservedCohort = sql`(
    select ${keywordProMemberships.cohortKey}
    from ${keywordProMemberships}
    where ${keywordProMemberships.organizationId} = ${input.organizationId}
      and ${keywordProMemberships.seatReleaseToken} = ${releaseToken}
  )`;

  await runBatch((tx) => [
    tx
      .update(keywordProMemberships)
      .set({
        seatReserved: false,
        seatReleaseToken: releaseToken,
        status: input.replacementStatus,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(and(...claimConditions)),
    tx
      .update(planConfig)
      .set({
        reservedSeats: sql`${planConfig.reservedSeats} - 1`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(planConfig.tier, reservedCohort),
          gt(planConfig.reservedSeats, 0),
        ),
      ),
    tx
      .update(keywordProMemberships)
      .set({ seatReleaseToken: null })
      .where(
        and(
          eq(keywordProMemberships.organizationId, input.organizationId),
          eq(keywordProMemberships.seatReleaseToken, releaseToken),
        ),
      ),
  ]);
}

export const KeywordProCohortSeatRepository = {
  async reserve(cohortKey: KeywordProCohortKey, capacity: number) {
    const [row] = await db
      .update(planConfig)
      .set({
        reservedSeats: sql`${planConfig.reservedSeats} + 1`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(planConfig.tier, cohortKey),
          eq(planConfig.active, true),
          sql`${planConfig.reservedSeats} < ${capacity}`,
        ),
      )
      .returning({ tier: planConfig.tier });
    return Boolean(row);
  },

  async releaseUnattached(cohortKey: KeywordProCohortKey) {
    await db
      .update(planConfig)
      .set({
        reservedSeats: sql`${planConfig.reservedSeats} - 1`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(eq(planConfig.tier, cohortKey), gt(planConfig.reservedSeats, 0)),
      );
  },

  async releaseMembership(organizationId: string) {
    await releaseReservedMembership({ organizationId });
  },

  async abandonCheckout(
    organizationId: string,
    expectedPaypalSubscriptionId: string,
  ) {
    await releaseReservedMembership({
      organizationId,
      expectedPaypalSubscriptionId,
      replacementStatus: "FAILED",
    });
    await db
      .update(keywordProMemberships)
      .set({ status: "FAILED", updatedAt: sql`(current_timestamp)` })
      .where(
        and(
          eq(keywordProMemberships.organizationId, organizationId),
          eq(
            keywordProMemberships.paypalSubscriptionId,
            expectedPaypalSubscriptionId,
          ),
          inArray(keywordProMemberships.status, [
            "CHECKOUT_CREATING",
            "APPROVAL_PENDING",
            "APPROVED",
          ]),
        ),
      );
  },
};
