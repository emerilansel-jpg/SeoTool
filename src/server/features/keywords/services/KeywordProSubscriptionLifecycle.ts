import { AppError } from "@/server/lib/errors";
import type { PayPalSubscription } from "@/server/billing/paypal";
import { grantMonthlyCredits } from "@/server/billing/credits";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { KeywordProCohortSeatRepository } from "@/server/features/keywords/repositories/KeywordProCohortSeatRepository";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProReferralRewardRepository } from "@/server/features/keywords/repositories/KeywordProReferralRewardRepository";
import {
  KEYWORD_PRO_REFERRED_REWARD_CREDITS,
  parseKeywordProMarker,
} from "@/shared/keyword-pro-membership";

export async function qualifyKeywordProReferral(organizationId: string) {
  const referral =
    await KeywordProRepository.getAttributionForReferredOrganization(
      organizationId,
    );
  if (!referral || referral.attribution.referredRewardGranted) return;
  await KeywordProReferralRewardRepository.grantReferredReward({
    attributionId: referral.attribution.id,
    referredOrganizationId: organizationId,
    rewardCredits: KEYWORD_PRO_REFERRED_REWARD_CREDITS,
  });
}

export async function syncKeywordProSubscription(
  subscription: PayPalSubscription,
) {
  const marker = parseKeywordProMarker(subscription.custom_id);
  const existing = await KeywordProRepository.getMembershipByPaypalSubscription(
    subscription.id,
  );
  if (!existing) return null;
  if (marker && marker.organizationId !== existing.organizationId) {
    throw new AppError(
      "FORBIDDEN",
      "PayPal subscription ownership marker does not match the membership.",
    );
  }

  const organizationId = existing.organizationId;
  const currentPeriodEnd =
    subscription.next_billing_time ?? existing.currentPeriodEnd ?? null;
  const membership = await KeywordProRepository.updateMembershipStatus(
    subscription.id,
    {
      status: subscription.status,
      activatedAt:
        subscription.status === "ACTIVE"
          ? (existing.activatedAt ?? new Date().toISOString())
          : existing.activatedAt,
      currentPeriodEnd,
    },
  );

  if (subscription.status === "ACTIVE") {
    await QuotaRepository.upsertSubscription({
      organizationId,
      planTier: "pro",
      paypalSubscriptionId: subscription.id,
      status: "active",
      currentPeriodEnd,
    });
    if (!existing.activatedAt) {
      await grantMonthlyCredits(organizationId, "pro");
    }
    await qualifyKeywordProReferral(organizationId);
  } else if (subscription.status === "SUSPENDED") {
    await QuotaRepository.upsertSubscription({
      organizationId,
      planTier: "pro",
      paypalSubscriptionId: subscription.id,
      status: "past_due",
      currentPeriodEnd,
    });
  } else if (["CANCELLED", "EXPIRED", "FAILED"].includes(subscription.status)) {
    await QuotaRepository.upsertSubscription({
      organizationId,
      planTier: "free",
      paypalSubscriptionId: null,
      status: subscription.status.toLowerCase(),
      currentPeriodEnd: null,
    });
    await KeywordProCohortSeatRepository.releaseMembership(organizationId);
  }
  return membership;
}
