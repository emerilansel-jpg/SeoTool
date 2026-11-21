// Grid shape geometry for the Local Map Rank (GMB grid) scanner. Pure and
// shared client/server so the map preview and the scan pipeline always agree
// on which points a scan covers.

export type GmbGridShape = "square" | "circle" | "polygon";

export type GeoPoint = { lat: number; lng: number };

export type GeoNode = {
  gridRow: number;
  gridCol: number;
  lat: number;
  lng: number;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in meters between two WGS84 points. */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6378137;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Even-odd ray casting; vertices in [lat, lng]. */
export function isInsidePolygon(
  lat: number,
  lng: number,
  polygon: GeoPoint[],
): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { lat: latA, lng: lngA } = polygon[i];
    const { lat: latB, lng: lngB } = polygon[j];
    const intersects =
      lngA > lng !== lngB > lng &&
      lat < ((latB - latA) * (lng - lngA)) / (lngB - lngA) + latA;
    if (intersects) inside = !inside;
  }
  return inside;
}

export type ShapeFilterOptions = {
  shape: GmbGridShape;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  polygon: GeoPoint[];
};

/** Keep only grid nodes inside the configured scan shape. `square` returns
 *  every node (current behavior); `circle` clips to the radius around the
 *  center; `polygon` clips to the drawn vertices. */
export function filterNodesByShape(
  nodes: GeoNode[],
  options: ShapeFilterOptions,
): GeoNode[] {
  if (options.shape === "circle") {
    return nodes.filter(
      (node) =>
        haversineDistanceMeters(
          options.centerLat,
          options.centerLng,
          node.lat,
          node.lng,
        ) <= options.radiusMeters,
    );
  }
  if (options.shape === "polygon") {
    if (options.polygon.length < 3) return [];
    return nodes.filter((node) =>
      isInsidePolygon(node.lat, node.lng, options.polygon),
    );
  }
  return nodes;
}
