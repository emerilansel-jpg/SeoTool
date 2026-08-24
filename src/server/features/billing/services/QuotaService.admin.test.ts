import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOwnerIdentityMock, getPlanTierMock, getOptionalEnvValueMock } =
  vi.hoisted(() => ({
    getOwnerIdentityMock: vi.fn(),
    getPlanTierMock: vi.fn(),
    getOptionalEnvValueMock: vi.fn(),
  }));

vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getOwnerIdentity: getOwnerIdentityMock,
    getPlanTier: getPlanTierMock,
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
    getPlanTierMock.mockResolvedValue("free");

    await expect(getPlanTier("org-admin-id")).resolves.toBe("agency");
    expect(getPlanTierMock).not.toHaveBeenCalled();
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
    expect(getPlanTierMock).not.toHaveBeenCalled();
  });

  it("preserves the stored plan for non-admin org owners", async () => {
    getOwnerIdentityMock.mockResolvedValue({
      userId: "customer-1",
      userEmail: "customer@example.com",
    });
    getPlanTierMock.mockResolvedValue("pro");

    await expect(getPlanTier("org-customer")).resolves.toBe("pro");
    expect(getPlanTierMock).toHaveBeenCalledWith("org-customer");
  });
});
