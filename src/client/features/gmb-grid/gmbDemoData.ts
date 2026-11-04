// oxlint-disable
import type { GmbSnapshotMarker, GmbPinCompetitor } from "./components/GmbMap";

const SAMPLE_COMPETITORS_POOL: Array<Omit<GmbPinCompetitor, "rank">> = [
  {
    title: "Smile Bright Dental Care",
    category: "Dentist · Dental Clinic",
    address: "124 Central Ave, Suite 200",
    rating: { value: 4.9, votes_count: 248 },
    phone: "+1 (555) 234-5678",
    url: "https://maps.google.com",
    placeId: "demo-target-place-id",
  },
  {
    title: "Downtown Family Dentistry",
    category: "Dentist · Cosmetic Dentist",
    address: "88 Main Street",
    rating: { value: 4.8, votes_count: 312 },
    phone: "+1 (555) 345-6789",
    url: "https://maps.google.com",
    placeId: "demo-comp-1",
  },
  {
    title: "Apex Dental Spa & Orthodontics",
    category: "Orthodontist · Dental Clinic",
    address: "412 Oakwood Blvd",
    rating: { value: 4.7, votes_count: 189 },
    phone: "+1 (555) 456-7890",
    url: "https://maps.google.com",
    placeId: "demo-comp-2",
  },
  {
    title: "City Center Emergency Dental",
    category: "Emergency Dental Service",
    address: "19 West End Plaza",
    rating: { value: 4.6, votes_count: 94 },
    phone: "+1 (555) 567-8901",
    url: "https://maps.google.com",
    placeId: "demo-comp-3",
  },
  {
    title: "Metro Health Dental Practice",
    category: "Dental Clinic",
    address: "500 Grand Ave",
    rating: { value: 4.5, votes_count: 142 },
    phone: "+1 (555) 678-9012",
    url: "https://maps.google.com",
    placeId: "demo-comp-4",
  },
  {
    title: "Radiant Smiles Pediatric Dental",
    category: "Pediatric Dentist",
    address: "77 Elm Street",
    rating: { value: 4.9, votes_count: 420 },
    phone: "+1 (555) 789-0123",
    url: "https://maps.google.com",
    placeId: "demo-comp-5",
  },
  {
    title: "Pinnacle Oral Surgery & Dental",
    category: "Oral Surgeon",
    address: "310 Riverside Dr",
    rating: { value: 4.6, votes_count: 78 },
    phone: "+1 (555) 890-1234",
    url: "https://maps.google.com",
    placeId: "demo-comp-6",
  },
];

export function generateSampleDemoSnapshots(
  centerLat: number,
  centerLng: number,
  gridSize = 7,
  radiusMeters = 4828,
): GmbSnapshotMarker[] {
  const snapshots: GmbSnapshotMarker[] = [];
  const half = Math.floor(gridSize / 2);

  // Approximate lat/lng delta
  const latDelta = (radiusMeters / 111320) / Math.max(1, half);
  const lngDelta =
    (radiusMeters /
      ((40075000 * Math.cos((centerLat * Math.PI) / 180)) / 360)) /
    Math.max(1, half);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const rowOffset = r - half;
      const colOffset = c - half;
      const lat = centerLat + rowOffset * latDelta;
      const lng = centerLng + colOffset * lngDelta;
      const distFromCenter = Math.sqrt(rowOffset * rowOffset + colOffset * colOffset);

      // Natural distance decay for local ranking
      let rank: number | null = null;
      if (distFromCenter <= 1) {
        rank = Math.min(3, Math.max(1, Math.round(distFromCenter * 1.5 + 1)));
      } else if (distFromCenter <= 2.2) {
        rank = Math.round(2 + (distFromCenter - 1) * 3);
      } else if (distFromCenter <= 3.2) {
        rank = Math.round(5 + (distFromCenter - 2) * 5);
      } else {
        // Outer pins: 11-20 or unranked
        const seed = (r * 7 + c * 13) % 10;
        rank = seed < 4 ? Math.round(11 + seed * 2) : null;
      }

      // Generate local competitor rankings for this pin
      const pinCompetitors: GmbPinCompetitor[] = [];
      const pool = [...SAMPLE_COMPETITORS_POOL];

      // Insert target business at the determined rank
      if (rank != null && rank <= 20) {
        const target = pool[0];
        const others = pool.slice(1);
        // Shuffle slightly based on position
        others.sort((a, b) => {
          const hashA = (a.title.length * 17 + r * 3) % 10;
          const hashB = (b.title.length * 17 + c * 5) % 10;
          return hashA - hashB;
        });

        let currentRank = 1;
        while (currentRank <= 7) {
          if (currentRank === rank) {
            pinCompetitors.push({ ...target, rank });
          } else {
            const nextComp = others.shift();
            if (nextComp) {
              pinCompetitors.push({ ...nextComp, rank: currentRank });
            }
          }
          currentRank++;
        }
      } else {
        // Target is not in top 7
        pool.slice(1).forEach((comp, idx) => {
          pinCompetitors.push({ ...comp, rank: idx + 1 });
        });
      }

      snapshots.push({
        id: `demo-pin-${r}-${c}`,
        lat,
        lng,
        gridRow: r,
        gridCol: c,
        rank,
        status: "completed",
        itemsJson: JSON.stringify(pinCompetitors),
        errorCode: null,
        errorMessage: null,
      });
    }
  }

  return snapshots;
}
