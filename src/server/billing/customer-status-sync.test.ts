import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/db/schema", () => ({
  billingCustomerStatus: {},
  subscription: {},
}));
vi.mock("@/server/billing/paypal", () => ({
  paypal: { subscriptions: { get: vi.fn() } },
}));
vi.mock("@/server/billing/plan-config", () => ({
  getEffectivePlanConfigs: vi.fn(),
}));
vi.mock("@/server/billing/loops-sync", () => ({
  syncBillingStatusToLoops: vi.fn(),
}));
vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getSubscription: vi.fn(),
    resetUsageQuotaForOrg: vi.fn(),
  },
}));
vi.mock("@/server/billing/credits", () => ({
  grantMonthlyCredits: vi.fn(),
}));

import { paypal } from "@/server/billing/paypal";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { syncPaypalCustomerStatus } from "./customer-status-sync";

const subscriptions = vi.mocked(paypal.subscriptions);
const quotaRepository = vi.mocked(QuotaRepository);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("syncPaypalCustomerStatus", () => {
  it("propagates an upstream lookup failure instead of downgrading to free", async () => {
    quotaRepository.getSubscription.mockResolvedValue({
      organizationId: "org-1",
      planTier: "pro",
      paypalSubscriptionId: "I-123",
      status: "active",
      currentPeriodEnd: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const upstreamError = new Error("PayPal temporarily unavailable");
    subscriptions.get.mockRejectedValue(upstreamError);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(syncPaypalCustomerStatus("org-1")).rejects.toBe(upstreamError);
    expect(quotaRepository.resetUsageQuotaForOrg).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
