// oxlint-disable typescript-eslint/unbound-method -- direct mocked repository method assertions are intentional
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./paypal-webhook-verify", () => ({
  extractWebhookHeaders: vi.fn(),
  verifyWebhookSignature: vi.fn(),
}));
vi.mock("./customer-status-sync", () => ({
  syncPaypalCustomerStatus: vi.fn(),
}));
vi.mock("./credits", () => ({
  addTopupCredits: vi.fn(),
}));
vi.mock("@/server/lib/posthog", () => ({
  captureServerError: vi.fn(),
}));
vi.mock(
  "@/server/features/admin/repositories/PayPalWebhookEventRepository",
  () => ({
    PayPalWebhookEventRepository: {
      record: vi.fn(),
      markStatus: vi.fn(),
    },
  }),
);
vi.mock("@/server/features/keywords/repositories/KeywordProRepository", () => ({
  KeywordProRepository: {
    getMembershipByPaypalSubscription: vi.fn(),
  },
}));
vi.mock(
  "@/server/features/keywords/services/KeywordProMembershipService",
  () => ({
    KeywordProMembershipService: {
      syncWebhookSubscription: vi.fn(),
      rewardReferralSale: vi.fn(),
    },
  }),
);

import { addTopupCredits } from "./credits";
import { syncPaypalCustomerStatus } from "./customer-status-sync";
import {
  extractWebhookHeaders,
  verifyWebhookSignature,
} from "./paypal-webhook-verify";
import { createTopupMarker } from "./paypal-topup";
import { handlePaypalWebhookRequest } from "./paypal-webhook";
import { PayPalWebhookEventRepository } from "@/server/features/admin/repositories/PayPalWebhookEventRepository";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProMembershipService } from "@/server/features/keywords/services/KeywordProMembershipService";

const extractHeaders = vi.mocked(extractWebhookHeaders);
const verifySignature = vi.mocked(verifyWebhookSignature);
const webhookEvents = vi.mocked(PayPalWebhookEventRepository);
const addCredits = vi.mocked(addTopupCredits);
const syncCustomer = vi.mocked(syncPaypalCustomerStatus);
const keywordProRepository = vi.mocked(KeywordProRepository);
const keywordProMembership = vi.mocked(KeywordProMembershipService);

const verifiedHeaders = {
  transmissionId: "transmission-1",
  transmissionTime: "2026-08-24T00:00:00Z",
  certUrl: "https://api.paypal.com/cert",
  transmissionSig: "signature",
};

