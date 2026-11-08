import { generateGridNodes } from "@/server/utils/geo-grid";
import { calculateGmbMetrics, estimateGmbGridCost } from "../gmb-grid";

export const E2E_RUN_ID = "00000000-0000-4000-8000-000000000091";
export const E2E_CONFIG_ID = "00000000-0000-4000-8000-000000000092";

/** Deterministic BYPASS_AUTH fixture backing the GMB grid E2E suite. */
export function getE2eRunFixture(projectId: string, runId: string) {
  const now = new Date().toISOString();
  const snapshots = generateGridNodes(-6.2, 106.816666, 7, 5000).map(
    (node, index) => ({
      id: `e2e-snapshot-${index}`,
      runId,
      ...node,
      rank: index % 6 === 0 ? null : (index % 12) + 1,
      taskId: `e2e-task-${index}`,
      status: "completed" as const,
      errorCode: null,
      errorMessage: null,
      checkedAt: now,
    }),
  );
  const metrics = calculateGmbMetrics(snapshots);
  return {
    config: {
      id: E2E_CONFIG_ID,
      projectId,
      businessName: "Test Dental Jakarta",
      placeId: "e2e-place-id",
      cid: "e2e-cid",
      address: "Jakarta, Indonesia",
      keyword: "dentist jakarta",
      centerLat: -6.2,
      centerLng: 106.816666,
      gridSize: 7,
      radiusMeters: 5000,
      languageCode: "en",
      device: "mobile" as const,
      mapZoom: 15,
      scheduleInterval: "manual" as const,
      nextCheckAt: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    run: {
      id: runId,
      configId: E2E_CONFIG_ID,
      status: "completed" as const,
      trigger: "manual" as const,
      ...metrics,
      costUsd: estimateGmbGridCost(7).estimatedCostUsd,
      errorCode: null,
      errorMessage: null,
      startedAt: now,
      completedAt: now,
    },
    snapshots,
  };
}
