import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPlanTierMock, upsertSubscriptionMock, grantMonthlyCreditsMock } =
  vi.hoisted(() => ({
    getPlanTierMock: vi.fn(),
    upsertSubscriptionMock: vi.fn(),
    grantMonthlyCreditsMock: vi.fn(),
  }));

vi.mock("@/server/billing/credits", () => ({
  getCreditBalance: vi.fn().mockResolvedValue({
    monthlyRemaining: 0,
    topupRemaining: 0,
    totalRemaining: 0,
  }),
  areCreditsDepleted: vi.fn().mockResolvedValue(true),
  deductCredits: vi.fn(),
  grantMonthlyCredits: grantMonthlyCreditsMock,
}));

vi.mock("@/server/lib/runtime-env", () => ({
  isHostedServerAuthMode: vi.fn(),
}));

vi.mock("@/server/lib/posthog", () => ({
  captureServerEvent: vi.fn(),
}));

vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getPlanTier: getPlanTierMock,
    upsertSubscription: upsertSubscriptionMock,
    getSubscription: vi.fn().mockResolvedValue(null),
  },
}));

import {
  customerHasPaidPlan,
  getOrCreateOrganizationCustomer,
} from "./subscription";

describe("subscription billing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertSubscriptionMock.mockResolvedValue({});
    grantMonthlyCreditsMock.mockResolvedValue(undefined);
  });

  it("returns true when the org is on a paid tier (lite)", async () => {
    getPlanTierMock.mockResolvedValue("lite");
    await expect(customerHasPaidPlan("org_123")).resolves.toBe(true);
    expect(getPlanTierMock).toHaveBeenCalledWith("org_123");
  });

  it("returns true when the org is on a paid tier (agency)", async () => {
    getPlanTierMock.mockResolvedValue("agency");
    await expect(customerHasPaidPlan("org_123")).resolves.toBe(true);
  });

  it("returns false when org is on the free tier", async () => {
    getPlanTierMock.mockResolvedValue("free");
    await expect(customerHasPaidPlan("org_123")).resolves.toBe(false);
  });

  it("creates default free-tier subscription and grants credits", async () => {
    await getOrCreateOrganizationCustomer({
      organizationId: "org_123",
      userId: "user_123",
      userEmail: "alice@example.com",
    });

    expect(upsertSubscriptionMock).toHaveBeenCalledWith({
      organizationId: "org_123",
      planTier: "free",
      status: "active",
    });
    expect(grantMonthlyCreditsMock).toHaveBeenCalledWith("org_123", "free");
  });

  it("returns the organization id", async () => {
    const result = await getOrCreateOrganizationCustomer({
      organizationId: "org_123",
      userId: "user_123",
      userEmail: "alice@example.com",
    });

    expect(result).toEqual({ id: "org_123" });
  });

  it("handles subscription upsert failure gracefully", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    upsertSubscriptionMock.mockRejectedValue(new Error("DB error"));

    const result = await getOrCreateOrganizationCustomer({
      organizationId: "org_123",
      userId: "user_123",
      userEmail: "alice@example.com",
    });

    expect(result).toEqual({ id: "org_123" });
    expect(console.warn).toHaveBeenCalledWith(
      "billing.subscription-default-create failed:",
      expect.any(Error),
    );
  });

  it("handles credit grant failure gracefully", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    grantMonthlyCreditsMock.mockRejectedValue(new Error("DB error"));

    const result = await getOrCreateOrganizationCustomer({
      organizationId: "org_123",
      userId: "user_123",
      userEmail: "alice@example.com",
    });

    expect(result).toEqual({ id: "org_123" });
    expect(console.warn).toHaveBeenCalledWith(
      "billing.credits-default-grant failed:",
      expect.any(Error),
    );
  });
});
