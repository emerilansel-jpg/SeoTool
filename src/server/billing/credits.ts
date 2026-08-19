import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { usageQuota } from "@/db/schema";
import {
  MONTHLY_CREDIT_GRANTS,
  PAYPAL_CREDITS_FEATURE_ID,
  PAYPAL_TOPUP_CREDITS_FEATURE_ID,
} from "@/shared/billing";
import type { PlanTier } from "@/shared/plans";

// ---------------------------------------------------------------------------
// Local credits management — replaces Autumn's balance tracking.
//
// Credits are stored as rows in the existing `usage_quota` table using the
// same upsert-with-reset pattern. Two pseudo-features represent the credit
// pools: `monthly_credits` (granted per billing cycle) and `topup_credits`
// (purchased one-time, roll over until exhausted).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Read balances
// ---------------------------------------------------------------------------

export type CreditBalance = {
  monthlyRemaining: number;
  topupRemaining: number;
  totalRemaining: number;
};

/** Read the current credit balances for an organization. Returns the
 *  monthly and topup pool remaining values. */
export async function getCreditBalance(
  organizationId: string,
): Promise<CreditBalance> {
  const rows = await db
    .select()
    .from(usageQuota)
    .where(
      and(
        eq(usageQuota.organizationId, organizationId),
        sql`${usageQuota.feature} IN (${PAYPAL_CREDITS_FEATURE_ID}, ${PAYPAL_TOPUP_CREDITS_FEATURE_ID})`,
      ),
    );

  let monthlyRemaining = 0;
  let topupRemaining = 0;

  for (const row of rows) {
    // Credits use "monthly" period with a very long window (1 year from grant).
    // The remaining balance is simply the `used` column (inverted: used = granted
    // - spent, so remaining = used). Actually, we store remaining directly:
    // `used` = remaining balance. This is the opposite of quota tracking where
    // `used` = consumed. For credits, `used` = remaining credits.
    if (row.feature === PAYPAL_CREDITS_FEATURE_ID) {
      monthlyRemaining = row.used;
    } else if (row.feature === PAYPAL_TOPUP_CREDITS_FEATURE_ID) {
      topupRemaining = row.used;
    }
  }

  return {
    monthlyRemaining,
    topupRemaining,
    totalRemaining: monthlyRemaining + topupRemaining,
  };
}

// ---------------------------------------------------------------------------
// Grant monthly credits
// ---------------------------------------------------------------------------

/** Grant the monthly credit allowance for the given tier. Called on plan
 *  creation and on each renewal (via webhook). The grant replaces any
 *  remaining monthly balance (fresh cycle = fresh grant). */
export async function grantMonthlyCredits(
  organizationId: string,
  tier: PlanTier,
): Promise<void> {
  const credits = MONTHLY_CREDIT_GRANTS[tier];
  if (credits <= 0) return;

  const now = new Date();
  // Credits expire after 1 year (generous window; resets on renewal anyway).
  const windowEnd = new Date(
    now.getTime() + 365 * 24 * 60 * 60 * 1000,
  ).toISOString();

  await db
    .insert(usageQuota)
    .values({
      id: crypto.randomUUID(),
      organizationId,
      feature: PAYPAL_CREDITS_FEATURE_ID,
      period: "monthly",
      used: credits,
      windowStart: now.toISOString(),
      windowEnd,
    })
    .onConflictDoUpdate({
      target: [
        usageQuota.organizationId,
        usageQuota.feature,
        usageQuota.period,
      ],
      set: {
        used: credits,
        windowStart: now.toISOString(),
        windowEnd,
        updatedAt: sql`(current_timestamp)`,
      },
    });
}

// ---------------------------------------------------------------------------
// Deduct credits
// ---------------------------------------------------------------------------

/** Deduct credits from the monthly pool first, then topup. Returns the
 *  amount deducted from each pool. Throws if total balance is insufficient. */
export async function deductCredits(
  organizationId: string,
  amount: number,
): Promise<{ monthlyDeducted: number; topupDeducted: number }> {
  if (amount <= 0) return { monthlyDeducted: 0, topupDeducted: 0 };

  const balance = await getCreditBalance(organizationId);
  if (balance.totalRemaining < amount) {
    throw new Error(
      `Insufficient credits: need ${amount}, have ${balance.totalRemaining}`,
    );
  }

  const monthlyDeducted = Math.min(balance.monthlyRemaining, amount);
  const topupDeducted = amount - monthlyDeducted;

  // Deduct from monthly pool
  if (monthlyDeducted > 0) {
    await db
      .update(usageQuota)
      .set({
        used: sql`${usageQuota.used} - ${monthlyDeducted}`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageQuota.organizationId, organizationId),
          eq(usageQuota.feature, PAYPAL_CREDITS_FEATURE_ID),
          eq(usageQuota.period, "monthly"),
        ),
      );
  }

  // Deduct from topup pool
  if (topupDeducted > 0) {
    await db
      .update(usageQuota)
      .set({
        used: sql`${usageQuota.used} - ${topupDeducted}`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageQuota.organizationId, organizationId),
          eq(usageQuota.feature, PAYPAL_TOPUP_CREDITS_FEATURE_ID),
          eq(usageQuota.period, "monthly"),
        ),
      );
  }

  return { monthlyDeducted, topupDeducted };
}

// ---------------------------------------------------------------------------
// Add topup credits
// ---------------------------------------------------------------------------

/** Add one-time topup credits. These roll over until exhausted. */
export async function addTopupCredits(
  organizationId: string,
  credits: number,
): Promise<void> {
  if (credits <= 0) return;

  const now = new Date();
  const windowEnd = new Date(
    now.getTime() + 365 * 24 * 60 * 60 * 1000,
  ).toISOString();

  await db
    .insert(usageQuota)
    .values({
      id: crypto.randomUUID(),
      organizationId,
      feature: PAYPAL_TOPUP_CREDITS_FEATURE_ID,
      period: "monthly",
      used: credits,
      windowStart: now.toISOString(),
      windowEnd,
    })
    .onConflictDoUpdate({
      target: [
        usageQuota.organizationId,
        usageQuota.feature,
        usageQuota.period,
      ],
      set: {
        used: sql`${usageQuota.used} + ${credits}`,
        updatedAt: sql`(current_timestamp)`,
      },
    });
}

// ---------------------------------------------------------------------------
// Check depleted
// ---------------------------------------------------------------------------

/** Returns true if the org has no credits remaining. */
export async function areCreditsDepleted(
  organizationId: string,
): Promise<boolean> {
  const balance = await getCreditBalance(organizationId);
  return balance.totalRemaining <= 0;
}
