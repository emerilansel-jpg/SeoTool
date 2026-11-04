import { describe, expect, it } from "vitest";
import { calculateDistanceAndDirection } from "./components/GmbPinInspector";
import { aggregateGridCompetitors } from "./components/GmbCompetitorLeaderboard";
import { generateSampleDemoSnapshots } from "./gmbDemoData";
import type { GmbSnapshotMarker } from "./components/GmbMap";

describe("Local Map Rank - Grid Tracker Features", () => {
  it("calculates cardinal direction and distance from center correctly", () => {
    const centerLat = 40.7128;
    const centerLng = -74.006;

    // Same point -> At center
    expect(
      calculateDistanceAndDirection(centerLat, centerLng, centerLat, centerLng, "mi"),
    ).toBe("At business center");

    // Point North
    const northLat = centerLat + 0.05;
    const distNorth = calculateDistanceAndDirection(
      centerLat,
      centerLng,
      northLat,
      centerLng,
      "mi",
    );
    expect(distNorth).toContain("N");
    expect(distNorth).toContain("mi");

    // Point in km
    const distKm = calculateDistanceAndDirection(
      centerLat,
      centerLng,
      northLat,
      centerLng,
      "km",
    );
    expect(distKm).toContain("km");
  });

  it("generates realistic demo snapshots with competitor data and ratings", () => {
    const snapshots = generateSampleDemoSnapshots(40.7128, -74.006, 5, 3000);
    expect(snapshots.length).toBe(25);

    // Center pin should be rank 1-3
    const centerPin = snapshots.find((s) => s.gridRow === 2 && s.gridCol === 2);
    expect(centerPin).toBeDefined();
    expect(centerPin?.rank).toBeLessThanOrEqual(3);

    // Each completed pin must have itemsJson containing competitors with rating
    expect(centerPin?.itemsJson).toBeDefined();
    const competitors = JSON.parse(centerPin!.itemsJson!);
    expect(competitors.length).toBeGreaterThan(0);
    expect(competitors[0].title).toBeDefined();
    expect(competitors[0].rating).toBeDefined();
    expect(competitors[0].rating.value).toBeGreaterThan(0);
  });

  it("aggregates grid competitors across all pins into leaderboard", () => {
    const mockSnapshots: GmbSnapshotMarker[] = [
      {
        id: "pin-1",
        lat: 40.71,
        lng: -74.0,
        gridRow: 0,
        gridCol: 0,
        rank: 2,
        status: "completed",
        itemsJson: JSON.stringify([
          {
            rank: 1,
            title: "Apex Dental",
            placeId: "p1",
            rating: { value: 4.8, votes_count: 100 },
          },
          {
            rank: 2,
            title: "Smile Bright Care",
            placeId: "target",
            rating: { value: 4.9, votes_count: 200 },
          },
        ]),
      },
      {
        id: "pin-2",
        lat: 40.72,
        lng: -74.01,
        gridRow: 0,
        gridCol: 1,
        rank: 1,
        status: "completed",
        itemsJson: JSON.stringify([
          {
            rank: 1,
            title: "Smile Bright Care",
            placeId: "target",
            rating: { value: 4.9, votes_count: 200 },
          },
          {
            rank: 2,
            title: "Apex Dental",
            placeId: "p1",
            rating: { value: 4.8, votes_count: 100 },
          },
        ]),
      },
    ];

    const leaderboard = aggregateGridCompetitors(
      mockSnapshots,
      "Smile Bright Care",
      "target",
    );

    expect(leaderboard.length).toBe(2);

    const target = leaderboard.find((c) => c.isTarget);
    expect(target).toBeDefined();
    expect(target?.title).toBe("Smile Bright Care");
    expect(target?.averageRank).toBe(1.5);
    expect(target?.top3Count).toBe(2);
    expect(target?.solvPercentage).toBe(100);

    const comp = leaderboard.find((c) => c.placeId === "p1");
    expect(comp?.title).toBe("Apex Dental");
    expect(comp?.averageRank).toBe(1.5);
    expect(comp?.ratingValue).toBe(4.8);
  });
});
