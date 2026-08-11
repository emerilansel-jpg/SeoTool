// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- Object.keys narrowed to known feature union
import { describe, expect, it } from "vitest";
import {
  PLAN_TIERS,
  PLAN_LIMITS,
  PLAN_PRICES_USD,
  PLAN_FEATURE_ACCESS,
  QUOTA_FEATURE_PERIODS,
  ORDERED_PLAN_TIERS,
  DEFAULT_PLAN_TIER,
  isPaidTier,
  getPlanLimit,
  planTierFromAutumnPlanId,
  AUTUMN_PLAN_IDS,
  type PlanTier,
  type QuotaFeature,
} from "@/shared/plans";

describe("plans: tier definitions", () => {
  it("defines exactly four tiers", () => {
    expect(PLAN_TIERS).toEqual(["free", "lite", "pro", "agency"]);
  });

  it("orders tiers from lowest to highest", () => {
    expect(ORDERED_PLAN_TIERS).toEqual(["free", "lite", "pro", "agency"]);
  });

  it("prices tiers in ascending order", () => {
    const prices = ORDERED_PLAN_TIERS.map((t) => PLAN_PRICES_USD[t]);
    expect(prices).toEqual([0, 49, 149, 499]);
  });

  it("defaults new orgs to the free tier", () => {
    expect(DEFAULT_PLAN_TIER).toBe("free");
  });

  it("marks only the free tier as non-paid", () => {
    expect(isPaidTier("free")).toBe(false);
    expect(isPaidTier("lite")).toBe(true);
    expect(isPaidTier("pro")).toBe(true);
    expect(isPaidTier("agency")).toBe(true);
  });
});

describe("plans: per-feature limits", () => {
  it("defines a limit for every quota feature on every tier", () => {
    const features = Object.keys(QUOTA_FEATURE_PERIODS) as QuotaFeature[];
    for (const tier of PLAN_TIERS) {
      for (const feature of features) {
        expect(
          PLAN_LIMITS[tier],
          `tier ${tier} should define limit for ${feature}`,
        ).toHaveProperty(feature);
      }
    }
  });

  it("gives the free tier 0 for paid-only features", () => {
    expect(PLAN_LIMITS.free.rank_tracking).toBe(0);
    expect(PLAN_LIMITS.free.backlink_check).toBe(0);
    expect(PLAN_LIMITS.free.ai_brand_lookup).toBe(0);
    expect(PLAN_LIMITS.free.ai_prompt).toBe(0);
    expect(PLAN_LIMITS.free.content_intelligence).toBe(0);
    expect(PLAN_LIMITS.free.reports).toBe(0);
  });

  it("gives the agency tier Infinity for unlimited features", () => {
    expect(PLAN_LIMITS.agency.projects).toBe(Infinity);
    expect(PLAN_LIMITS.agency.keyword_search).toBe(Infinity);
    expect(PLAN_LIMITS.agency.saved_keywords).toBe(Infinity);
    expect(PLAN_LIMITS.agency.reports).toBe(Infinity);
  });

  it("increases limits monotonically with tier", () => {
    const features = Object.keys(QUOTA_FEATURE_PERIODS) as QuotaFeature[];
    for (const feature of features) {
      const values = ORDERED_PLAN_TIERS.map((t) => PLAN_LIMITS[t][feature]);
      // Allow Infinity in the comparison; normalize Infinity to Number.MAX_SAFE_INTEGER.
      const normalized = values.map((v) =>
        v === Infinity ? Number.MAX_SAFE_INTEGER : v,
      );
      for (let i = 1; i < normalized.length; i++) {
        expect(
          normalized[i],
          `${feature} should not decrease from ${ORDERED_PLAN_TIERS[i - 1]} to ${ORDERED_PLAN_TIERS[i]}`,
        ).toBeGreaterThanOrEqual(normalized[i - 1]);
      }
    }
  });

  it("getPlanLimit returns the configured value", () => {
    expect(getPlanLimit("free", "projects")).toBe(1);
    expect(getPlanLimit("pro", "keyword_search")).toBe(500);
    expect(getPlanLimit("agency", "projects")).toBe(Infinity);
  });
});

describe("plans: feature access gates", () => {
  it("blocks SAM agent and MCP tools on the free tier", () => {
    expect(PLAN_FEATURE_ACCESS.free.samAgent).toBe(false);
    expect(PLAN_FEATURE_ACCESS.free.mcpTools).toBe(false);
  });

  it("enables SAM agent and MCP tools on all paid tiers", () => {
    for (const tier of ["lite", "pro", "agency"] as PlanTier[]) {
      expect(PLAN_FEATURE_ACCESS[tier].samAgent).toBe(true);
      expect(PLAN_FEATURE_ACCESS[tier].mcpTools).toBe(true);
    }
  });

  it("enables GA4 and GSC on all tiers", () => {
    for (const tier of PLAN_TIERS) {
      expect(PLAN_FEATURE_ACCESS[tier].ga4).toBe(true);
      expect(PLAN_FEATURE_ACCESS[tier].gsc).toBe(true);
    }
  });
});

describe("plans: quota periods", () => {
  it("assigns gauge period to standing-count features", () => {
    expect(QUOTA_FEATURE_PERIODS.projects).toBe("gauge");
    expect(QUOTA_FEATURE_PERIODS.saved_keywords).toBe("gauge");
    expect(QUOTA_FEATURE_PERIODS.rank_tracking).toBe("gauge");
    expect(QUOTA_FEATURE_PERIODS.reports).toBe("gauge");
    expect(QUOTA_FEATURE_PERIODS.audit_pages).toBe("gauge");
  });

  it("assigns daily period to high-frequency features", () => {
    expect(QUOTA_FEATURE_PERIODS.keyword_search).toBe("daily");
    expect(QUOTA_FEATURE_PERIODS.backlink_check).toBe("daily");
  });

  it("assigns monthly period to expensive features", () => {
    expect(QUOTA_FEATURE_PERIODS.site_audit).toBe("monthly");
    expect(QUOTA_FEATURE_PERIODS.ai_brand_lookup).toBe("monthly");
    expect(QUOTA_FEATURE_PERIODS.ai_prompt).toBe("monthly");
    expect(QUOTA_FEATURE_PERIODS.content_intelligence).toBe("monthly");
  });
});

describe("plans: Autumn plan id mapping", () => {
  it("maps free tier to null (Autumn Default)", () => {
    expect(AUTUMN_PLAN_IDS.free).toBeNull();
  });

  it("maps paid tiers to Autumn plan ids", () => {
    expect(AUTUMN_PLAN_IDS.lite).toBe("lite-plan");
    expect(AUTUMN_PLAN_IDS.pro).toBe("pro-plan");
    expect(AUTUMN_PLAN_IDS.agency).toBe("agency-plan");
  });

  it("resolves Autumn plan ids back to tiers", () => {
    expect(planTierFromAutumnPlanId("lite-plan")).toBe("lite");
    expect(planTierFromAutumnPlanId("pro-plan")).toBe("pro");
    expect(planTierFromAutumnPlanId("agency-plan")).toBe("agency");
  });

  it("returns null for unknown Autumn plan ids", () => {
    expect(planTierFromAutumnPlanId("unknown")).toBeNull();
    expect(planTierFromAutumnPlanId(null)).toBeNull();
    expect(planTierFromAutumnPlanId(undefined)).toBeNull();
  });
});
