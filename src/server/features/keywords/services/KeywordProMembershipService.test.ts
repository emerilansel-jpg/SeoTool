/* eslint-disable max-lines -- lifecycle, checkout, and referral regression matrix */
// oxlint-disable typescript-eslint/unbound-method -- direct mocked service/repository assertions are intentional
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/billing/paypal", () => ({
  PayPalRequestError: class PayPalRequestError extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message);
    }
  },
  paypal: {
    subscriptions: {
      cancel: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
    },
  },
}));

vi.mock("@/server/billing/credits", () => ({
  addTopupCredits: vi.fn(),
  grantMonthlyCredits: vi.fn(),
}));

vi.mock("@/server/billing/plan-config", () => ({
  getEffectiveMonthlyCreditGrant: vi.fn(),
}));

vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getSubscription: vi.fn(),
    upsertSubscription: vi.fn(),
  },
}));

vi.mock("@/server/features/keywords/repositories/KeywordProRepository", () => ({
  KeywordProRepository: {
    attachCheckout: vi.fn(),
    claimCheckout: vi.fn(),
    createOrUpdateAttribution: vi.fn(),
    deleteReleasedMembership: vi.fn(),
    getAttributionForReferredOrganization: vi.fn(),
    getMembership: vi.fn(),
    getMembershipByPaypalSubscription: vi.fn(),
    listExpiredCheckoutReservations: vi.fn(),
    updateMembershipStatus: vi.fn(),
  },
}));

vi.mock(
  "@/server/features/keywords/repositories/KeywordProCohortSeatRepository",
  () => ({
    KeywordProCohortSeatRepository: {
      abandonCheckout: vi.fn(),
      releaseMembership: vi.fn(),
      releaseUnattached: vi.fn(),
    },
  }),
);

vi.mock(
  "@/server/features/keywords/repositories/KeywordProMembershipPaymentRepository",
  () => ({
    KeywordProMembershipPaymentRepository: {
      applyMonthlyCredits: vi.fn(),
      record: vi.fn(),
    },
  }),
);

vi.mock(
  "@/server/features/keywords/repositories/KeywordProReferralRewardRepository",
  () => ({
    KeywordProReferralRewardRepository: {
      creditReferralCommission: vi.fn(),
      getCommissionByPaypalSale: vi.fn(),
      grantReferredReward: vi.fn(),
      recordCommission: vi.fn(),
    },
  }),
);

vi.mock("@/server/features/keywords/services/KeywordProConfigService", () => ({
  KeywordProConfigService: {
    getCurrentCohort: vi.fn(),
    reserveCheckoutCohort: vi.fn(),
  },
}));

import { paypal, PayPalRequestError } from "@/server/billing/paypal";
import { grantMonthlyCredits } from "@/server/billing/credits";
import { getEffectiveMonthlyCreditGrant } from "@/server/billing/plan-config";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProCohortSeatRepository } from "@/server/features/keywords/repositories/KeywordProCohortSeatRepository";
import { KeywordProMembershipPaymentRepository } from "@/server/features/keywords/repositories/KeywordProMembershipPaymentRepository";
import { KeywordProReferralRewardRepository } from "@/server/features/keywords/repositories/KeywordProReferralRewardRepository";
import { KeywordProConfigService } from "@/server/features/keywords/services/KeywordProConfigService";
import { KeywordProMembershipService } from "./KeywordProMembershipService";

