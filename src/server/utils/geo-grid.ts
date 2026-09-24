/**
 * Haversine formula based grid generation with boundary clamping
 */
export function generateGridNodes(
  centerLat: number,
  centerLng: number,
  gridSize: number, // Must be odd (3, 5, 7, 9, 11, 13, 15)
  radiusMeters: number,
) {
  const nodes = [];

  // Radius of Earth in meters
  const R = 6378137;

  // Calculate distance between adjacent nodes
  // If radiusMeters is distance from center to edge, then:
  // step size = radiusMeters / ((gridSize - 1) / 2)
  const stepsFromCenter = Math.floor(gridSize / 2);
  const stepMeters = stepsFromCenter > 0 ? radiusMeters / stepsFromCenter : 0;

  // Protect against division by zero near poles
  const safeCosLat = Math.max(
    0.0001,
    Math.cos((Math.PI * Math.min(89.9999, Math.max(-89.9999, centerLat))) / 180),
  );

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Offset from center (-stepsFromCenter to +stepsFromCenter)
      const dRow = stepsFromCenter - row; // + is North, - is South
      const dCol = col - stepsFromCenter; // + is East, - is West

      const dy = dRow * stepMeters; // delta latitude (meters)
      const dx = dCol * stepMeters; // delta longitude (meters)

      // Coordinate offsets in radians
      const dLat = dy / R;
      const dLng = dx / (R * safeCosLat);

      const lat = centerLat + (dLat * 180) / Math.PI;
      const lng = centerLng + (dLng * 180) / Math.PI;

      // Clamp latitude to [-89.999999, 89.999999]
      const clampedLat = Math.min(89.999999, Math.max(-89.999999, lat));

      // Wrap longitude to [-180, 180]
      let normalizedLng = (lng + 180) % 360;
      if (normalizedLng < 0) normalizedLng += 360;
      normalizedLng -= 180;

      nodes.push({
        gridRow: row,
        gridCol: col,
        lat: Number(clampedLat.toFixed(6)),
        lng: Number(normalizedLng.toFixed(6)),
      });
    }
  }

  return nodes;
}
