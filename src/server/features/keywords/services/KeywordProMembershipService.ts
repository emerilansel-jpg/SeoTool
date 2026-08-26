import { AppError } from "@/server/lib/errors";
import { paypal, type PayPalSubscription } from "@/server/billing/paypal";
import { addTopupCredits } from "@/server/billing/credits";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProConfigService } from "@/server/features/keywords/services/KeywordProConfigService";
import {
  createKeywordProMarker,
  KEYWORD_PRO_REFERRED_REWARD_CREDITS,
  KEYWORD_PRO_REFERRER_RATE,
  parseKeywordProMarker,
} from "@/shared/keyword-pro-membership";

function findApprovalUrl(links: Array<{ rel: string; href: string }>) {
  const link = links.find(
    (candidate) =>
      candidate.rel === "approve" || candidate.rel === "payer-action",
  );
  if (!link) {
    throw new AppError(
      "INTERNAL_ERROR",
      "PayPal checkout was created without an approval URL.",
    );
  }
  return link.href;
}

function checkoutContext(publicUrl: string, projectId: string) {
  const returnUrl = `${publicUrl}/p/${encodeURIComponent(projectId)}/keyword-research-pro`;
  return {
    brand_name: "SeoTool.im",
    locale: "en-US",
    shipping_preference: "NO_SHIPPING",
    user_action: "SUBSCRIBE_NOW",
    return_url: `${returnUrl}?checkout=success`,
    cancel_url: `${returnUrl}?checkout=cancelled`,
  };
}

async function qualifyReferral(organizationId: string) {
  const referral =
    await KeywordProRepository.getAttributionForReferredOrganization(
      organizationId,
    );
  if (!referral || referral.attribution.status === "qualified") return;
  // Claim the one-time reward before granting it. This favors preventing a
  // duplicate grant if PayPal and the return-page verification race.
  await KeywordProRepository.qualifyAttribution(referral.attribution.id, true);
  await addTopupCredits(organizationId, KEYWORD_PRO_REFERRED_REWARD_CREDITS);
}

async function syncSubscription(subscription: PayPalSubscription) {
  const marker = parseKeywordProMarker(subscription.custom_id);
  const existing = await KeywordProRepository.getMembershipByPaypalSubscription(
    subscription.id,
  );
  if (!existing && !marker) return null;
  const organizationId = existing?.organizationId ?? marker!.organizationId;
  const membership = await KeywordProRepository.updateMembershipStatus(
    subscription.id,
    {
      status: subscription.status,
      activatedAt:
        subscription.status === "ACTIVE"
          ? (existing?.activatedAt ?? new Date().toISOString())
          : existing?.activatedAt,
      currentPeriodEnd: subscription.next_billing_time ?? null,
    },
  );
  if (subscription.status === "ACTIVE") {
    await qualifyReferral(organizationId);
  }
  return membership;
}

