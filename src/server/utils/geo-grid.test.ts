import { describe, expect, it } from "vitest";
import { generateGridNodes } from "./geo-grid";

describe("generateGridNodes", () => {
  it("generates NxN nodes with center coordinate matching the middle node", () => {
    const nodes = generateGridNodes(35.2271, -80.8431, 3, 5000);
    expect(nodes).toHaveLength(9);

    // Center node is at row 1, col 1
    const centerNode = nodes.find((n) => n.gridRow === 1 && n.gridCol === 1);
    expect(centerNode).toBeDefined();
    expect(centerNode?.lat).toBeCloseTo(35.2271, 4);
    expect(centerNode?.lng).toBeCloseTo(-80.8431, 4);
  });

  it("supports larger grid sizes such as 7x7 (49 nodes)", () => {
    const nodes = generateGridNodes(-6.2088, 106.8456, 7, 10000);
    expect(nodes).toHaveLength(49);
    const center = nodes.find((n) => n.gridRow === 3 && n.gridCol === 3);
    expect(center?.lat).toBeCloseTo(-6.2088, 4);
    expect(center?.lng).toBeCloseTo(106.8456, 4);
  });

  it("safely clamps latitude near poles without throwing or NaN", () => {
    const nodes = generateGridNodes(89.99, 0, 3, 50000);
    expect(nodes).toHaveLength(9);
    for (const node of nodes) {
      expect(Number.isFinite(node.lat)).toBe(true);
      expect(Number.isFinite(node.lng)).toBe(true);
      expect(node.lat).toBeLessThanOrEqual(90);
      expect(node.lat).toBeGreaterThanOrEqual(-90);
    }
  });

  it("safely wraps longitude around antimeridian [-180, 180]", () => {
    const nodes = generateGridNodes(0, 179.99, 3, 50000);
    expect(nodes).toHaveLength(9);
    for (const node of nodes) {
      expect(node.lng).toBeGreaterThanOrEqual(-180);
      expect(node.lng).toBeLessThanOrEqual(180);
    }
  });
});
