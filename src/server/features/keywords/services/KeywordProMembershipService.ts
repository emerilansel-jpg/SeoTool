import { AppError } from "@/server/lib/errors";
import { paypal } from "@/server/billing/paypal";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { KeywordProMembershipPaymentRepository } from "@/server/features/keywords/repositories/KeywordProMembershipPaymentRepository";
import { KeywordProCohortSeatRepository } from "@/server/features/keywords/repositories/KeywordProCohortSeatRepository";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProReferralRewardRepository } from "@/server/features/keywords/repositories/KeywordProReferralRewardRepository";
import { KeywordProConfigService } from "@/server/features/keywords/services/KeywordProConfigService";
import { getEffectiveMonthlyCreditGrant } from "@/server/billing/plan-config";
import {
  createKeywordProMarker,
  KEYWORD_PRO_REFERRER_RATE,
  hasMembershipAccess,
  parseKeywordProMarker,
} from "@/shared/keyword-pro-membership";
import { hasSubscriptionAccess } from "@/shared/subscription-access";
import { reconcileExpiredCheckoutReservations } from "./KeywordProCheckoutReconciler";
import {
  qualifyKeywordProReferral,
  syncKeywordProSubscription,
} from "./KeywordProSubscriptionLifecycle";

const CHECKOUT_CREATION_LEASE_MS = 10 * 60 * 1_000;
const CHECKOUT_APPROVAL_LEASE_MS = 24 * 60 * 60 * 1_000;
const TERMINAL_MEMBERSHIP_STATUSES = ["CANCELLED", "EXPIRED", "FAILED"];

function expiresAfter(milliseconds: number) {
  return new Date(Date.now() + milliseconds).toISOString();
}

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

function checkoutContext(publicUrl: string) {
  const returnUrl = new URL("/subscribe", publicUrl).toString();
  return {
    brand_name: "SeoTool.im",
    locale: "en-US",
    shipping_preference: "NO_SHIPPING",
    user_action: "SUBSCRIBE_NOW",
    return_url: `${returnUrl}?checkout=success`,
    cancel_url: `${returnUrl}?checkout=cancelled`,
  };
}

