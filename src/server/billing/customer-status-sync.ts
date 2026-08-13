import { sql } from "drizzle-orm";
import { db } from "@/db";
import { billingCustomerStatus, subscription } from "@/db/schema";
import { paypal } from "@/server/billing/paypal";
import {
  deriveBillingCustomerStatusSnapshot,
  type BillingCustomerStatusSnapshot,
} from "./customer-status-model";
import { syncBillingStatusToLoops } from "./loops-sync";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { grantMonthlyCredits } from "@/server/billing/credits";

/** Sync the customer's billing status from PayPal to the local DB.
 *  Called by the webhook handler after verifying the event signature.
 *  Idempotent: re-syncing the same state is a no-op. */
export async function syncPaypalCustomerStatus(
  organizationId: string,
  webhookPayload?: Record<string, unknown>,
): Promise<BillingCustomerStatusSnapshot> {
  // If we have a webhook payload with subscription resource, use it directly
  // instead of making an API call. This avoids a PayPal round-trip.
  let subscriptionResource: Record<string, unknown>;

  if (webhookPayload?.resource) {
    subscriptionResource = webhookPayload.resource as Record<string, unknown>;
  } else {
    // Fetch subscription from PayPal (for manual sync or if resource is missing)
    const sub = await getSubscriptionForOrg(organizationId);
    if (!sub) {
      // No PayPal subscription found — org is on free tier
      return syncFreeTierStatus(organizationId);
    }
    subscriptionResource = sub;
  }

  const snapshot = deriveBillingCustomerStatusSnapshot({
    organizationId,
    subscription: subscriptionResource,
  });

  // Read the previous plan tier before upserting so we can detect a plan change
  // and reset windowed quotas when the user upgrades/downgrades.
  const previousSub = await QuotaRepository.getSubscription(organizationId);
  const previousTier = previousSub?.planTier ?? "free";

  await upsertBillingCustomerStatus(snapshot);
  await upsertSubscription(snapshot);

  // Reset windowed usage quotas when the plan tier changes so the user starts
  // fresh on the new tier's limits.
  if (previousTier !== snapshot.planTier) {
    await QuotaRepository.resetUsageQuotaForOrg(organizationId);

    // Grant monthly credits for the new tier
    await grantMonthlyCredits(organizationId, snapshot.planTier);
  }

  await syncBillingStatusToLoops(snapshot);
  return snapshot;
}

/** Fetch the subscription resource from PayPal for an organization. */
async function getSubscriptionForOrg(
  organizationId: string,
): Promise<Record<string, unknown> | null> {
  const sub = await QuotaRepository.getSubscription(organizationId);
  if (!sub?.paypalSubscriptionId) return null;

  try {
    const paypalSub = await paypal.subscriptions.get(sub.paypalSubscriptionId);
    return paypalSub as unknown as Record<string, unknown>;
  } catch (error) {
    console.error(
      "Failed to fetch PayPal subscription:",
      sub.paypalSubscriptionId,
      error,
    );
    return null;
  }
}

/** Sync a free-tier status (no PayPal subscription). */
async function syncFreeTierStatus(
  organizationId: string,
): Promise<BillingCustomerStatusSnapshot> {
  const snapshot: BillingCustomerStatusSnapshot = {
    organizationId,
    isPaying: false,
    paidPlanId: null,
    paidPlanStatus: null,
    planTier: "free",
    paypalSubscriptionId: null,
    currentPeriodEnd: null,
    customerJson: JSON.stringify({ free: true }),
    syncedAt: new Date().toISOString(),
  };

  await upsertBillingCustomerStatus(snapshot);
  await upsertSubscription(snapshot);
  await syncBillingStatusToLoops(snapshot);
  return snapshot;
}

async function upsertBillingCustomerStatus(
  snapshot: BillingCustomerStatusSnapshot,
) {
  await db
    .insert(billingCustomerStatus)
    .values({
      organizationId: snapshot.organizationId,
      isPaying: snapshot.isPaying,
      paidPlanId: snapshot.paidPlanId,
      paidPlanStatus: snapshot.paidPlanStatus,
      customerJson: snapshot.customerJson,
      syncedAt: snapshot.syncedAt,
    })
    .onConflictDoUpdate({
      target: billingCustomerStatus.organizationId,
      set: {
        isPaying: snapshot.isPaying,
        paidPlanId: snapshot.paidPlanId,
        paidPlanStatus: snapshot.paidPlanStatus,
        customerJson: snapshot.customerJson,
        syncedAt: snapshot.syncedAt,
        updatedAt: sql`(current_timestamp)`,
      },
    });
}

/** Upsert the subscription table with the resolved plan tier and period end. */
async function upsertSubscription(snapshot: BillingCustomerStatusSnapshot) {
  await db
    .insert(subscription)
    .values({
      organizationId: snapshot.organizationId,
      planTier: snapshot.planTier,
      paypalSubscriptionId: snapshot.paypalSubscriptionId,
      status: snapshot.paidPlanStatus ?? "active",
      currentPeriodEnd: snapshot.currentPeriodEnd,
    })
    .onConflictDoUpdate({
      target: subscription.organizationId,
      set: {
        planTier: snapshot.planTier,
        paypalSubscriptionId: snapshot.paypalSubscriptionId,
        status: snapshot.paidPlanStatus ?? "active",
        currentPeriodEnd: snapshot.currentPeriodEnd,
        updatedAt: sql`(current_timestamp)`,
      },
    });
}