function request(payload: unknown, method = "POST") {
  const init: RequestInit =
    method === "POST"
      ? {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      : { method, headers: { "Content-Type": "application/json" } };
  return new Request("https://seotool.im/api/paypal/webhook", init);
}

beforeEach(() => {
  vi.clearAllMocks();
  extractHeaders.mockReturnValue(verifiedHeaders);
  verifySignature.mockResolvedValue(true);
  webhookEvents.record.mockResolvedValue(true);
  webhookEvents.markStatus.mockResolvedValue();
  addCredits.mockResolvedValue();
  keywordProRepository.getMembershipByPaypalSubscription.mockResolvedValue(
    null,
  );
  keywordProMembership.syncWebhookSubscription.mockResolvedValue(null);
  keywordProMembership.rewardReferralSale.mockResolvedValue(false);
  syncCustomer.mockResolvedValue({
    organizationId: "org-1",
    isPaying: false,
    paidPlanId: null,
    paidPlanStatus: "inactive",
    planTier: "free",
    paypalSubscriptionId: null,
    currentPeriodEnd: null,
    customerJson: "{}",
    syncedAt: "2026-08-24T00:00:00.000Z",
  });
});

describe("handlePaypalWebhookRequest", () => {
  it("rejects non-POST requests", async () => {
    const response = await handlePaypalWebhookRequest(request({}, "GET"));
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });

  it("rejects missing headers and invalid signatures before parsing", async () => {
    extractHeaders.mockReturnValueOnce(null);
    const missing = await handlePaypalWebhookRequest(request({}));
    expect(missing.status).toBe(400);

    verifySignature.mockResolvedValueOnce(false);
    const invalid = await handlePaypalWebhookRequest(request({}));
    expect(invalid.status).toBe(401);
    expect(webhookEvents.record).not.toHaveBeenCalled();
  });

  it("rejects verified payloads without a stable PayPal event id", async () => {
    const response = await handlePaypalWebhookRequest(
      request({ event_type: "BILLING.SUBSCRIPTION.ACTIVATED", resource: {} }),
    );
    expect(response.status).toBe(400);
    expect(webhookEvents.record).not.toHaveBeenCalled();
  });

  it("grants a completed top-up exactly once and marks it processed", async () => {
    const response = await handlePaypalWebhookRequest(
      request({
        id: "WH-TOPUP-1",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          custom_id: createTopupMarker("org-1", 123),
          amount: { currency_code: "USD", value: "10.00" },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(addCredits).toHaveBeenCalledWith("org-1", 10000);
    expect(syncCustomer).not.toHaveBeenCalled();
    expect(webhookEvents.markStatus).toHaveBeenCalledWith(
      "WH-TOPUP-1",
      "processed",
      null,
    );

    webhookEvents.record.mockResolvedValueOnce(false);
    await handlePaypalWebhookRequest(
      request({
        id: "WH-TOPUP-1",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          custom_id: createTopupMarker("org-1", 123),
          amount: { currency_code: "USD", value: "10.00" },
        },
      }),
    );
    expect(addCredits).toHaveBeenCalledTimes(1);
  });

  it("does not mistake a subscription capture for a credit top-up", async () => {
    await handlePaypalWebhookRequest(
      request({
        id: "WH-RENEWAL-1",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          custom_id: "org-1",
          amount: { currency_code: "USD", value: "49.00" },
        },
      }),
    );

    expect(addCredits).not.toHaveBeenCalled();
    expect(syncCustomer).toHaveBeenCalledWith("org-1", undefined);
  });

  it("routes Keyword Research Pro subscription events away from the main plan sync", async () => {
    const response = await handlePaypalWebhookRequest(
      request({
        id: "WH-KRP-ACTIVE-1",
        event_type: "BILLING.SUBSCRIPTION.ACTIVATED",
        resource: {
          id: "I-KRP-1",
          custom_id: "krp:org-krp:krp_founder_10",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(keywordProMembership.syncWebhookSubscription).toHaveBeenCalledWith(
      "I-KRP-1",
    );
    expect(syncCustomer).not.toHaveBeenCalled();
  });

  it("credits a verified Keyword Research Pro referral sale", async () => {
    keywordProRepository.getMembershipByPaypalSubscription.mockResolvedValue({
      organizationId: "org-referred",
      cohortKey: "krp_founder_10",
      lockedPriceUsdCents: 1900,
      status: "ACTIVE",
      paypalPlanId: "P-KRP-1",
      paypalSubscriptionId: "I-KRP-1",
      referralCodeUsed: null,
      activatedAt: "2026-08-24T00:00:00.000Z",
      currentPeriodEnd: null,
      createdAt: "2026-08-24T00:00:00.000Z",
      updatedAt: "2026-08-24T00:00:00.000Z",
    });
    keywordProMembership.rewardReferralSale.mockResolvedValue(true);

    const response = await handlePaypalWebhookRequest(
      request({
        id: "WH-KRP-SALE-1",
        event_type: "PAYMENT.SALE.COMPLETED",
        resource: {
          id: "SALE-1",
          billing_agreement_id: "I-KRP-1",
          amount: { currency: "USD", total: "19.00" },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(keywordProMembership.rewardReferralSale).toHaveBeenCalledWith({
      paypalSubscriptionId: "I-KRP-1",
      paypalSaleId: "SALE-1",
      grossAmountUsdCents: 1900,
    });
    expect(syncCustomer).not.toHaveBeenCalled();
  });

  it("does not make a granted top-up retryable when only its audit update fails", async () => {
    webhookEvents.markStatus.mockRejectedValueOnce(
      new Error("audit status update failed"),
    );
    const response = await handlePaypalWebhookRequest(
      request({
        id: "WH-TOPUP-AUDIT-FAIL",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          custom_id: createTopupMarker("org-1", 123),
          amount: { currency_code: "USD", value: "10.00" },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(addCredits).toHaveBeenCalledTimes(1);
    expect(webhookEvents.markStatus).toHaveBeenCalledTimes(1);
    expect(webhookEvents.markStatus).not.toHaveBeenCalledWith(
      "WH-TOPUP-AUDIT-FAIL",
      "failed",
      expect.any(String),
    );
  });

  it("records a failed processing state and asks PayPal to retry", async () => {
    syncCustomer.mockRejectedValueOnce(new Error("temporary database failure"));
    const response = await handlePaypalWebhookRequest(
      request({
        id: "WH-FAIL-1",
        event_type: "BILLING.SUBSCRIPTION.ACTIVATED",
        resource: { custom_id: "org-1" },
      }),
    );

    expect(response.status).toBe(500);
    expect(webhookEvents.markStatus).toHaveBeenCalledWith(
      "WH-FAIL-1",
      "failed",
      "temporary database failure",
    );
  });
});
