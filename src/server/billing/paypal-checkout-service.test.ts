import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/billing/plan-config", () => ({
  getEffectivePaypalPlanId: vi.fn(),
}));
vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: { getSubscription: vi.fn() },
}));
vi.mock("@/server/billing/paypal", () => ({
  paypal: {
    subscriptions: {
      create: vi.fn(),
      get: vi.fn(),
      revise: vi.fn(),
    },
    orders: {
      create: vi.fn(),
      get: vi.fn(),
      capture: vi.fn(),
    },
  },
}));

import { getEffectivePaypalPlanId } from "@/server/billing/plan-config";
import { paypal } from "@/server/billing/paypal";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { PayPalCheckoutService } from "./paypal-checkout-service";
import { createTopupMarker, parseTopupMarker } from "./paypal-topup";

const planId = vi.mocked(getEffectivePaypalPlanId);
const subscriptionRepository = vi.mocked(QuotaRepository.getSubscription);
const subscriptions = vi.mocked(paypal.subscriptions);
const orders = vi.mocked(paypal.orders);

const approvalLink = {
  rel: "approve",
  href: "https://www.sandbox.paypal.com/checkout",
  method: "GET",
};

beforeEach(() => {
  vi.clearAllMocks();
  planId.mockResolvedValue("P-LITE");
  subscriptionRepository.mockResolvedValue(null);
});

