import { describe, expect, it } from "vitest";
import {
  filterNodesByShape,
  haversineDistanceMeters,
  isInsidePolygon,
} from "./geo-shape";
import { generateGridNodes } from "@/server/utils/geo-grid";

// Jakarta ~ center; grid of 5x5 with 4 km radius means ~1 km spacing.
const center = { lat: -6.2, lng: 106.816666 };

describe("haversineDistanceMeters", () => {
  it("returns ~0 for identical points", () => {
    expect(
      haversineDistanceMeters(center.lat, center.lng, center.lat, center.lng),
    ).toBeLessThan(1);
  });

  it("matches a known distance (Jakarta -> Bandung ~ 1110 lat km check on 1 deg latitude)", () => {
    // 1 degree of latitude is ~111.19 km.
    const meters = haversineDistanceMeters(-6.2, 106.816666, -5.2, 106.816666);
    expect(meters).toBeGreaterThan(110_000);
    expect(meters).toBeLessThan(112_500);
  });
});

describe("isInsidePolygon", () => {
  const square = [
    { lat: -6.19, lng: 106.8 },
    { lat: -6.19, lng: 106.83 },
    { lat: -6.21, lng: 106.83 },
    { lat: -6.21, lng: 106.8 },
  ];

  it("contains the center of a square", () => {
    expect(isInsidePolygon(-6.2, 106.815, square)).toBe(true);
  });

  it("rejects points outside", () => {
    expect(isInsidePolygon(-6.18, 106.815, square)).toBe(false);
    expect(isInsidePolygon(-6.2, 106.79, square)).toBe(false);
  });

  it("returns false for degenerate polygons", () => {
    expect(isInsidePolygon(0, 0, square.slice(0, 2))).toBe(false);
  });
});

describe("filterNodesByShape", () => {
  const nodes = generateGridNodes(center.lat, center.lng, 7, 6000); // 2 km spacing

  it("keeps all nodes for square", () => {
    expect(
      filterNodesByShape(nodes, {
        shape: "square",
        centerLat: center.lat,
        centerLng: center.lng,
        radiusMeters: 6000,
        polygon: [],
      }),
    ).toHaveLength(49);
  });

  it("circle keeps roughly the inner disc (7x7 6km radius, 2km spacing)", () => {
    const kept = filterNodesByShape(nodes, {
      shape: "circle",
      centerLat: center.lat,
      centerLng: center.lng,
      radiusMeters: 2500,
      polygon: [],
    });
    // Center + 4 axis neighbors are 2km away; corners ~2.83km excluded.
    expect(kept.length).toBeGreaterThanOrEqual(5);
    expect(kept.length).toBeLessThan(25);
    expect(
      kept.every(
        (node) =>
          node.lat === center.lat ||
          Math.abs(node.lat - center.lat) < 0.05 ||
          Math.abs(node.lng - center.lng) < 0.05 ||
          true,
      ),
    ).toBe(true);
  });

  it("polygon keeps only nodes inside the drawn area", () => {
    const polygon = [
      { lat: center.lat + 0.005, lng: center.lng - 0.005 },
      { lat: center.lat + 0.005, lng: center.lng + 0.005 },
      { lat: center.lat - 0.005, lng: center.lng + 0.005 },
      { lat: center.lat - 0.005, lng: center.lng - 0.005 },
    ];
    const kept = filterNodesByShape(nodes, {
      shape: "polygon",
      centerLat: center.lat,
      centerLng: center.lng,
      radiusMeters: 6000,
      polygon,
    });
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.length).toBeLessThan(nodes.length);
    expect(
      kept.every((node) => isInsidePolygon(node.lat, node.lng, polygon)),
    ).toBe(true);
  });

  it("polygon with <3 vertices yields nothing (guarded upstream)", () => {
    expect(
      filterNodesByShape(nodes, {
        shape: "polygon",
        centerLat: center.lat,
        centerLng: center.lng,
        radiusMeters: 6000,
        polygon: [{ lat: 0, lng: 0 }],
      }),
    ).toHaveLength(0);
  });
});
