export interface ParsedGoogleMapsInfo {
  businessName: string | null;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
  cid: string | null;
  address: string | null;
  rawUrl: string;
  isShortUrl: boolean;
}

/**
 * Normalizes a Google CID to its standard decimal representation.
 * Hex CIDs like 0xfb53b4d5a4379d52 are converted to 18110017356263038290.
 */
export function normalizeCid(cid?: string | null): string | null {
  if (!cid) return null;
  const trimmed = cid.trim();
  if (/^0x[0-9a-fA-F]+$/i.test(trimmed)) {
    try {
      return BigInt(trimmed).toString();
    } catch {
      return trimmed.toLowerCase();
    }
  }
  return trimmed;
}

/**
 * Extracts a decimal CID from a feature ID like 0x88569f7344c445e9:0xfb53b4d5a4379d52.
 */
export function extractCidFromFeatureId(featureId?: string | null): string | null {
  if (!featureId) return null;
  const match = featureId.match(/0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)/i);
  if (match) {
    return normalizeCid(match[1]);
  }
  return null;
}

/**
 * Checks if a string looks like a Google Maps URL.
 */
export function isGoogleMapsUrl(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const trimmed = input.trim();
  return (
    trimmed.includes("google.com/maps") ||
    trimmed.includes("maps.google.com") ||
    trimmed.includes("maps.app.goo.gl") ||
    trimmed.includes("goo.gl/maps")
  );
}

/**
 * Checks if a URL is a Google Maps shortened link.
 */
export function isShortGoogleMapsUrl(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const trimmed = input.trim();
  return (
    trimmed.includes("maps.app.goo.gl") ||
    trimmed.includes("goo.gl/maps")
  );
}

/**
 * Parses Google Maps place URLs and extracts business name, exact pin coordinates,
 * Place ID, CID, and address.
 */
export function parseGoogleMapsUrl(url: string): ParsedGoogleMapsInfo | null {
  if (!isGoogleMapsUrl(url)) return null;

  const rawUrl = url.trim();
  const isShort = isShortGoogleMapsUrl(rawUrl);

  let businessName: string | null = null;
  let lat: number | null = null;
  let lng: number | null = null;
  let placeId: string | null = null;
  let cid: string | null = null;
  let address: string | null = null;

  // 1. Exact pin coordinates inside protobuf: !3d<lat>!4d<lng>
  // e.g. !3d35.288245!4d-80.8702244
  const exactCoordMatch = rawUrl.match(/!3d(-?\d+(?:\.\d+)?)[!&]4d(-?\d+(?:\.\d+)?)/);
  if (exactCoordMatch) {
    lat = parseFloat(exactCoordMatch[1]);
    lng = parseFloat(exactCoordMatch[2]);
  }

  // 2. Viewport coordinates: @lat,lng,zoom
  // e.g. @35.2864557,-81.5296386,9z
  if (lat == null || lng == null) {
    const viewportMatch = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (viewportMatch) {
      lat = parseFloat(viewportMatch[1]);
      lng = parseFloat(viewportMatch[2]);
    }
  }

  // 3. Query string coordinates: ll=lat,lng or q=lat,lng
  if (lat == null || lng == null) {
    const queryCoordMatch = rawUrl.match(/[?&](?:ll|q)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (queryCoordMatch) {
      lat = parseFloat(queryCoordMatch[1]);
      lng = parseFloat(queryCoordMatch[2]);
    }
  }

  // 4. Hex feature ID: 1s0x...:0x... or ftid=0x...:0x...
  // e.g. 1s0x88569f7344c445e9:0xfb53b4d5a4379d52
  const hexMatch = rawUrl.match(/(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
  if (hexMatch) {
    placeId = `${hexMatch[1]}:${hexMatch[2]}`;
    try {
      cid = BigInt(hexMatch[2]).toString();
    } catch {
      cid = hexMatch[2];
    }
  }

  // 5. Standard Place ID: ChIJ...
  const chijMatch = rawUrl.match(/(ChIJ[a-zA-Z0-9_-]{23,})/);
  if (chijMatch) {
    placeId = chijMatch[1];
  }

  // 6. Explicit cid in query parameters: ?cid=18110017356263038290
  const cidParamMatch = rawUrl.match(/[?&]cid=(\d+)/);
  if (cidParamMatch) {
    cid = cidParamMatch[1];
  }

  // 7. Business name from /place/Name+Here/
  const placeMatch = rawUrl.match(/\/place\/([^/@?#]+)/);
  if (placeMatch) {
    const raw = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    // Sometimes place includes address: "Business Name, 123 Main St, City"
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      businessName = parts[0];
      address = parts.slice(1).join(", ");
    } else {
      businessName = raw;
    }
  } else {
    // Check q= query parameter if not raw coordinates
    const qMatch = rawUrl.match(/[?&]q=([^&]+)/);
    if (qMatch && !/^-?\d+\.\d+,-?\d+\.\d+$/.test(qMatch[1])) {
      businessName = decodeURIComponent(qMatch[1].replace(/\+/g, " "));
    }
  }

  return {
    businessName,
    lat,
    lng,
    placeId,
    cid,
    address,
    rawUrl,
    isShortUrl: isShort,
  };
}
