import { sql } from "drizzle-orm";
import { db } from "@/db";
import { billingCustomerStatus, subscription } from "@/db/schema";
import { autumn } from "@/server/billing/autumn";
import {
  deriveBillingCustomerStatusSnapshot,
  type BillingCustomerStatusSnapshot,
} from "./customer-status-model";
import { syncBillingStatusToLoops } from "./loops-sync";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";

export async function syncAutumnCustomerStatus(customerId: string) {
  // getOrCreate is effectively a "get" here — a billing.updated webhook always
  // references an existing Autumn customer. The SDK returns the camelCase shape.
  const customer = await autumn.customers.getOrCreate({ customerId });
  const snapshot = deriveBillingCustomerStatusSnapshot(customer);

  // Read the previous plan tier before upserting so we can detect a plan change
  // and reset windowed quotas when the user upgrades/downgrades.
  const previousSub = await QuotaRepository.getSubscription(customerId);
  const previousTier = previousSub?.planTier ?? "free";

  await upsertBillingCustomerStatus(snapshot);
  await upsertSubscription(snapshot);

  // Reset windowed usage quotas when the plan tier changes so the user starts
  // fresh on the new tier's limits. Gauge features (projects, saved keywords,
  // etc.) are live counts and don't need resetting.
  if (previousTier !== snapshot.planTier) {
    await QuotaRepository.resetUsageQuotaForOrg(customerId);
  }

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
      autumnSubscriptionId: snapshot.autumnSubscriptionId,
      status: snapshot.paidPlanStatus ?? "active",
      currentPeriodEnd: snapshot.currentPeriodEnd,
    })
    .onConflictDoUpdate({
      target: subscription.organizationId,
      set: {
        planTier: snapshot.planTier,
        autumnSubscriptionId: snapshot.autumnSubscriptionId,
        status: snapshot.paidPlanStatus ?? "active",
        currentPeriodEnd: snapshot.currentPeriodEnd,
        updatedAt: sql`(current_timestamp)`,
      },
    });
}
