import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  CREDITS_PER_USD,
  MONTHLY_CREDIT_GRANTS,
  MONTHLY_CREDIT_PACKS,
} from "./billing";
import {
  APPSUMO_TIERS,
  LTD_COHORTS,
  MICRO_RETAINER,
} from "./pricing-definitions";

describe("Pricing and Credits Parity Guard", () => {
  it("enforces strict $1 = 1,000 credits conversion", () => {
    expect(CREDITS_PER_USD).toBe(1000);
    expect(MONTHLY_CREDIT_GRANTS.starter).toBe(1000);
    expect(MICRO_RETAINER.creditsPerMonth).toBe(1000);
    expect(MICRO_RETAINER.priceUsd).toBe(1);
  });

  it("ensures every monthly credit pack matches the 1,000 credits/dollar standard", () => {
    for (const pack of MONTHLY_CREDIT_PACKS) {
      expect(pack.credits).toBe(pack.priceUsd * 1000);
    }
  });

  it("validates LTD cohort ladder ($29, $39, $49, $59 one-time)", () => {
    const expected = [
      { key: "krp_founder_10", priceUsd: 29 },
      { key: "krp_early_20", priceUsd: 39 },
      { key: "krp_growth_50", priceUsd: 49 },
      { key: "krp_public", priceUsd: 59 },
    ];

    expect(LTD_COHORTS.map((c) => ({ key: c.key, priceUsd: c.priceUsd }))).toEqual(
      expected,
    );
  });

  it("validates AppSumo 5-tier pricing ($37, $79, $149, $249, $399)", () => {
    const prices = APPSUMO_TIERS.map((t) => t.priceUsd);
    expect(prices).toEqual([37, 79, 149, 249, 399]);
  });

  it("guarantees LandingPage does not advertise monthly BYOK or old $29/mo", () => {
    const landingFile = path.resolve(
      __dirname,
      "../client/features/marketing/LandingPage.tsx",
    );
    const content = fs.readFileSync(landingFile, "utf-8");

    // Must not advertise Founder cohort as monthly
    expect(content).not.toContain("$29/month");
    expect(content).not.toContain("$29/mo");

    // Must feature our primary USPs in copy
    expect(content).toContain("Model Context Protocol");
    expect(content).toContain("KGR");
    expect(content).toContain("Geogrid");
  });

  it("guarantees Pricing page does not advertise obsolete 3k credit numbers", () => {
    const pricingFile = path.resolve(__dirname, "../routes/pricing.tsx");
    const content = fs.readFileSync(pricingFile, "utf-8");

    expect(content).not.toContain("3k credits");
    expect(content).not.toContain("3,000 credits / mo");
  });
});