const membership = {
  organizationId: "org-1",
  cohortKey: "krp_founder_10",
  lockedPriceUsdCents: 2900,
  status: "ACTIVE",
  paypalPlanId: "P-ALL-ACCESS-1",
  paypalSubscriptionId: "I-ALL-ACCESS-1",
  referralCodeUsed: null,
  activatedAt: "2026-08-27T00:00:00.000Z",
  currentPeriodEnd: "2026-09-27T00:00:00.000Z",
  checkoutExpiresAt: null,
  seatReserved: true,
  seatReleaseToken: null,
  createdAt: "2026-08-27T00:00:00.000Z",
  updatedAt: "2026-08-27T00:00:00.000Z",
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(KeywordProRepository.getMembership).mockResolvedValue(membership);
  vi.mocked(
    KeywordProRepository.getMembershipByPaypalSubscription,
  ).mockResolvedValue(membership);
  vi.mocked(KeywordProRepository.updateMembershipStatus).mockResolvedValue({
    ...membership,
    status: "CANCELLED",
  });
  vi.mocked(
    KeywordProRepository.listExpiredCheckoutReservations,
  ).mockResolvedValue([]);
  vi.mocked(KeywordProRepository.claimCheckout).mockResolvedValue({
    ...membership,
    status: "CHECKOUT_CREATING",
    paypalSubscriptionId: "checkout:claim-token",
    checkoutExpiresAt: "2026-08-28T01:00:00.000Z",
  });
  vi.mocked(KeywordProRepository.attachCheckout).mockResolvedValue({
    ...membership,
    status: "APPROVAL_PENDING",
    checkoutExpiresAt: "2026-08-29T00:00:00.000Z",
  });
  vi.mocked(KeywordProRepository.deleteReleasedMembership).mockResolvedValue(
    undefined,
  );
  vi.mocked(paypal.subscriptions.cancel).mockResolvedValue(undefined);
  vi.mocked(KeywordProCohortSeatRepository.abandonCheckout).mockResolvedValue(
    undefined,
  );
  vi.mocked(KeywordProCohortSeatRepository.releaseMembership).mockResolvedValue(
    undefined,
  );
  vi.mocked(KeywordProCohortSeatRepository.releaseUnattached).mockResolvedValue(
    undefined,
  );
  vi.mocked(QuotaRepository.getSubscription).mockResolvedValue(null);
  vi.mocked(getEffectiveMonthlyCreditGrant).mockResolvedValue(100_000);
  vi.mocked(KeywordProMembershipPaymentRepository.record).mockResolvedValue({
    paypalSaleId: "SALE-1",
    organizationId: "org-1",
    paypalSubscriptionId: "I-ALL-ACCESS-1",
    grossAmountUsdCents: 2_900,
    status: "pending",
    createdAt: "2026-08-27T00:00:00.000Z",
  });
  vi.mocked(
    KeywordProMembershipPaymentRepository.applyMonthlyCredits,
  ).mockResolvedValue(undefined);
  vi.mocked(
    KeywordProReferralRewardRepository.grantReferredReward,
  ).mockResolvedValue(true);
  vi.mocked(
    KeywordProReferralRewardRepository.creditReferralCommission,
  ).mockResolvedValue(false);
  vi.mocked(QuotaRepository.upsertSubscription).mockResolvedValue({
    organizationId: "org-1",
    planTier: "free",
    paypalSubscriptionId: null,
    status: "cancelled",
    currentPeriodEnd: null,
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  });
});

describe("KeywordProMembershipService referral rewards", () => {
  const attribution = {
    id: "attribution-1",
    referralCodeId: "code-1",
    referredOrganizationId: "org-1",
    status: "qualified",
    rewardedMonths: 3,
    maxRewardMonths: 12,
    referredRewardGranted: true,
    qualifiedAt: "2026-08-27T00:00:00.000Z",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  } as const;

  it("resumes a pending commission without creating or granting it twice", async () => {
    vi.mocked(
      KeywordProRepository.getAttributionForReferredOrganization,
    ).mockResolvedValueOnce({
      attribution,
      referrerOrganizationId: "org-referrer",
    });
    vi.mocked(
      KeywordProReferralRewardRepository.getCommissionByPaypalSale,
    ).mockResolvedValueOnce({
      id: "commission-1",
      attributionId: attribution.id,
      paypalSaleId: "SALE-1",
      grossAmountUsdCents: 2_900,
      rewardCredits: 5_800,
      status: "pending",
      createdAt: "2026-08-27T00:00:00.000Z",
    });
    vi.mocked(
      KeywordProReferralRewardRepository.creditReferralCommission,
    ).mockResolvedValueOnce(true);

    await expect(
      KeywordProMembershipService.rewardReferralSale({
        paypalSubscriptionId: membership.paypalSubscriptionId,
        paypalSaleId: "SALE-1",
        grossAmountUsdCents: 2_900,
      }),
    ).resolves.toBe(true);

    expect(
      KeywordProReferralRewardRepository.recordCommission,
    ).not.toHaveBeenCalled();
    expect(
      KeywordProReferralRewardRepository.creditReferralCommission,
    ).toHaveBeenCalledWith({
      attributionId: attribution.id,
      commissionId: "commission-1",
      referrerOrganizationId: "org-referrer",
      rewardCredits: 5_800,
    });
  });

  it("treats an already credited sale as an idempotent no-op", async () => {
    vi.mocked(
      KeywordProRepository.getAttributionForReferredOrganization,
    ).mockResolvedValueOnce({
      attribution,
      referrerOrganizationId: "org-referrer",
    });
    vi.mocked(
      KeywordProReferralRewardRepository.getCommissionByPaypalSale,
    ).mockResolvedValueOnce({
      id: "commission-1",
      attributionId: attribution.id,
      paypalSaleId: "SALE-1",
      grossAmountUsdCents: 2_900,
      rewardCredits: 5_800,
      status: "credited",
      createdAt: "2026-08-27T00:00:00.000Z",
    });

    await expect(
      KeywordProMembershipService.rewardReferralSale({
        paypalSubscriptionId: membership.paypalSubscriptionId,
        paypalSaleId: "SALE-1",
        grossAmountUsdCents: 2_900,
      }),
    ).resolves.toBe(false);

    expect(
      KeywordProReferralRewardRepository.creditReferralCommission,
    ).not.toHaveBeenCalled();
    expect(
      KeywordProReferralRewardRepository.recordCommission,
    ).not.toHaveBeenCalled();
  });
});