describe("PayPalCheckoutService.startSubscription", () => {
  it("creates the first subscription with the organization ownership marker", async () => {
    subscriptions.create.mockResolvedValue({
      id: "I-NEW",
      links: [approvalLink],
    });

    const result = await PayPalCheckoutService.startSubscription({
      tier: "lite",
      organizationId: "org-1",
      userEmail: "buyer@example.com",
      publicUrl: "https://seotool.im",
    });

    expect(result).toEqual({
      subscriptionId: "I-NEW",
      approveUrl: approvalLink.href,
      operation: "create",
    });
    expect(subscriptions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_id: "P-LITE",
        custom_id: "org-1",
        subscriber: { email_address: "buyer@example.com" },
      }),
    );
    expect(subscriptions.revise).not.toHaveBeenCalled();
  });

  it("revises an active subscription instead of creating a duplicate", async () => {
    subscriptionRepository.mockResolvedValue({
      organizationId: "org-1",
      planTier: "lite",
      paypalSubscriptionId: "I-EXISTING",
      status: "active",
      currentPeriodEnd: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    planId.mockResolvedValue("P-PRO");
    subscriptions.get.mockResolvedValue({
      id: "I-EXISTING",
      plan_id: "P-LITE",
      status: "ACTIVE",
    });
    subscriptions.revise.mockResolvedValue({ links: [approvalLink] });

    const result = await PayPalCheckoutService.startSubscription({
      tier: "pro",
      organizationId: "org-1",
      userEmail: "buyer@example.com",
      publicUrl: "https://seotool.im",
    });

    expect(result.operation).toBe("revise");
    expect(result.subscriptionId).toBe("I-EXISTING");
    expect(subscriptions.revise).toHaveBeenCalledWith(
      "I-EXISTING",
      expect.objectContaining({ plan_id: "P-PRO" }),
    );
    expect(subscriptions.create).not.toHaveBeenCalled();
  });

  it("rejects selecting the currently active plan", async () => {
    subscriptionRepository.mockResolvedValue({
      organizationId: "org-1",
      planTier: "lite",
      paypalSubscriptionId: "I-EXISTING",
      status: "active",
      currentPeriodEnd: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    subscriptions.get.mockResolvedValue({
      id: "I-EXISTING",
      plan_id: "P-LITE",
      status: "ACTIVE",
    });

    await expect(
      PayPalCheckoutService.startSubscription({
        tier: "lite",
        organizationId: "org-1",
        userEmail: "buyer@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(subscriptions.create).not.toHaveBeenCalled();
    expect(subscriptions.revise).not.toHaveBeenCalled();
  });

  it("does not revise or duplicate a checkout that is still pending", async () => {
    subscriptionRepository.mockResolvedValue({
      organizationId: "org-1",
      planTier: "lite",
      paypalSubscriptionId: "I-PENDING",
      status: "active",
      currentPeriodEnd: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    planId.mockResolvedValue("P-PRO");
    subscriptions.get.mockResolvedValue({
      id: "I-PENDING",
      plan_id: "P-LITE",
      status: "APPROVAL_PENDING",
    });

    await expect(
      PayPalCheckoutService.startSubscription({
        tier: "pro",
        organizationId: "org-1",
        userEmail: "buyer@example.com",
        publicUrl: "https://seotool.im",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(subscriptions.create).not.toHaveBeenCalled();
    expect(subscriptions.revise).not.toHaveBeenCalled();
  });
});

describe("PayPalCheckoutService top-ups", () => {
  it("creates a top-up with a marker that survives the capture webhook", async () => {
    orders.create.mockResolvedValue({
      id: "ORDER-1",
      status: "CREATED",
      links: [approvalLink],
    });

    const result = await PayPalCheckoutService.createTopup({
      amountUsd: 10,
      organizationId: "org-1",
      publicUrl: "https://seotool.im",
    });

    expect(result.orderId).toBe("ORDER-1");
    const request = orders.create.mock.calls[0]?.[0];
    const unit = request?.purchase_units[0];
    expect(parseTopupMarker(unit?.custom_id)).toBe("org-1");
    expect(unit?.reference_id).toBe(unit?.custom_id);
    expect(request?.application_context.return_url).toBe(
      "https://seotool.im/billing?topup=success",
    );
  });

  it("captures only an approved order owned by the active organization", async () => {
    const marker = createTopupMarker("org-1", 123);
    orders.get.mockResolvedValue({
      id: "ORDER-1",
      status: "APPROVED",
      purchase_units: [
        {
          custom_id: marker,
          reference_id: marker,
          amount: { currency_code: "USD", value: "10.00" },
        },
      ],
    });
    orders.capture.mockResolvedValue({ id: "ORDER-1", status: "COMPLETED" });

    await expect(
      PayPalCheckoutService.captureTopup({
        orderId: "ORDER-1",
        organizationId: "org-1",
      }),
    ).resolves.toEqual({ completed: true, orderId: "ORDER-1" });
    expect(orders.capture).toHaveBeenCalledWith("ORDER-1");
  });

  it("rejects an approved order belonging to another organization", async () => {
    const marker = createTopupMarker("org-other", 123);
    orders.get.mockResolvedValue({
      id: "ORDER-1",
      status: "APPROVED",
      purchase_units: [
        {
          custom_id: marker,
          amount: { currency_code: "USD", value: "10.00" },
        },
      ],
    });

    await expect(
      PayPalCheckoutService.captureTopup({
        orderId: "ORDER-1",
        organizationId: "org-1",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(orders.capture).not.toHaveBeenCalled();
  });

  it("treats a completed order as idempotent success", async () => {
    const marker = createTopupMarker("org-1", 123);
    orders.get.mockResolvedValue({
      id: "ORDER-1",
      status: "COMPLETED",
      purchase_units: [
        {
          custom_id: marker,
          amount: { currency_code: "USD", value: "10.00" },
        },
      ],
    });

    await expect(
      PayPalCheckoutService.captureTopup({
        orderId: "ORDER-1",
        organizationId: "org-1",
      }),
    ).resolves.toEqual({ completed: true, orderId: "ORDER-1" });
    expect(orders.capture).not.toHaveBeenCalled();
  });
});

describe("top-up marker", () => {
  it("round-trips organization ids and rejects malformed input", () => {
    expect(parseTopupMarker(createTopupMarker("org-with-hyphens", 123))).toBe(
      "org-with-hyphens",
    );
    expect(parseTopupMarker("topup:org:not-a-time")).toBeNull();
    expect(parseTopupMarker("org-1")).toBeNull();
  });
});
