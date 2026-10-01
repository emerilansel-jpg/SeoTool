import { describe, expect, it } from "vitest";
import {
  calculateVolatilityScore,
  categorizeVolatility,
  getPositionChange,
  identifyTopMovers,
  type KeywordPositionChange,
} from "./volatilityCalculation";

describe("volatilityCalculation", () => {
  it("returns zero score for empty input", () => {
    expect(calculateVolatilityScore([])).toBe(0);
  });

  it("returns zero score when all positions remain completely unchanged", () => {
    const changes: KeywordPositionChange[] = [
      {
        keyword: "seo",
        currentPosition: 3,
        previousPosition: 3,
        unrankedPosition: 21,
      },
      {
        keyword: "rank tracker",
        currentPosition: 8,
        previousPosition: 8,
        unrankedPosition: 21,
      },
      {
        keyword: "audit",
        currentPosition: 12,
        previousPosition: 12,
        unrankedPosition: 21,
      },
    ];
    expect(calculateVolatilityScore(changes)).toBe(0);
  });

  it("scores uniform 5-position shift without returning zero", () => {
    const changes: KeywordPositionChange[] = [
      {
        keyword: "alpha",
        currentPosition: 6,
        previousPosition: 1,
        unrankedPosition: 21,
      },
      {
        keyword: "beta",
        currentPosition: 7,
        previousPosition: 2,
        unrankedPosition: 21,
      },
      {
        keyword: "gamma",
        currentPosition: 8,
        previousPosition: 3,
        unrankedPosition: 21,
      },
      {
        keyword: "delta",
        currentPosition: 9,
        previousPosition: 4,
        unrankedPosition: 21,
      },
    ];
    const score = calculateVolatilityScore(changes);
    expect(score).toBeGreaterThan(0);
    expect(score).toBe(55);
  });

  it("yields higher volatility for major and newly entered/dropped keywords than minor movement", () => {
    const minorChanges: KeywordPositionChange[] = [
      {
        keyword: "a",
        currentPosition: 2,
        previousPosition: 1,
        unrankedPosition: 21,
      },
      {
        keyword: "b",
        currentPosition: 5,
        previousPosition: 5,
        unrankedPosition: 21,
      },
      {
        keyword: "c",
        currentPosition: 9,
        previousPosition: 8,
        unrankedPosition: 21,
      },
    ];
    const majorChanges: KeywordPositionChange[] = [
      {
        keyword: "a",
        currentPosition: 1,
        previousPosition: null,
        unrankedPosition: 21,
      },
      {
        keyword: "b",
        currentPosition: null,
        previousPosition: 2,
        unrankedPosition: 21,
      },
      {
        keyword: "c",
        currentPosition: 19,
        previousPosition: 3,
        unrankedPosition: 21,
      },
    ];

    const minorScore = calculateVolatilityScore(minorChanges);
    const majorScore = calculateVolatilityScore(majorChanges);

    expect(minorScore).toBeLessThan(30);
    expect(majorScore).toBeGreaterThan(80);
  });

  it("marks newly ranked keywords as positive and dropped keywords as negative movers", () => {
    const changes: KeywordPositionChange[] = [
      {
        keyword: "new keyword",
        currentPosition: 4,
        previousPosition: null,
        unrankedPosition: 21,
      },
      {
        keyword: "dropped keyword",
        currentPosition: null,
        previousPosition: 5,
        unrankedPosition: 21,
      },
      {
        keyword: "steady keyword",
        currentPosition: 10,
        previousPosition: 10,
        unrankedPosition: 21,
      },
      {
        keyword: "climber",
        currentPosition: 2,
        previousPosition: 8,
        unrankedPosition: 21,
      },
    ];

    const movers = identifyTopMovers(changes);
    const newMover = movers.find((m) => m.keyword === "new keyword");
    const droppedMover = movers.find((m) => m.keyword === "dropped keyword");
    const climber = movers.find((m) => m.keyword === "climber");

    expect(newMover?.status).toBe("new");
    expect(newMover?.change).toBe(17);

    expect(droppedMover?.status).toBe("dropped");
    expect(droppedMover?.change).toBe(-16);

    expect(climber?.status).toBe("improved");
    expect(climber?.change).toBe(6);
  });

  it("calculates exact delta through getPositionChange", () => {
    expect(
      getPositionChange({
        currentPosition: 5,
        previousPosition: 15,
        unrankedPosition: 21,
      }),
    ).toBe(10);
    expect(
      getPositionChange({
        currentPosition: 15,
        previousPosition: 5,
        unrankedPosition: 21,
      }),
    ).toBe(-10);
  });

  it("categorizes standard score buckets correctly", () => {
    expect(categorizeVolatility(0)).toBe("low");
    expect(categorizeVolatility(19.99)).toBe("low");
    expect(categorizeVolatility(20)).toBe("moderate");
    expect(categorizeVolatility(49.99)).toBe("moderate");
    expect(categorizeVolatility(50)).toBe("high");
    expect(categorizeVolatility(79.99)).toBe("high");
    expect(categorizeVolatility(80)).toBe("extreme");
    expect(categorizeVolatility(100)).toBe("extreme");
  });
});
