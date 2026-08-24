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

export function normalizeBusinessName(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export interface GmbMapItem {
  type?: string | null;
  place_id?: string | null;
  title?: string | null;
  rank_group?: number | null;
  rank_absolute?: number | null;
}

export function findGmbRank(
  items: GmbMapItem[],
  target: { placeId: string; businessName: string },
): number | null {
  const exact = items.find(
    (item) => item.type === "maps_search" && item.place_id === target.placeId,
  );
  if (exact) return exact.rank_group ?? exact.rank_absolute ?? null;

  // Place ID is the stable identity. Name matching is intentionally limited
  // to legacy configurations that were created before place_id was required.
  if (target.placeId) return null;
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
