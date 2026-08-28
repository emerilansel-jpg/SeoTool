import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOwnerIdentityMock, getSubscriptionMock, getOptionalEnvValueMock } =
  vi.hoisted(() => ({
    getOwnerIdentityMock: vi.fn(),
    getSubscriptionMock: vi.fn(),
    getOptionalEnvValueMock: vi.fn(),
  }));

vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getOwnerIdentity: getOwnerIdentityMock,
    getSubscription: getSubscriptionMock,
  },
}));

vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: getOptionalEnvValueMock,
}));

import { getPlanTier } from "./QuotaService";

describe("QuotaService platform-admin tier override", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOptionalEnvValueMock.mockResolvedValue(undefined);
  });

  it("treats an owner in the configured user-id allowlist as agency", async () => {
    getOptionalEnvValueMock.mockImplementation(async (key: string) =>
      key === "PLATFORM_ADMIN_USER_IDS" ? "admin-user-1" : undefined,
    );
    getOwnerIdentityMock.mockResolvedValue({
      userId: "admin-user-1",
      userEmail: "admin@example.com",
    });
    getSubscriptionMock.mockResolvedValue(null);

    await expect(getPlanTier("org-admin-id")).resolves.toBe("agency");
    expect(getSubscriptionMock).not.toHaveBeenCalled();
  });

  it("supports the explicitly configured email fallback", async () => {
    getOptionalEnvValueMock.mockImplementation(async (key: string) =>
      key === "PLATFORM_ADMIN_EMAILS" ? "admin@example.com" : undefined,
    );
    getOwnerIdentityMock.mockResolvedValue({
      userId: "admin-user-2",
      userEmail: "admin@example.com",
    });

    await expect(getPlanTier("org-admin-email")).resolves.toBe("agency");
    expect(getSubscriptionMock).not.toHaveBeenCalled();
  });

  it("preserves the stored plan for non-admin org owners", async () => {
    getOwnerIdentityMock.mockResolvedValue({
      userId: "customer-1",
      userEmail: "customer@example.com",
    });
    getSubscriptionMock.mockResolvedValue({
      planTier: "pro",
      status: "active",
      currentPeriodEnd: null,
    });

    await expect(getPlanTier("org-customer")).resolves.toBe("pro");
    expect(getSubscriptionMock).toHaveBeenCalledWith("org-customer");
  });

  it("falls back to Free when a stored paid tier is no longer entitled", async () => {
    getOwnerIdentityMock.mockResolvedValue({
      userId: "customer-2",
      userEmail: "customer-2@example.com",
    });
    getSubscriptionMock.mockResolvedValue({
      planTier: "pro",
      status: "canceled",
      currentPeriodEnd: null,
    });

    await expect(getPlanTier("org-canceled")).resolves.toBe("free");
  });
});
