import { describe, expect, it } from "vitest";
import {
  estimateDataforseoRawCostCeilingUsd,
  estimateDataforseoReservationCredits,
} from "@/server/lib/dataforseo/cost-ceiling";

describe("DataForSEO cost ceilings", () => {
  it("sizes backlink list and bulk holds from requested rows", () => {
    expect(
      estimateDataforseoRawCostCeilingUsd("backlinks-list", { limit: 1_000 }),
    ).toBeCloseTo(0.06, 10);
    expect(
      estimateDataforseoRawCostCeilingUsd("backlinks-bulk", {
        targets: Array.from({ length: 1_000 }, (_, index) => `d${index}.com`),
      }),
    ).toBeCloseTo(0.06, 10);
  });

  it("accounts for Labs rows and optional clickstream cost", () => {
    const regular = estimateDataforseoRawCostCeilingUsd("labs-list", {
      limit: 100,
    });
    const clickstream = estimateDataforseoRawCostCeilingUsd("labs-list", {
      limit: 100,
      includeClickstreamData: true,
    });

    expect(regular).toBeCloseTo(0.024, 10);
    expect(clickstream).toBeCloseTo(regular * 2, 10);
  });

  it("scales queued SERP reservations with submitted tasks", () => {
    const single = estimateDataforseoRawCostCeilingUsd("serp-task-batch", {
      tasks: [{}],
      depth: 20,
    });
    const grid = estimateDataforseoRawCostCeilingUsd("serp-task-batch", {
      tasks: Array.from({ length: 49 }, () => ({})),
      depth: 20,
    });

    expect(grid).toBeCloseTo(single * 49, 10);
  });

  it("holds a conservative live SERP ceiling before provider dispatch", () => {
    expect(
      estimateDataforseoReservationCredits({
        profile: "serp-live",
        request: { depth: 100 },
        billingMode: "standard",
      }),
    ).toBe(26);
  });

  it("reserves the 30% Standard charge and 10% BYOK fee", () => {
    const standard = estimateDataforseoReservationCredits({
      profile: "backlinks-summary",
      request: {},
      billingMode: "standard",
    });
    const byok = estimateDataforseoReservationCredits({
      profile: "backlinks-summary",
      request: {},
      billingMode: "byok",
    });

    expect(standard).toBe(32);
    expect(byok).toBe(3);
  });

  it("raises the LLM hold with the maximum requested output", () => {
    const small = estimateDataforseoRawCostCeilingUsd("ai-llm-response", {
      userPrompt: "hello",
      maxOutputTokens: 256,
    });
    const large = estimateDataforseoRawCostCeilingUsd("ai-llm-response", {
      userPrompt: "hello",
      maxOutputTokens: 4_096,
    });

    expect(large).toBeGreaterThan(small);
  });
});
