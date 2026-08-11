import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  checkMock,
  getOrCreateMock,
  kvGetMock,
  kvPutMock,
  getPlanTierMock,
  upsertSubscriptionMock,
} = vi.hoisted(() => ({
  checkMock: vi.fn(),
  getOrCreateMock: vi.fn(),
  kvGetMock: vi.fn(),
  kvPutMock: vi.fn(),
  getPlanTierMock: vi.fn(),
  upsertSubscriptionMock: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: { KV: { get: kvGetMock, put: kvPutMock } },
}));

vi.mock("@/server/billing/autumn", () => ({
  autumn: {
    check: checkMock,
    customers: {
      getOrCreate: getOrCreateMock,
    },
  },
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
    kvGetMock.mockResolvedValue(null);
    kvPutMock.mockResolvedValue(undefined);
    upsertSubscriptionMock.mockResolvedValue({});
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

  it("looks up the billing customer by organization id", async () => {
    getOrCreateMock.mockResolvedValue({ id: "cust_123" });

    await getOrCreateOrganizationCustomer({
      organizationId: "org_123",
      userId: "user_123",
      userEmail: "alice@example.com",
    });

    expect(getOrCreateMock).toHaveBeenCalledWith({
      customerId: "org_123",
      email: "alice@example.com",
    });
    expect(kvPutMock).toHaveBeenCalled();
    // Default free-tier subscription row should be upserted.
    expect(upsertSubscriptionMock).toHaveBeenCalledWith({
      organizationId: "org_123",
      planTier: "free",
      status: "active",
    });
  });

  it("skips the Autumn round trip when the customer was recently ensured", async () => {
    kvGetMock.mockResolvedValue("1");

    const result = await getOrCreateOrganizationCustomer({
      organizationId: "org_123",
      userId: "user_123",
      userEmail: "alice@example.com",
    });

    expect(result).toEqual({ id: "org_123" });
    expect(getOrCreateMock).not.toHaveBeenCalled();
    // Subscription upsert should also be skipped on cache hit.
    expect(upsertSubscriptionMock).not.toHaveBeenCalled();
  });

  it("falls back to Autumn when the customer cache read fails", async () => {
    const cacheError = new Error("KV read unavailable");
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    kvGetMock.mockRejectedValue(cacheError);
    getOrCreateMock.mockResolvedValue({ id: "cust_123" });

    await expect(
      getOrCreateOrganizationCustomer({
        organizationId: "org_123",
        userId: "user_123",
        userEmail: "alice@example.com",
      }),
    ).resolves.toEqual({ id: "cust_123" });

    expect(getOrCreateMock).toHaveBeenCalledWith({
      customerId: "org_123",
      email: "alice@example.com",
    });
    expect(console.warn).toHaveBeenCalledWith(
      "billing.customer-cache-read failed:",
      cacheError,
    );
  });

  it("returns the resolved customer when the customer cache write fails", async () => {
    const cacheError = new Error("KV write unavailable");
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    getOrCreateMock.mockResolvedValue({ id: "cust_123" });
    kvPutMock.mockRejectedValue(cacheError);

    await expect(
      getOrCreateOrganizationCustomer({
        organizationId: "org_123",
        userId: "user_123",
        userEmail: "alice@example.com",
      }),
    ).resolves.toEqual({ id: "cust_123" });

    expect(console.warn).toHaveBeenCalledWith(
      "billing.customer-cache-write failed:",
      cacheError,
    );
  });
});
