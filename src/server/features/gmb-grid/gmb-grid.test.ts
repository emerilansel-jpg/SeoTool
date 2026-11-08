import { describe, expect, it } from "vitest";
import {
  calculateGmbMetrics,
  computeGridMapZoom,
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

  it("widens the search viewport as the grid expands", () => {
    // A fixed 15z viewport is ~1 km wide: pins spaced further apart than that
    // return an empty DataForSEO result set, so expanded grids found nothing.
    expect(computeGridMapZoom(7, 4828)).toBe(12);
    expect(computeGridMapZoom(7, 16093)).toBe(11);
    expect(computeGridMapZoom(7, 48280)).toBe(9);
  });

  it("keeps tight grids scanning at street-level zooms", () => {
    expect(computeGridMapZoom(7, 805)).toBe(15);
    expect(computeGridMapZoom(15, 4828)).toBe(14);
  });

  it("clamps the zoom to the provider's supported range", () => {
    expect(computeGridMapZoom(3, 100)).toBe(16);
    expect(computeGridMapZoom(7, 100000)).toBe(8);
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

  it("matches by CID when place id differs or is absent", () => {
    expect(
      findGmbRank(
        [
          {
            type: "maps_search",
            title: "Acme Dental",
            place_id: "other_place_id",
            cid: "1234567890",
            rank_group: 2,
          },
        ],
        {
          placeId: "target_place_id",
          businessName: "Acme Dental",
          cid: "1234567890",
        },
      ),
    ).toBe(2);
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

  it("falls back to normalized business name when neither placeId nor cid are present", () => {
    expect(
      findGmbRank(
        [
          {
            type: "maps_search",
            title: "The Grove Los Angeles!",
            place_id: "random_place_id",
            rank_group: 3,
          },
        ],
        { placeId: "", businessName: "the grove los angeles" },
      ),
    ).toBe(3);
  });

  it("handles empty snapshots safely in calculateGmbMetrics", () => {
    expect(calculateGmbMetrics([])).toEqual({
      totalPoints: 0,
      completedPoints: 0,
      failedPoints: 0,
      foundPoints: 0,
      solv: null,
      averageRank: null,
    });
  });

  it("estimates the standard queue cost before confirmation", () => {
    expect(estimateGmbGridCost(7)).toEqual({
      points: 49,
      estimatedCostUsd: 0.0294,
    });
  });
});
