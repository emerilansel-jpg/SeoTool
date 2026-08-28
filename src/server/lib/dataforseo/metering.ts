import type { CreditFeature } from "@/shared/billing-credit-features";
import { mapDataforseoPathToCreditFeature } from "@/shared/billing-credit-features";
import { creditFeatureToQuotaFeature } from "@/shared/plans";
import {
  calculateUsageCreditCharge,
  getOrCreateOrganizationCustomer,
  type BillingCustomerContext,
} from "@/server/billing/subscription";
import {
  refundUsageCreditReservation,
  reserveUsageCredits,
  settleUsageCreditReservation,
} from "@/server/billing/credit-reservations";
import { assertFeatureQuota } from "@/server/billing/quota-gate";
import {
  DataforseoChargedTaskError,
  type DataforseoApiCallCost,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { AppError } from "@/server/lib/errors";
import { SEO_DATA_BYOK_FEE_MULTIPLIER } from "@/shared/billing";
import {
  estimateDataforseoReservationCredits,
  type DataforseoCostProfile,
} from "@/server/lib/dataforseo/cost-ceiling";
import { captureServerEvent } from "@/server/lib/posthog";

export type DataforseoBillingMode = "standard" | "byok";

export type MeteringOptions = {
  creditFeature?: CreditFeature;
  quotaUnits?: number;
  billingMode?: DataforseoBillingMode;
  skipQuota?: boolean;
  costProfile: DataforseoCostProfile;
  request: unknown;
};

export async function meterDataforseoCall<T>(
  customer: BillingCustomerContext,
  execute: () => Promise<DataforseoApiResponse<T>>,
  options: MeteringOptions,
): Promise<T> {
  const {
    creditFeature,
    quotaUnits = 1,
    billingMode = "standard",
    skipQuota = false,
    costProfile,
    request,
  } = options;
  const isHostedMode = await isHostedServerAuthMode();

  if (!isHostedMode) {
    const result = await execute();
    return result.data;
  }

  const billingCustomer = await getOrCreateOrganizationCustomer(customer);
  const creditFeatureForQuota =
    creditFeature ?? mapDataforseoPathToCreditFeature([]);
  const quotaFeature = creditFeatureToQuotaFeature(creditFeatureForQuota);
  if (!skipQuota && quotaFeature && quotaFeature !== "rank_tracking") {
    await assertFeatureQuota(customer.organizationId, quotaFeature, quotaUnits);
  }

  const reservation = await reserveUsageCredits({
    organizationId: billingCustomer.id,
    credits: estimateDataforseoReservationCredits({
      profile: costProfile,
      request,
      billingMode,
    }),
    provider: "dataforseo",
    billingMode,
    creditFeature,
  });

  let result: DataforseoApiResponse<T>;
  try {
    result = await execute();
  } catch (error) {
    if (error instanceof DataforseoChargedTaskError) {
      if (error.isInvalidField && error.billing.costUsd <= 0) {
        await refundUsageCreditReservation(reservation.id);
        throw new AppError("VALIDATION_ERROR", error.message);
      }
      await settleDataforseoCost({
        customer,
        reservationId: reservation.id,
        billing: error.billing,
        creditFeature,
        billingMode,
      });
    } else {
      await refundUsageCreditReservation(reservation.id);
    }
    throw error;
  }

  await settleDataforseoCost({
    customer,
    reservationId: reservation.id,
    billing: result.billing,
    creditFeature,
    billingMode,
  });
  return result.data;
}

async function settleDataforseoCost(args: {
  customer: BillingCustomerContext;
  reservationId: string;
  billing: DataforseoApiCallCost;
  creditFeature?: CreditFeature;
  billingMode: DataforseoBillingMode;
}) {
  const multiplier =
    args.billingMode === "byok" ? SEO_DATA_BYOK_FEE_MULTIPLIER : undefined;
  const { totalCostUsd, totalCostCredits } = calculateUsageCreditCharge(
    args.billing.costUsd,
    multiplier,
  );
  const settlement = await settleUsageCreditReservation(
    args.reservationId,
    totalCostCredits,
  );
  const creditFeature =
    args.creditFeature ?? mapDataforseoPathToCreditFeature(args.billing.path);

  if (settlement.overageCredits > 0) {
    console.error("billing.dataforseo-reservation-ceiling-exceeded", {
      organizationId: args.customer.organizationId,
      reservationId: args.reservationId,
      path: args.billing.path.join("/"),
      reservedCredits: settlement.reservation.reservedCredits,
      actualCredits: totalCostCredits,
    });
  }

  if (settlement.totalCharged <= 0) return;
  await captureServerEvent({
    distinctId: args.customer.userId,
    event: "usage:credits_consume",
    organizationId: args.customer.organizationId,
    properties: {
      project_id: args.customer.projectId,
      credit_feature: creditFeature,
      monthly_credits: settlement.monthlyCharged,
      topup_credits: settlement.topupCharged,
      total_credits: settlement.totalCharged,
      billed_credits: totalCostCredits,
      cost_usd: totalCostUsd,
      provider: "dataforseo",
      billing_mode: args.billingMode,
      paths: [args.billing.path.join("/")],
      fromCache: false,
    },
  });
}
