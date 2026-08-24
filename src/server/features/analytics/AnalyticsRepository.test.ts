// oxlint-disable typescript-eslint/unbound-method -- direct mocked query-builder assertions are intentional
import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => ({
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  groupBy: vi.fn(),
}));

vi.mock("@/db/schema", () => ({
  subscription: {
    planTier: "subscription.plan_tier",
    status: "subscription.status",
    organizationId: "subscription.organization_id",
  },
  usageQuota: {
    feature: "usage_quota.feature",
    period: "usage_quota.period",
    used: "usage_quota.used",
  },
  organization: {
    id: "organization.id",
    name: "organization.name",
    createdAt: "organization.created_at",
  },
}));

vi.mock("@/db", () => ({
  db: { select: query.select },
}));

vi.mock("@/server/billing/plan-config", () => ({
  getEffectivePricesUsd: vi.fn().mockResolvedValue({
    free: 0,
    lite: 49,
    pro: 149,
    agency: 499,
  }),
}));

import { AnalyticsRepository } from "./AnalyticsRepository";
import { subscription } from "@/db/schema";
import { getEffectivePricesUsd } from "@/server/billing/plan-config";

const getPrices = vi.mocked(getEffectivePricesUsd);

beforeEach(() => {
  vi.clearAllMocks();
  query.select.mockReturnValue({ from: query.from });
  query.from.mockReturnValue({ where: query.where });
  query.where.mockReturnValue({ groupBy: query.groupBy });
  getPrices.mockResolvedValue({
    free: 0,
    lite: 49,
    pro: 149,
    agency: 499,
  });
  query.groupBy.mockResolvedValue([
    { planTier: "lite", orgCount: 2 },
    { planTier: "pro", orgCount: 1 },
  ]);
});

describe("AnalyticsRepository.getMrrEstimate", () => {
  it("groups active subscription counts by plan tier for Postgres", async () => {
    await expect(AnalyticsRepository.getMrrEstimate()).resolves.toMatchObject({
      mrr: 247,
      paidCount: 3,
    });

    expect(query.where).toHaveBeenCalledOnce();
    expect(query.groupBy).toHaveBeenCalledWith(subscription.planTier);
  });
});
