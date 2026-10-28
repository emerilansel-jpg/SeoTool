import { describe, expect, it } from "vitest";
import { positionToVisibility } from "@/shared/rank-tracking";

describe("KeywordIntelligenceService", () => {
  it("calculates CTR visibility correctly across position brackets", () => {
    expect(positionToVisibility(null)).toBe(0);
    expect(positionToVisibility(0)).toBe(0);
    expect(positionToVisibility(1)).toBe(100);
    expect(positionToVisibility(2)).toBe(70);
    expect(positionToVisibility(3)).toBe(50);
    expect(positionToVisibility(4)).toBe(35);
    expect(positionToVisibility(10)).toBe(14);
    expect(positionToVisibility(15)).toBe(5);
    expect(positionToVisibility(20)).toBe(5);
    expect(positionToVisibility(21)).toBe(0);
    expect(positionToVisibility(100)).toBe(0);
  });
});
