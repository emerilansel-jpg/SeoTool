import { count, sql } from "drizzle-orm";
import { db } from "@/db";
import { subscription, usageQuota, organization } from "@/db/schema";
import { PLAN_TIERS } from "@/shared/plans";
import { getEffectivePricesUsd } from "@/server/billing/plan-config";

export interface PlanTierDistribution {
  planTier: string;
  orgCount: number;
}

export interface QuotaUsageSummaryRow {
  feature: string;
  period: string;
  totalUsed: number;
  orgCount: number;
}

export interface RecentOrg {
  id: string;
  name: string;
  planTier: string;
  status: string;
  createdAt: string | null;
}

export interface AnalyticsOverview {
  totalOrgs: number;
  mrrEstimate: number;
  paidOrgCount: number;
  planDistribution: PlanTierDistribution[];
  quotaSummary: QuotaUsageSummaryRow[];
  recentOrgs: RecentOrg[];
  /** Effective per-tier monthly prices (admin-editable), for client display. */
  prices: Record<string, number>;
}

export const AnalyticsRepository = {
  async getPlanTierDistribution(): Promise<PlanTierDistribution[]> {
    const rows = await db
      .select({
        planTier: subscription.planTier,
        orgCount: count(),
      })
      .from(subscription)
      .groupBy(subscription.planTier);

    // Ensure all tiers are represented (even with 0 count)
    const map = new Map(rows.map((r) => [r.planTier, r.orgCount]));
    return PLAN_TIERS.map((tier) => ({
      planTier: tier,
      orgCount: map.get(tier) ?? 0,
    }));
  },

  async getMrrEstimate(): Promise<{
    mrr: number;
    paidCount: number;
    prices: Record<string, number>;
  }> {
    const prices = await getEffectivePricesUsd();
    const rows = await db
      .select({
        planTier: subscription.planTier,
        orgCount: count(),
      })
      .from(subscription)
      .where(sql`${subscription.status} = 'active'`);

    let mrr = 0;
    let paidCount = 0;

    for (const row of rows) {
      const price = prices[row.planTier] ?? 0;
      mrr += price * row.orgCount;
      if (price > 0) paidCount += row.orgCount;
    }

    return { mrr, paidCount, prices: prices as Record<string, number> };
  },

  async getQuotaUsageSummary(): Promise<QuotaUsageSummaryRow[]> {
    const rows = await db
      .select({
        feature: usageQuota.feature,
        period: usageQuota.period,
        totalUsed: sql<number>`COALESCE(SUM(${usageQuota.used}), 0)`,
        orgCount: count(),
      })
      .from(usageQuota)
      .groupBy(usageQuota.feature, usageQuota.period);

    return rows.map((r) => ({
      feature: r.feature,
      period: r.period,
      totalUsed: Number(r.totalUsed),
      orgCount: r.orgCount,
    }));
  },

  async getOrgCount(): Promise<number> {
    const rows = await db.select({ count: count() }).from(organization);
    return rows[0]?.count ?? 0;
  },

  async getRecentOrgs(limit = 10): Promise<RecentOrg[]> {
    const rows = await db
      .select({
        id: organization.id,
        name: organization.name,
        planTier: subscription.planTier,
        status: subscription.status,
        createdAt: organization.createdAt,
      })
      .from(organization)
      .innerJoin(
        subscription,
        sql`${organization.id} = ${subscription.organizationId}`,
      )
      .orderBy(sql`${organization.createdAt} DESC`)
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      planTier: r.planTier,
      status: r.status,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : (r.createdAt ?? null),
    }));
  },

  async getOverview(): Promise<AnalyticsOverview> {
    const [planDistribution, mrrData, quotaSummary, totalOrgs, recentOrgs] =
      await Promise.all([
        AnalyticsRepository.getPlanTierDistribution(),
        AnalyticsRepository.getMrrEstimate(),
        AnalyticsRepository.getQuotaUsageSummary(),
        AnalyticsRepository.getOrgCount(),
        AnalyticsRepository.getRecentOrgs(10),
      ]);

    return {
      totalOrgs,
      mrrEstimate: mrrData.mrr,
      paidOrgCount: mrrData.paidCount,
      planDistribution,
      quotaSummary,
      recentOrgs,
      prices: mrrData.prices,
    };
  },
};
