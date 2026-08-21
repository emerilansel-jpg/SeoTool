import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOwnerEmailMock, getPlanTierMock } = vi.hoisted(() => ({
  getOwnerEmailMock: vi.fn(),
  getPlanTierMock: vi.fn(),
}));

vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getOwnerEmail: getOwnerEmailMock,
    getPlanTier: getPlanTierMock,
  },
}));

vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: vi.fn().mockResolvedValue(undefined),
}));

import { getPlanTier } from "./QuotaService";

describe("QuotaService platform-admin tier override", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["alfu13.sf@gmail.com", "emerilansel@gmail.com"])(
    "treats the built-in admin owner %s as agency",
    async (email) => {
      getOwnerEmailMock.mockResolvedValue(email);
      getPlanTierMock.mockResolvedValue("free");

      await expect(getPlanTier(`org-${email}`)).resolves.toBe("agency");
      expect(getPlanTierMock).not.toHaveBeenCalled();
    },
  );

  it("preserves the stored plan for non-admin org owners", async () => {
    getOwnerEmailMock.mockResolvedValue("customer@example.com");
    getPlanTierMock.mockResolvedValue("pro");

    await expect(getPlanTier("org-customer")).resolves.toBe("pro");
    expect(getPlanTierMock).toHaveBeenCalledWith("org-customer");
  });
});
