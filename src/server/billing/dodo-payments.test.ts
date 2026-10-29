import { describe, expect, it, vi, beforeEach } from "vitest";
import { DodoCheckoutService } from "./dodo-checkout-service";
import { handleDodoWebhookRequest } from "./dodo-webhook";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";

const mockDodo = {
  checkoutSessions: {
    create: vi.fn(async () => ({
      session_id: "cks_mock_123",
      checkout_url: "https://checkout.dodopayments.com/session/cks_mock_123",
    })),
    retrieve: vi.fn(async () => ({
      id: "cks_mock_123",
      payment_status: "succeeded",
      payment_id: "pay_mock_123",
    })),
  },
  payments: {
    retrieve: vi.fn(async () => ({
      payment_id: "pay_mock_123",
      status: "succeeded",
      metadata: {
        organizationId: "org-test-123",
        planKey: "krp_founder_10",
        type: "ltd",
      },
    })),
  },
  webhooks: {
    unwrap: vi.fn(),
    unsafeUnwrap: vi.fn((body: string) => JSON.parse(body)),
  },
};

vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getSubscription: vi.fn(),
    upsertSubscription: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("./credits", () => ({
  addTopupCredits: vi.fn().mockResolvedValue(1000),
}));

vi.mock("./dodo-client", () => ({
  DODO_PRODUCT_IDS: {
    ltd: {
      krp_founder_10: "pdt_mock_ltd",
    },
    subscriptions: {
      starter: "pdt_mock_starter",
      lite: "pdt_mock_lite",
      standard: "pdt_mock_standard",
      pro: "pdt_mock_pro",
      agency: "pdt_mock_agency",
    },
    topup: "pdt_mock_topup",
  },
  getDodoClient: vi.fn(async () => mockDodo),
}));

describe("Dodo Payments Checkout & Webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an LTD checkout session", async () => {
    const res = await DodoCheckoutService.createLtdCheckout({
      planKey: "krp_founder_10",
      organizationId: "org-1",
      userEmail: "founder@example.com",
      publicUrl: "https://seotool.im",
    });

    expect(res.sessionId).toBe("cks_mock_123");
    expect(res.checkoutUrl).toContain("checkout.dodopayments.com");
  });

  it("creates a Monthly Subscription checkout session", async () => {
    const res = await DodoCheckoutService.createSubscriptionCheckout({
      tier: "lite",
      organizationId: "org-1",
      userEmail: "founder@example.com",
      publicUrl: "https://seotool.im",
    });

    expect(res.sessionId).toBe("cks_mock_123");
    expect(res.checkoutUrl).toBeDefined();
  });

  it("verifies and activates an LTD purchase upon session return", async () => {
    const res = await DodoCheckoutService.verifyCheckout({
      sessionId: "cks_mock_123",
      organizationId: "org-test-123",
    });

    expect(res.active).toBe(true);
    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-test-123",
        status: "active",
      }),
    );
  });

  it("processes payment.succeeded webhook and activates membership", async () => {
    const payload = {
      type: "payment.succeeded",
      data: {
        payment_id: "pay_live_abc",
        status: "succeeded",
        metadata: {
          organizationId: "org-webhook-1",
          planKey: "krp_founder_10",
          type: "ltd",
        },
      },
    };

    const req = new Request("http://localhost:3000/api/billing/dodo-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await handleDodoWebhookRequest(req);
    expect(res.status).toBe(200);
    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-webhook-1",
        status: "active",
      }),
    );
  });
});