describe("KeywordProMembershipService subscription synchronization", () => {
  it("keeps a suspended membership on Pro only for the payment-recovery gate", async () => {
    vi.mocked(paypal.subscriptions.get).mockResolvedValueOnce({
      id: "I-ALL-ACCESS-1",
      plan_id: "P-ALL-ACCESS-1",
      status: "SUSPENDED",
      custom_id: "membership:org-1:krp_founder_10",
    });
    vi.mocked(
      KeywordProRepository.updateMembershipStatus,
    ).mockResolvedValueOnce({ ...membership, status: "SUSPENDED" });

    await KeywordProMembershipService.syncWebhookSubscription("I-ALL-ACCESS-1");

    expect(KeywordProRepository.updateMembershipStatus).toHaveBeenCalledWith(
      "I-ALL-ACCESS-1",
      expect.objectContaining({
        status: "SUSPENDED",
        currentPeriodEnd: membership.currentPeriodEnd,
      }),
    );
    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith({
      organizationId: "org-1",
      planTier: "pro",
      paypalSubscriptionId: "I-ALL-ACCESS-1",
      status: "past_due",
      currentPeriodEnd: membership.currentPeriodEnd,
    });
    expect(grantMonthlyCredits).not.toHaveBeenCalled();
  });

  it("never grants entitlement from a marker without a local membership", async () => {
    vi.mocked(paypal.subscriptions.get).mockResolvedValueOnce({
      id: "I-UNKNOWN",
      plan_id: "P-ALL-ACCESS-1",
      status: "ACTIVE",
      custom_id: "membership:org-1:krp_founder_10",
    });
    vi.mocked(
      KeywordProRepository.getMembershipByPaypalSubscription,
    ).mockResolvedValueOnce(null);

    await expect(
      KeywordProMembershipService.syncWebhookSubscription("I-UNKNOWN"),
    ).resolves.toBeNull();

    expect(KeywordProRepository.updateMembershipStatus).not.toHaveBeenCalled();
    expect(QuotaRepository.upsertSubscription).not.toHaveBeenCalled();
    expect(grantMonthlyCredits).not.toHaveBeenCalled();
  });

  it("releases the cohort seat when PayPal reports a terminal subscription", async () => {
    vi.mocked(paypal.subscriptions.get).mockResolvedValueOnce({
      id: "I-ALL-ACCESS-1",
      plan_id: "P-ALL-ACCESS-1",
      status: "CANCELLED",
      custom_id: "membership:org-1:krp_founder_10",
    });

    await KeywordProMembershipService.syncWebhookSubscription("I-ALL-ACCESS-1");

    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith({
      organizationId: "org-1",
      planTier: "free",
      paypalSubscriptionId: null,
      status: "cancelled",
      currentPeriodEnd: null,
    });
    expect(
      KeywordProCohortSeatRepository.releaseMembership,
    ).toHaveBeenCalledWith("org-1");
  });
});

