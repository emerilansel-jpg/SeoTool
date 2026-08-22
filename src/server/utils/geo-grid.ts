/**
 * Haversine formula based grid generation
 */
export function generateGridNodes(
  centerLat: number,
  centerLng: number,
  gridSize: number, // Must be odd (3, 5, 7, 9)
  radiusMeters: number
) {
  const nodes = [];
  
  // Radius of Earth in meters
  const R = 6378137;
  
  // Calculate distance between adjacent nodes
  // If radiusMeters is distance from center to edge, then:
  // step size = radiusMeters / ((gridSize - 1) / 2)
  const stepsFromCenter = Math.floor(gridSize / 2);
  const stepMeters = stepsFromCenter > 0 ? radiusMeters / stepsFromCenter : 0;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Offset from center (-stepsFromCenter to +stepsFromCenter)
      const dRow = stepsFromCenter - row; // + is North, - is South
      const dCol = col - stepsFromCenter; // + is East, - is West
      
      const dy = dRow * stepMeters; // delta latitude (meters)
      const dx = dCol * stepMeters; // delta longitude (meters)
      
      // Coordinate offsets in radians
      const dLat = dy / R;
      const dLng = dx / (R * Math.cos((Math.PI * centerLat) / 180));
      
      const lat = centerLat + (dLat * 180) / Math.PI;
      const lng = centerLng + (dLng * 180) / Math.PI;
      
      nodes.push({
        gridRow: row,
        gridCol: col,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6))
      });
    }
  }
  
  return nodes;
}
