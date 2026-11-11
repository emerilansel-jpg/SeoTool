import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { addTopupCredits } from "./credits";
import { DodoCheckoutService } from "./dodo-checkout-service";
import { handleDodoWebhookRequest } from "./dodo-webhook";

const recordedEvents = new Set<string>();
const mockGetOptionalEnvValue = vi.fn(async (key: string) =>
  key === "DODO_WEBHOOK_SECRET" ? "whsec_test_secret" : undefined,
);

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
      subscription_id: null as string | null,
      metadata: {
        organizationId: "org-test-123",
        planKey: "krp_founder_10",
        type: "ltd",
      } as Record<string, string>,
    })),
  },
  subscriptions: {
    retrieve: vi.fn(async () => ({
      subscription_id: "sub_mock_123",
      previous_billing_date: "2026-11-01T00:00:00.000Z",
      next_billing_date: "2026-12-01T00:00:00.000Z",
      created_at: "2026-11-01T00:00:00.000Z",
      customer: { customer_id: "cus_mock_123" },
    })),
  },
  webhooks: {
    unwrap: vi.fn((body: string) => {
      const parsed: unknown = JSON.parse(body);
      return parsed;
    }),
  },
};

vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: (key: string) => mockGetOptionalEnvValue(key),
}));

vi.mock(
  "@/server/features/admin/repositories/PayPalWebhookEventRepository",
  () => ({
    PayPalWebhookEventRepository: {
      record: vi.fn(async ({ id }: { id: string }) => {
        if (recordedEvents.has(id)) return false;
        recordedEvents.add(id);
        return true;
      }),
      markStatus: vi.fn(async () => undefined),
    },
  }),
);

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
    recordedEvents.clear();
    mockGetOptionalEnvValue.mockImplementation(async (key: string) =>
      key === "DODO_WEBHOOK_SECRET" ? "whsec_test_secret" : undefined,
    );
    mockDodo.payments.retrieve.mockResolvedValue({
      payment_id: "pay_mock_123",
      status: "succeeded",
      subscription_id: null,
      metadata: {
        organizationId: "org-test-123",
        planKey: "krp_founder_10",
        type: "ltd",
      },
    });
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

  it("verifies and activates an LTD purchase once (idempotent on reloads)", async () => {
    const first = await DodoCheckoutService.verifyCheckout({
      sessionId: "cks_mock_123",
      organizationId: "org-test-123",
    });
    const second = await DodoCheckoutService.verifyCheckout({
      sessionId: "cks_mock_123",
      organizationId: "org-test-123",
    });

    expect(first.active).toBe(true);
    expect(second.active).toBe(true);
    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-test-123",
        planTier: "byok",
        status: "active",
      }),
    );
    expect(addTopupCredits).toHaveBeenCalledTimes(1);
    expect(addTopupCredits).toHaveBeenCalledWith("org-test-123", 5000);
  });

  it("deduplicates credits when webhook and verifyCheckout both fire for the same LTD payment", async () => {
    const payload = {
      type: "payment.succeeded",
      data: {
        payment_id: "pay_mock_123",
        status: "succeeded",
        metadata: {
          organizationId: "org-test-123",
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

    const webhookRes = await handleDodoWebhookRequest(req);
    expect(webhookRes.status).toBe(200);

    const verifyRes = await DodoCheckoutService.verifyCheckout({
      sessionId: "cks_mock_123",
      organizationId: "org-test-123",
    });
    expect(verifyRes.active).toBe(true);
    expect(addTopupCredits).toHaveBeenCalledTimes(1);
  });

  it("deduplicates monthly subscription credits across subscription.active webhook and verifyCheckout", async () => {
    mockDodo.payments.retrieve.mockResolvedValue({
      payment_id: "pay_sub_1",
      status: "succeeded",
      subscription_id: "sub_mock_123",
      metadata: {
        organizationId: "org-sub-1",
        tier: "lite",
        type: "subscription",
      },
    });

    const webhookReq = new Request(
      "http://localhost:3000/api/billing/dodo-webhook",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscription.active",
          data: {
            subscription_id: "sub_mock_123",
            previous_billing_date: "2026-11-01T00:00:00.000Z",
            next_billing_date: "2026-12-01T00:00:00.000Z",
            created_at: "2026-11-01T00:00:00.000Z",
            metadata: {
              organizationId: "org-sub-1",
              tier: "lite",
              type: "subscription",
            },
          },
        }),
      },
    );

    const webhookRes = await handleDodoWebhookRequest(webhookReq);
    expect(webhookRes.status).toBe(200);

    const verifyRes = await DodoCheckoutService.verifyCheckout({
      sessionId: "cks_mock_123",
      organizationId: "org-sub-1",
    });
    expect(verifyRes.active).toBe(true);
    expect(QuotaRepository.upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-sub-1",
        planTier: "lite",
        paypalSubscriptionId: "dodo:sub_mock_123",
        status: "active",
      }),
    );
    expect(addTopupCredits).toHaveBeenCalledTimes(1);
    expect(addTopupCredits).toHaveBeenCalledWith("org-sub-1", 7700);
  });

  it("rejects webhooks when DODO_WEBHOOK_SECRET is not configured", async () => {
    mockGetOptionalEnvValue.mockResolvedValue(undefined);

    const req = new Request("http://localhost:3000/api/billing/dodo-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "payment.succeeded", data: {} }),
    });

    const res = await handleDodoWebhookRequest(req);
    expect(res.status).toBe(503);
    expect(QuotaRepository.upsertSubscription).not.toHaveBeenCalled();
    expect(addTopupCredits).not.toHaveBeenCalled();
  });

  it("rejects webhooks with invalid signatures", async () => {
    mockDodo.webhooks.unwrap.mockImplementationOnce(() => {
      throw new Error("Invalid signature");
    });

    const req = new Request("http://localhost:3000/api/billing/dodo-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "payment.succeeded", data: {} }),
    });

    const res = await handleDodoWebhookRequest(req);
    expect(res.status).toBe(401);
    expect(addTopupCredits).not.toHaveBeenCalled();
  });

  it("rejects cross-organization checkout verification", async () => {
    await expect(
      DodoCheckoutService.verifyCheckout({
        sessionId: "cks_mock_123",
        organizationId: "org-attacker",
      }),
    ).rejects.toThrow("Checkout session does not belong to this workspace.");
    expect(QuotaRepository.upsertSubscription).not.toHaveBeenCalled();
    expect(addTopupCredits).not.toHaveBeenCalled();
  });

  it("does not grant Founder Pass when payment metadata is missing/unknown", async () => {
    mockDodo.payments.retrieve.mockResolvedValue({
      payment_id: "pay_unknown",
      status: "succeeded",
      subscription_id: null,
      metadata: { organizationId: "org-test-123" },
    });

    const res = await DodoCheckoutService.verifyCheckout({
      sessionId: "cks_mock_123",
      organizationId: "org-test-123",
    });

    expect(res).toEqual({ active: false, status: "unrecognized_payment_type" });
    expect(QuotaRepository.upsertSubscription).not.toHaveBeenCalled();
    expect(addTopupCredits).not.toHaveBeenCalled();
  });
});