export const KeywordProMembershipService = {
  async getStatus(organizationId: string) {
    const membership = await KeywordProRepository.getMembership(organizationId);
    const hasAccess = membership?.status === "ACTIVE";
    // An active member keeps their locked plan even when every public cohort
    // is temporarily paused. Only prospective members need an open cohort.
    const currentCohort = hasAccess
      ? null
      : await KeywordProConfigService.getCurrentCohort();
    const referral = hasAccess
      ? await KeywordProRepository.getReferralStats(organizationId)
      : null;
    return {
      hasAccess,
      membership,
      currentCohort,
      referral,
    };
  },

  async startCheckout(input: {
    organizationId: string;
    userEmail: string;
    projectId: string;
    publicUrl: string;
    referralCode?: string;
  }) {
    const existing = await KeywordProRepository.getMembership(
      input.organizationId,
    );
    if (existing?.status === "ACTIVE") {
      throw new AppError(
        "VALIDATION_ERROR",
        "This organization already has Keyword Research Pro.",
      );
    }
    if (
      existing &&
      ["APPROVAL_PENDING", "APPROVED"].includes(existing.status)
    ) {
      const pending = await paypal.subscriptions.get(
        existing.paypalSubscriptionId,
      );
      if (["APPROVAL_PENDING", "APPROVED"].includes(pending.status)) {
        throw new AppError(
          "VALIDATION_ERROR",
          "A Keyword Research Pro checkout is already pending.",
        );
      }
    }

    const cohort = await KeywordProConfigService.getCurrentCohort();
    if (!cohort.paypalPlanId) {
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        "Keyword Research Pro checkout is not configured yet. Please contact support.",
      );
    }
    const referralCode = input.referralCode?.trim().toUpperCase();
    if (referralCode) {
      const attribution = await KeywordProRepository.createOrUpdateAttribution({
        code: referralCode,
        referredOrganizationId: input.organizationId,
      });
      if (!attribution) {
        throw new AppError("VALIDATION_ERROR", "Referral code is invalid.");
      }
    }

    const created = await paypal.subscriptions.create({
      plan_id: cohort.paypalPlanId,
      custom_id: createKeywordProMarker(input.organizationId, cohort.key),
      subscriber: { email_address: input.userEmail },
      application_context: checkoutContext(input.publicUrl, input.projectId),
    });
    try {
      await KeywordProRepository.upsertMembership({
        organizationId: input.organizationId,
        cohortKey: cohort.key,
        lockedPriceUsdCents: cohort.priceUsdCents,
        status: "APPROVAL_PENDING",
        paypalPlanId: cohort.paypalPlanId,
        paypalSubscriptionId: created.id,
        referralCodeUsed: referralCode,
      });
    } catch (error) {
      try {
        await paypal.subscriptions.cancel(
          created.id,
          "SeoTool could not reserve the membership",
        );
      } catch (cancelError) {
        console.error(
          "Failed to cancel orphaned KRP subscription",
          cancelError,
        );
      }
      throw error;
    }
    return {
      subscriptionId: created.id,
      approveUrl: findApprovalUrl(created.links),
      cohort,
    };
  },

  async verifyCheckout(subscriptionId: string, organizationId: string) {
    const subscription = await paypal.subscriptions.get(subscriptionId);
    const marker = parseKeywordProMarker(subscription.custom_id);
    if (marker?.organizationId !== organizationId) {
      throw new AppError(
        "FORBIDDEN",
        "This checkout belongs to another account.",
      );
    }
    await syncSubscription(subscription);
    return {
      active: subscription.status === "ACTIVE",
      status: subscription.status,
    };
  },

  async cancelMembership(organizationId: string) {
    const membership = await KeywordProRepository.getMembership(organizationId);
    if (!membership || ["CANCELLED", "EXPIRED"].includes(membership.status)) {
      throw new AppError("VALIDATION_ERROR", "No active membership to cancel.");
    }
    await paypal.subscriptions.cancel(
      membership.paypalSubscriptionId,
      "Cancelled by the SeoTool.im account owner",
    );
    await KeywordProRepository.updateMembershipStatus(
      membership.paypalSubscriptionId,
      { status: "CANCELLED" },
    );
    return { cancelled: true };
  },

  async syncWebhookSubscription(subscriptionId: string) {
    const subscription = await paypal.subscriptions.get(subscriptionId);
    return syncSubscription(subscription);
  },

  async rewardReferralSale(input: {
    paypalSubscriptionId: string;
    paypalSaleId: string;
    grossAmountUsdCents: number;
  }) {
    const membership =
      await KeywordProRepository.getMembershipByPaypalSubscription(
        input.paypalSubscriptionId,
      );
    if (!membership) return false;
    const referral =
      await KeywordProRepository.getAttributionForReferredOrganization(
        membership.organizationId,
      );
    if (!referral) return false;
    if (
      referral.attribution.rewardedMonths >=
      referral.attribution.maxRewardMonths
    ) {
      return false;
    }
    if (referral.attribution.status === "pending") {
      await qualifyReferral(membership.organizationId);
    }
    const rewardCredits = Math.round(
      (input.grossAmountUsdCents / 100) * KEYWORD_PRO_REFERRER_RATE * 1_000,
    );
    const commission = await KeywordProRepository.recordCommission({
      attributionId: referral.attribution.id,
      paypalSaleId: input.paypalSaleId,
      grossAmountUsdCents: input.grossAmountUsdCents,
      rewardCredits,
    });
    if (!commission) return false;
    await addTopupCredits(referral.referrerOrganizationId, rewardCredits);
    return true;
  },
};