export const KeywordProMembershipService = {
  async getStatus(organizationId: string) {
    const [membership, subscription] = await Promise.all([
      KeywordProRepository.getMembership(organizationId),
      QuotaRepository.getSubscription(organizationId),
    ]);
    const hasAccess = hasMembershipAccess(
      membership?.status,
      membership?.currentPeriodEnd,
    );
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
      hasLegacyPaidPlan: !hasAccess && hasSubscriptionAccess(subscription),
      membership,
      currentCohort,
      referral,
    };
  },

  async startCheckout(input: {
    organizationId: string;
    userEmail: string;
    publicUrl: string;
    referralCode?: string;
  }) {
    await reconcileExpiredCheckoutReservations();
    let existing = await KeywordProRepository.getMembership(
      input.organizationId,
    );
    const existingStatus = existing?.status.toUpperCase();
    if (existingStatus === "ACTIVE" || existingStatus === "SUSPENDED") {
      throw new AppError(
        "VALIDATION_ERROR",
        "This account already has an All Access membership. Manage or cancel it from Billing before starting another checkout.",
      );
    }
    if (existingStatus === "CHECKOUT_CREATING") {
      throw new AppError(
        "VALIDATION_ERROR",
        "An All Access checkout is already being created. Please wait and try again.",
      );
    }

    const subscription = await QuotaRepository.getSubscription(
      input.organizationId,
    );
    if (hasSubscriptionAccess(subscription)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "This account already has a legacy paid plan. Manage that subscription from Billing before switching to All Access.",
      );
    }
    if (
      existing &&
      ["APPROVAL_PENDING", "APPROVED"].includes(existingStatus!)
    ) {
      const pending = await paypal.subscriptions.get(
        existing.paypalSubscriptionId,
      );
      if (["APPROVAL_PENDING", "APPROVED"].includes(pending.status)) {
        throw new AppError(
          "VALIDATION_ERROR",
          "An All Access checkout is already pending.",
        );
      }
      await syncKeywordProSubscription(pending);
      if (pending.status === "ACTIVE" || pending.status === "SUSPENDED") {
        throw new AppError(
          "VALIDATION_ERROR",
          "This account already has an All Access membership. Manage or cancel it from Billing before starting another checkout.",
        );
      }
      await KeywordProRepository.deleteReleasedMembership(input.organizationId);
      existing = null;
    } else if (
      existing &&
      TERMINAL_MEMBERSHIP_STATUSES.includes(existingStatus!)
    ) {
      await KeywordProCohortSeatRepository.releaseMembership(
        input.organizationId,
      );
      await KeywordProRepository.deleteReleasedMembership(input.organizationId);
      existing = null;
    }
    if (existing) {
      throw new AppError(
        "VALIDATION_ERROR",
        "This account already has an All Access membership record that must be reconciled before starting another checkout.",
      );
    }

    const referralCode = input.referralCode?.trim().toUpperCase();
    let attributedReferralCode: string | undefined;
    if (referralCode) {
      const attribution = await KeywordProRepository.createOrUpdateAttribution({
        code: referralCode,
        referredOrganizationId: input.organizationId,
      });
      if (!attribution) {
        throw new AppError("VALIDATION_ERROR", "Referral code is invalid.");
      }
      attributedReferralCode = attribution.code;
    }

    const reservation = await KeywordProConfigService.reserveCheckoutCohort();
    const { cohort, seatReserved } = reservation;
    const checkoutToken = crypto.randomUUID();
    const checkoutPlaceholderId = `checkout:${checkoutToken}`;
    const claim = await KeywordProRepository.claimCheckout({
      organizationId: input.organizationId,
      cohortKey: cohort.key,
      lockedPriceUsdCents: cohort.priceUsdCents,
      paypalPlanId: cohort.paypalPlanId,
      checkoutToken,
      checkoutExpiresAt: expiresAfter(CHECKOUT_CREATION_LEASE_MS),
      referralCodeUsed: attributedReferralCode,
      seatReserved,
    });
    if (!claim) {
      if (seatReserved) {
        await KeywordProCohortSeatRepository.releaseUnattached(cohort.key);
      }
      throw new AppError(
        "VALIDATION_ERROR",
        "An All Access checkout is already pending for this account.",
      );
    }

    let createdSubscriptionId: string | null = null;
    let claimedSubscriptionId = checkoutPlaceholderId;
    try {
      const created = await paypal.subscriptions.create({
        plan_id: cohort.paypalPlanId,
        custom_id: createKeywordProMarker(input.organizationId, cohort.key),
        subscriber: { email_address: input.userEmail },
        application_context: checkoutContext(input.publicUrl),
      });
      createdSubscriptionId = created.id;
      const attached = await KeywordProRepository.attachCheckout({
        organizationId: input.organizationId,
        paypalSubscriptionId: created.id,
        checkoutToken,
        checkoutExpiresAt: expiresAfter(CHECKOUT_APPROVAL_LEASE_MS),
      });
      if (!attached) {
        throw new AppError(
          "INTERNAL_ERROR",
          "The All Access checkout lease expired before PayPal could be attached.",
        );
      }
      claimedSubscriptionId = created.id;
      const approveUrl = findApprovalUrl(created.links);
      return {
        subscriptionId: created.id,
        approveUrl,
        cohort,
      };
    } catch (error) {
      if (createdSubscriptionId) {
        try {
          await paypal.subscriptions.cancel(
            createdSubscriptionId,
            "SeoTool could not reserve the membership",
          );
        } catch (cancelError) {
          console.error(
            "Failed to cancel orphaned All Access subscription",
            cancelError,
          );
        }
      }
      await KeywordProCohortSeatRepository.abandonCheckout(
        input.organizationId,
        claimedSubscriptionId,
      );
      await KeywordProRepository.deleteReleasedMembership(input.organizationId);
      throw error;
    }
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
    await syncKeywordProSubscription(subscription);
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
      "All Access membership cancelled by the SeoTool.im account owner",
    );
    await KeywordProRepository.updateMembershipStatus(
      membership.paypalSubscriptionId,
      { status: "CANCELLED" },
    );
    await QuotaRepository.upsertSubscription({
      organizationId,
      planTier: "free",
      paypalSubscriptionId: null,
      status: "cancelled",
      currentPeriodEnd: null,
    });
    await KeywordProCohortSeatRepository.releaseMembership(organizationId);
    return { cancelled: true };
  },

  async syncWebhookSubscription(subscriptionId: string) {
    const subscription = await paypal.subscriptions.get(subscriptionId);
    return syncKeywordProSubscription(subscription);
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
    const payment = await KeywordProMembershipPaymentRepository.record({
      paypalSaleId: input.paypalSaleId,
      organizationId: membership.organizationId,
      paypalSubscriptionId: input.paypalSubscriptionId,
      grossAmountUsdCents: input.grossAmountUsdCents,
    });
    if (!payment) {
      throw new AppError(
        "FORBIDDEN",
        "PayPal sale ownership does not match the All Access membership.",
      );
    }
    await KeywordProMembershipPaymentRepository.applyMonthlyCredits({
      paypalSaleId: input.paypalSaleId,
      organizationId: membership.organizationId,
      credits: await getEffectiveMonthlyCreditGrant("pro"),
    });
    const referral =
      await KeywordProRepository.getAttributionForReferredOrganization(
        membership.organizationId,
      );
    if (!referral) return false;
    if (referral.attribution.status === "pending") {
      await qualifyKeywordProReferral(membership.organizationId);
    }
    const rewardCredits = Math.round(
      (input.grossAmountUsdCents / 100) * KEYWORD_PRO_REFERRER_RATE * 1_000,
    );
    const existingCommission =
      await KeywordProReferralRewardRepository.getCommissionByPaypalSale(
        input.paypalSaleId,
      );
    if (existingCommission) {
      if (
        existingCommission.attributionId !== referral.attribution.id ||
        existingCommission.status === "credited"
      ) {
        return false;
      }
      return KeywordProReferralRewardRepository.creditReferralCommission({
        attributionId: referral.attribution.id,
        commissionId: existingCommission.id,
        referrerOrganizationId: referral.referrerOrganizationId,
        rewardCredits: existingCommission.rewardCredits,
      });
    }
    if (
      referral.attribution.rewardedMonths >=
      referral.attribution.maxRewardMonths
    ) {
      return false;
    }
    const commission =
      await KeywordProReferralRewardRepository.recordCommission({
        attributionId: referral.attribution.id,
        paypalSaleId: input.paypalSaleId,
        grossAmountUsdCents: input.grossAmountUsdCents,
        rewardCredits,
      });
    if (!commission) return false;
    return KeywordProReferralRewardRepository.creditReferralCommission({
      attributionId: referral.attribution.id,
      commissionId: commission.id,
      referrerOrganizationId: referral.referrerOrganizationId,
      rewardCredits,
    });
  },
};
