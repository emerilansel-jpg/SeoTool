import { describe, expect, it } from "vitest";
import {
  calculateGmbMetrics,
  estimateGmbGridCost,
  findGmbRank,
  formatMapsCoordinate,
} from "./gmb-grid";

describe("GMB grid helpers", () => {
  it("formats DataForSEO Maps coordinates with zoom, not radius", () => {
    expect(formatMapsCoordinate(-6.2, 106.816666, 15)).toBe(
      "-6.2,106.816666,15z",
    );
  });

  it("matches the stable place id even when another listing has the same name", () => {
    expect(
      findGmbRank(
        [
          {
            type: "maps_search",
            title: "Acme",
            place_id: "wrong",
            rank_group: 1,
          },
          {
            type: "maps_search",
            title: "Acme",
            place_id: "target",
            rank_group: 4,
          },
        ],
        { placeId: "target", businessName: "Acme" },
      ),
    ).toBe(4);
  });

  it("does not fall back to a fuzzy title when a place id is available", () => {
    expect(
      findGmbRank(
        [
          {
            type: "maps_search",
            title: "Acme",
            place_id: "wrong",
            rank_group: 1,
          },
        ],
        { placeId: "target", businessName: "Acme" },
      ),
    ).toBeNull();
  });

  it("calculates SoLV over every grid point and average rank over found points", () => {
    expect(
      calculateGmbMetrics([
        { status: "completed", rank: 1 },
        { status: "completed", rank: 4 },
        { status: "completed", rank: null },
        { status: "failed", rank: null },
      ]),
    ).toEqual({
      totalPoints: 4,
      completedPoints: 3,
      failedPoints: 1,
      foundPoints: 2,
      solv: 25,
      averageRank: 2.5,
    });
  });

  it("estimates the standard queue cost before confirmation", () => {
    expect(estimateGmbGridCost(7)).toEqual({
      points: 49,
      estimatedCostUsd: 0.0294,
    });
  });
});
