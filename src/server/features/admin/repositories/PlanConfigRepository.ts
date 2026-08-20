import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { planConfig } from "@/db/schema";
import type { PlanTier } from "@/shared/plans";

export interface PlanConfigRow {
  tier: string;
  priceUsdCents: number;
  monthlyCredits: number;
  paypalPlanId: string | null;
  syncStatus: string;
  active: boolean;
  updatedByUserId: string | null;
  updatedAt: string;
}

export const PlanConfigRepository = {
  async listAll(): Promise<PlanConfigRow[]> {
    return db.select().from(planConfig);
  },

  async upsert(entry: {
    tier: PlanTier;
    priceUsdCents: number;
    monthlyCredits: number;
    paypalPlanId: string | null;
    syncStatus: string;
    active: boolean;
    updatedByUserId: string;
  }): Promise<void> {
    await db
      .insert(planConfig)
      .values(entry)
      .onConflictDoUpdate({
        target: planConfig.tier,
        set: {
          priceUsdCents: entry.priceUsdCents,
          monthlyCredits: entry.monthlyCredits,
          paypalPlanId: entry.paypalPlanId,
          syncStatus: entry.syncStatus,
          active: entry.active,
          updatedByUserId: entry.updatedByUserId,
          updatedAt: sql`(current_timestamp)`,
        },
      });
  },

  async setSyncStatus(tier: PlanTier, syncStatus: string): Promise<void> {
    await db
      .update(planConfig)
      .set({ syncStatus, updatedAt: sql`(current_timestamp)` })
      .where(eq(planConfig.tier, tier));
  },
};
