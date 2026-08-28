// oxlint-disable typescript-eslint/unbound-method -- direct mocked repository assertions are intentional
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/billing/paypal", () => ({
  paypal: {
    billingPlans: { create: vi.fn() },
    products: { create: vi.fn() },
  },
}));

vi.mock("@/server/features/admin/repositories/AdminSettingsRepository", () => ({
  AdminSettingsRepository: {
    get: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("@/server/features/keywords/repositories/KeywordProRepository", () => ({
  KeywordProRepository: {
    countReservedMemberships: vi.fn(),
    listCohortConfigs: vi.fn(),
  },
}));

vi.mock(
  "@/server/features/keywords/repositories/KeywordProCohortSeatRepository",
  () => ({
    KeywordProCohortSeatRepository: {
      reserve: vi.fn(),
    },
  }),
);

import { KeywordProCohortSeatRepository } from "@/server/features/keywords/repositories/KeywordProCohortSeatRepository";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProConfigService } from "./KeywordProConfigService";

const now = "2026-08-27T00:00:00.000Z";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(KeywordProRepository.listCohortConfigs).mockResolvedValue([
    {
      tier: "krp_founder_10",
      priceUsdCents: 2_900,
      monthlyCredits: 0,
      paypalPlanId: "P-FOUNDER",
      syncStatus: "synced",
      active: true,
      reservedSeats: 9,
      updatedByUserId: "admin-1",
      updatedAt: now,
    },
    {
      tier: "krp_early_20",
      priceUsdCents: 4_900,
      monthlyCredits: 0,
      paypalPlanId: "P-EARLY",
      syncStatus: "synced",
      active: true,
      reservedSeats: 0,
      updatedByUserId: "admin-1",
      updatedAt: now,
    },
  ]);
  vi.mocked(KeywordProRepository.countReservedMemberships).mockResolvedValue(0);
});

describe("KeywordProConfigService.reserveCheckoutCohort", () => {
  it("falls forward to the next cohort when another checkout wins the last seat", async () => {
    vi.mocked(KeywordProCohortSeatRepository.reserve)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(
      KeywordProConfigService.reserveCheckoutCohort(),
    ).resolves.toMatchObject({
      cohort: { key: "krp_early_20", paypalPlanId: "P-EARLY" },
      seatReserved: true,
    });

    expect(KeywordProCohortSeatRepository.reserve).toHaveBeenNthCalledWith(
      1,
      "krp_founder_10",
      10,
    );
    expect(KeywordProCohortSeatRepository.reserve).toHaveBeenNthCalledWith(
      2,
      "krp_early_20",
      20,
    );
  });
});
