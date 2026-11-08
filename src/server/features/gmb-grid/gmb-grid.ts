import {
  normalizeCid,
  extractCidFromFeatureId,
} from "@/shared/google-maps-url";

export const GMB_STANDARD_TASK_COST_USD = 0.0006;

export function estimateGmbGridCost(gridSize: number) {
  const points = gridSize * gridSize;
  return {
    points,
    estimatedCostUsd: Number((points * GMB_STANDARD_TASK_COST_USD).toFixed(4)),
  };
}

export function formatMapsCoordinate(
  lat: number,
  lng: number,
  zoom: number,
): string {
  return `${lat},${lng},${zoom}z`;
}

/**
 * Google Maps zoom used for each pin's search viewport. DataForSEO restricts
 * Maps results to the displayed area and returns an EMPTY result set when
 * nothing matches inside it, so a fixed zoom breaks wide grids: at 15z the
 * viewport is only ~1 km, and pins spaced further apart than that all come
 * back "not found". Scale the viewport with the distance between pins instead
 * (~1 km steps scan at 12z, 5 km steps at 11z, verified live), clamped to the
 * provider's 3z-21z range.
 */
export function computeGridMapZoom(
  gridSize: number,
  radiusMeters: number,
): number {
  const stepsFromCenter = Math.max(1, Math.floor(gridSize / 2));
  const stepMeters = radiusMeters / stepsFromCenter;
  const zoom = Math.round(13 - Math.log2(stepMeters / 1000));
  return Math.min(17, Math.max(3, zoom));
}

export function normalizeBusinessName(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export interface GmbMapItem {
  type?: string | null;
  place_id?: string | null;
  cid?: string | null;
  title?: string | null;
  rank_group?: number | null;
  rank_absolute?: number | null;
}

export function findGmbRank(
  items: GmbMapItem[],
  target: { placeId: string; businessName: string; cid?: string | null },
): number | null {
  const targetCidNorm =
    normalizeCid(target.cid) ?? extractCidFromFeatureId(target.placeId);

  const exact = items.find((item) => {
    if (item.type !== "maps_search") return false;
    if (target.placeId && item.place_id === target.placeId) return true;
    if (targetCidNorm) {
      const itemCidNorm =
        normalizeCid(item.cid) ?? extractCidFromFeatureId(item.place_id);
      if (itemCidNorm && itemCidNorm === targetCidNorm) return true;
    }
    return false;
  });
  if (exact) return exact.rank_group ?? exact.rank_absolute ?? null;

  // Place ID or CID is the stable identity. Name matching is intentionally limited
  // to legacy configurations that were created before place_id was required.
  if (target.placeId || target.cid) return null;
  const normalizedTarget = normalizeBusinessName(target.businessName);
  const titleMatch = items.find(
    (item) =>
      item.type === "maps_search" &&
      item.title != null &&
      normalizeBusinessName(item.title) === normalizedTarget,
  );
  return titleMatch?.rank_group ?? titleMatch?.rank_absolute ?? null;
}

export function calculateGmbMetrics(
  snapshots: Array<{ status: string; rank: number | null }>,
) {
  const completed = snapshots.filter((row) => row.status === "completed");
  const failedPoints = snapshots.filter(
    (row) => row.status === "failed",
  ).length;
  const ranks = completed
    .map((row) => row.rank)
    .filter((rank): rank is number => rank != null);
  const top3Count = ranks.filter((rank) => rank <= 3).length;
  const totalPoints = snapshots.length;

  return {
    totalPoints,
    completedPoints: completed.length,
    failedPoints,
    foundPoints: ranks.length,
    solv:
      totalPoints === 0
        ? null
        : Number(((top3Count / totalPoints) * 100).toFixed(2)),
    averageRank:
      ranks.length === 0
        ? null
        : Number(
            (
              ranks.reduce((total, rank) => total + rank, 0) / ranks.length
            ).toFixed(2),
          ),
  };
}