describe("KeywordProMembershipService.startCheckout", () => {
  it("reclaims an expired checkout-creation lease before checking the account", async () => {
    vi.mocked(
      KeywordProRepository.listExpiredCheckoutReservations,
    ).mockResolvedValueOnce([
      {
        ...membership,
        status: "CHECKOUT_CREATING",
        paypalSubscriptionId: "checkout:expired-claim",
        checkoutExpiresAt: "2026-08-27T00:00:00.000Z",
      },
    ]);

    await expect(
      KeywordProMembershipService.startCheckout({
        organizationId: "org-1",
        userEmail: "owner@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(KeywordProCohortSeatRepository.abandonCheckout).toHaveBeenCalledWith(
      "org-1",
      "checkout:expired-claim",
    );
    expect(KeywordProRepository.deleteReleasedMembership).toHaveBeenCalledWith(
      "org-1",
    );
  });

  it("releases an expired approval whose PayPal subscription no longer exists", async () => {
    vi.mocked(
      KeywordProRepository.listExpiredCheckoutReservations,
    ).mockResolvedValueOnce([
      {
        ...membership,
        status: "APPROVAL_PENDING",
        checkoutExpiresAt: "2026-08-27T00:00:00.000Z",
      },
    ]);
    vi.mocked(paypal.subscriptions.get).mockRejectedValueOnce(
      new PayPalRequestError(404, "not found"),
    );

    await expect(
      KeywordProMembershipService.startCheckout({
        organizationId: "org-1",
        userEmail: "owner@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(KeywordProCohortSeatRepository.abandonCheckout).toHaveBeenCalledWith(
      "org-1",
      membership.paypalSubscriptionId,
    );
    expect(KeywordProRepository.deleteReleasedMembership).toHaveBeenCalledWith(
      "org-1",
    );
  });

  it("blocks a second subscription for an active legacy paid plan", async () => {
    vi.mocked(KeywordProRepository.getMembership).mockResolvedValueOnce(null);
    vi.mocked(QuotaRepository.getSubscription).mockResolvedValueOnce({
      organizationId: "org-1",
      planTier: "lite",
      paypalSubscriptionId: "I-LEGACY-1",
      status: "active",
      currentPeriodEnd: "2026-09-27T00:00:00.000Z",
      createdAt: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-08-01T00:00:00.000Z",
    });

    await expect(
      KeywordProMembershipService.startCheckout({
        organizationId: "org-1",
        userEmail: "owner@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(paypal.subscriptions.create).not.toHaveBeenCalled();
  });

  it("abandons the claimed cohort seat when PayPal creation fails", async () => {
    vi.mocked(KeywordProRepository.getMembership).mockResolvedValueOnce(null);
    vi.mocked(
      KeywordProConfigService.reserveCheckoutCohort,
    ).mockResolvedValueOnce({
      cohort: {
        key: "krp_founder_10",
        label: "Founding 10",
        capacity: 10,
        occupied: 9,
        remaining: 1,
        priceUsdCents: 2_900,
        paypalPlanId: "P-ALL-ACCESS-1",
        active: true,
        configured: true,
      },
      seatReserved: true,
    });
    vi.mocked(paypal.subscriptions.create).mockRejectedValueOnce(
      new Error("PayPal unavailable"),
    );

    await expect(
      KeywordProMembershipService.startCheckout({
        organizationId: "org-1",
        userEmail: "owner@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toThrow("PayPal unavailable");

    expect(KeywordProCohortSeatRepository.abandonCheckout).toHaveBeenCalledWith(
      "org-1",
      expect.stringMatching(/^checkout:/),
    );
    expect(KeywordProRepository.attachCheckout).not.toHaveBeenCalled();
  });

  it("releases an unattached cohort seat when another checkout wins the claim", async () => {
    vi.mocked(KeywordProRepository.getMembership).mockResolvedValueOnce(null);
    vi.mocked(
      KeywordProConfigService.reserveCheckoutCohort,
    ).mockResolvedValueOnce({
      cohort: {
        key: "krp_founder_10",
        label: "Founding 10",
        capacity: 10,
        occupied: 9,
        remaining: 1,
        priceUsdCents: 2_900,
        paypalPlanId: "P-ALL-ACCESS-1",
        active: true,
        configured: true,
      },
      seatReserved: true,
    });
    vi.mocked(KeywordProRepository.claimCheckout).mockResolvedValueOnce(null);

    await expect(
      KeywordProMembershipService.startCheckout({
        organizationId: "org-1",
        userEmail: "owner@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(
      KeywordProCohortSeatRepository.releaseUnattached,
    ).toHaveBeenCalledWith("krp_founder_10");
    expect(paypal.subscriptions.create).not.toHaveBeenCalled();
  });

  it("syncs a remotely active pending checkout and blocks replacement", async () => {
    vi.mocked(KeywordProRepository.getMembership).mockResolvedValueOnce({
      ...membership,
      status: "APPROVAL_PENDING",
    });
    vi.mocked(paypal.subscriptions.get).mockResolvedValueOnce({
      id: membership.paypalSubscriptionId,
      plan_id: membership.paypalPlanId,
      status: "ACTIVE",
      custom_id: "membership:org-1:krp_founder_10",
    });

    await expect(
      KeywordProMembershipService.startCheckout({
        organizationId: "org-1",
        userEmail: "owner@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        planTier: "pro",
        status: "active",
      }),
    );
    expect(paypal.subscriptions.create).not.toHaveBeenCalled();
    expect(
      KeywordProCohortSeatRepository.releaseMembership,
    ).not.toHaveBeenCalled();
  });

  it("attaches a reserved seat to the membership after PayPal checkout succeeds", async () => {
    vi.mocked(KeywordProRepository.getMembership).mockResolvedValueOnce(null);
    vi.mocked(
      KeywordProConfigService.reserveCheckoutCohort,
    ).mockResolvedValueOnce({
      cohort: {
        key: "krp_founder_10",
        label: "Founding 10",
        capacity: 10,
        occupied: 9,
        remaining: 1,
        priceUsdCents: 2_900,
        paypalPlanId: "P-ALL-ACCESS-1",
        active: true,
        configured: true,
      },
      seatReserved: true,
    });
    vi.mocked(paypal.subscriptions.create).mockResolvedValueOnce({
      id: "I-NEW",
      links: [
        {
          rel: "approve",
          href: "https://www.sandbox.paypal.com/checkout",
          method: "GET",
        },
      ],
    });

    await expect(
      KeywordProMembershipService.startCheckout({
        organizationId: "org-1",
        userEmail: "owner@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).resolves.toMatchObject({ subscriptionId: "I-NEW" });

    expect(KeywordProRepository.claimCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        cohortKey: "krp_founder_10",
        seatReserved: true,
      }),
    );
    expect(KeywordProRepository.attachCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        paypalSubscriptionId: "I-NEW",
      }),
    );
    expect(
      KeywordProCohortSeatRepository.releaseUnattached,
    ).not.toHaveBeenCalled();
  });
});

describe("KeywordProMembershipService.cancelMembership", () => {
  it("cancels PayPal and immediately removes the local paid entitlement", async () => {
    await expect(
      KeywordProMembershipService.cancelMembership("org-1"),
    ).resolves.toEqual({ cancelled: true });

    expect(paypal.subscriptions.cancel).toHaveBeenCalledWith(
      "I-ALL-ACCESS-1",
      "All Access membership cancelled by the SeoTool.im account owner",
    );
    expect(KeywordProRepository.updateMembershipStatus).toHaveBeenCalledWith(
      "I-ALL-ACCESS-1",
      { status: "CANCELLED" },
    );
    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith({
      organizationId: "org-1",
      planTier: "free",
      paypalSubscriptionId: null,
      status: "cancelled",
      currentPeriodEnd: null,
    });
    expect(
      KeywordProCohortSeatRepository.releaseMembership,
    ).toHaveBeenCalledWith("org-1");
  });

  it("does not call PayPal or change entitlement without a cancellable membership", async () => {
    vi.mocked(KeywordProRepository.getMembership).mockResolvedValueOnce(null);

    await expect(
      KeywordProMembershipService.cancelMembership("org-1"),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(paypal.subscriptions.cancel).not.toHaveBeenCalled();
    expect(QuotaRepository.upsertSubscription).not.toHaveBeenCalled();
  });
});
