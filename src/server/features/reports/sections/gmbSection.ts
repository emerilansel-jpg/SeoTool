import { GmbGridRepository } from "@/server/features/gmb-grid/repositories/GmbGridRepository";

type RangeInput = {
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
};

export type GmbSectionResult =
  | { status: "ok"; data: GmbSectionData }
  | { status: "skipped"; reason: string };

export type GmbHistoricalRun = {
  runId: string;
  configId: string;
  businessName: string;
  keyword: string;
  gridSize: number;
  radiusMeters: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  totalPoints: number;
  completedPoints: number;
  failedPoints: number;
  foundPoints: number;
  top3: number;
  top10: number;
  top20: number;
  foundCoveragePct: number;
  solv: number | null;
  averageRank: number | null;
  costUsd: number;
};

export type GmbPeriodSummary = {
  runsCount: number;
  completedRunsCount: number;
  avgSolv: number | null;
  avgRank: number | null;
  totalCostUsd: number;
  dataCompletenessPct: number;
};

export type GmbProfileSummary = {
  businessName: string;
  placeId: string;
  address: string | null;
  summary: GmbPeriodSummary;
  comparison: {
    solvDelta: number | null;
    rankDelta: number | null;
    costDelta: number;
    runsDelta: number;
  };
  runs: GmbHistoricalRun[];
};

export type GmbSectionData = {
  hasData: boolean;
  current: GmbPeriodSummary;
  previous: GmbPeriodSummary;
  comparison: {
    solvDelta: number | null;
    rankDelta: number | null;
    costDelta: number;
    runsDelta: number;
  };
  runs: GmbHistoricalRun[];
  profiles: GmbProfileSummary[];
};

export async function buildGmbSection(
  projectId: string,
  range: RangeInput,
  sectionConfig?: Record<string, unknown>,
): Promise<GmbSectionResult> {
  let configs = await GmbGridRepository.listConfigsForProject(projectId);
  if (configs.length === 0) {
    return {
      status: "skipped",
      reason: "No Google Business Profile map scans configured yet.",
    };
  }

  const targetBusiness =
    typeof sectionConfig?.businessName === "string" &&
    sectionConfig.businessName.trim()
      ? sectionConfig.businessName.trim()
      : null;

  if (targetBusiness) {
    configs = configs.filter((c) => c.businessName === targetBusiness);
    if (configs.length === 0) {
      return {
        status: "skipped",
        reason: `No scans found for business profile "${targetBusiness}".`,
      };
    }
  }

  let [currentRows, prevRows] = await Promise.all([
    GmbGridRepository.listRunsForDateRange(
      projectId,
      range.startDate,
      `${range.endDate}T23:59:59.999Z`,
    ),
    GmbGridRepository.listRunsForDateRange(
      projectId,
      range.prevStartDate,
      `${range.prevEndDate}T23:59:59.999Z`,
    ),
  ]);

  if (targetBusiness) {
    currentRows = currentRows.filter(
      (r) => r.config.businessName === targetBusiness,
    );
    prevRows = prevRows.filter((r) => r.config.businessName === targetBusiness);
  }

  const currentRunIds = currentRows.map((r) => r.run.id);
  const snapshots =
    await GmbGridRepository.getCompletedSnapshotsForRuns(currentRunIds);

  const snapshotsByRun = new Map<string, Array<{ rank: number | null }>>();
  for (const s of snapshots) {
    const list = snapshotsByRun.get(s.runId) ?? [];
    list.push({ rank: s.rank });
    snapshotsByRun.set(s.runId, list);
  }

  const runs: GmbHistoricalRun[] = currentRows.map(({ run, config }) => {
    const runSnaps = snapshotsByRun.get(run.id) ?? [];
    const ranks = runSnaps
      .map((s) => s.rank)
      .filter((r): r is number => r != null);
    const top3 = ranks.filter((r) => r <= 3).length;
    const top10 = ranks.filter((r) => r <= 10).length;
    const top20 = ranks.filter((r) => r <= 20).length;
    const total = run.totalPoints || config.gridSize * config.gridSize;
    const foundCoveragePct =
      total > 0 ? Number(((ranks.length / total) * 100).toFixed(1)) : 0;
    const solv =
      run.solv != null
        ? run.solv
        : total > 0
          ? Number(((top3 / total) * 100).toFixed(2))
          : null;
    const averageRank =
      run.averageRank != null
        ? run.averageRank
        : ranks.length > 0
          ? Number((ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(2))
          : null;

    return {
      runId: run.id,
      configId: config.id,
      businessName: config.businessName,
      keyword: config.keyword,
      gridSize: config.gridSize,
      radiusMeters: config.radiusMeters,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      totalPoints: total,
      completedPoints: run.completedPoints,
      failedPoints: run.failedPoints,
      foundPoints: run.foundPoints,
      top3,
      top10,
      top20,
      foundCoveragePct,
      solv,
      averageRank,
      costUsd: run.costUsd,
    };
  });

  const distinctBusinesses = Array.from(
    new Set(runs.map((r) => r.businessName).filter(Boolean)),
  );

  const profiles: GmbProfileSummary[] = distinctBusinesses.map((bName) => {
    const bRuns = runs.filter((r) => r.businessName === bName);
    const bCurrentRows = currentRows.filter(
      (r) => r.config.businessName === bName,
    );
    const bPrevRows = prevRows.filter((r) => r.config.businessName === bName);

    const bCurrentSummary = summarizeRuns(
      bCurrentRows.map((r) => r.run),
      bRuns,
    );
    const bPrevSummary = summarizeRuns(
      bPrevRows.map((r) => r.run),
      [],
    );

    const bSolvDelta =
      bCurrentSummary.avgSolv != null && bPrevSummary.avgSolv != null
        ? Number((bCurrentSummary.avgSolv - bPrevSummary.avgSolv).toFixed(2))
        : null;
    const bRankDelta =
      bCurrentSummary.avgRank != null && bPrevSummary.avgRank != null
        ? Number((bCurrentSummary.avgRank - bPrevSummary.avgRank).toFixed(2))
        : null;
    const bCostDelta = Number(
      (bCurrentSummary.totalCostUsd - bPrevSummary.totalCostUsd).toFixed(4),
    );
    const bRunsDelta = bCurrentSummary.runsCount - bPrevSummary.runsCount;

    const matchingConfig = configs.find((c) => c.businessName === bName);

    return {
      businessName: bName,
      placeId: matchingConfig?.placeId ?? "",
      address: matchingConfig?.address ?? null,
      summary: bCurrentSummary,
      comparison: {
        solvDelta: bSolvDelta,
        rankDelta: bRankDelta,
        costDelta: bCostDelta,
        runsDelta: bRunsDelta,
      },
      runs: bRuns,
    };
  });

  const currentSummary = summarizeRuns(
    currentRows.map((r) => r.run),
    runs,
  );
  const prevSummary = summarizeRuns(
    prevRows.map((r) => r.run),
    [],
  );

  const solvDelta =
    currentSummary.avgSolv != null && prevSummary.avgSolv != null
      ? Number((currentSummary.avgSolv - prevSummary.avgSolv).toFixed(2))
      : null;
  const rankDelta =
    currentSummary.avgRank != null && prevSummary.avgRank != null
      ? Number((currentSummary.avgRank - prevSummary.avgRank).toFixed(2))
      : null;
  const costDelta = Number(
    (currentSummary.totalCostUsd - prevSummary.totalCostUsd).toFixed(4),
  );
  const runsDelta = currentSummary.runsCount - prevSummary.runsCount;

  return {
    status: "ok",
    data: {
      hasData: runs.length > 0,
      current: currentSummary,
      previous: prevSummary,
      comparison: {
        solvDelta,
        rankDelta,
        costDelta,
        runsDelta,
      },
      runs,
      profiles,
    },
  };
}

function summarizeRuns(
  runs: Array<{
    status: string;
    totalPoints: number;
    completedPoints: number;
    solv: number | null;
    averageRank: number | null;
    costUsd: number;
  }>,
  hydratedRuns: GmbHistoricalRun[],
): GmbPeriodSummary {
  if (runs.length === 0) {
    return {
      runsCount: 0,
      completedRunsCount: 0,
      avgSolv: null,
      avgRank: null,
      totalCostUsd: 0,
      dataCompletenessPct: 0,
    };
  }

  const completed = runs.filter(
    (r) => r.status === "completed" || r.status === "partial",
  );
  const solvValues =
    hydratedRuns.length > 0
      ? hydratedRuns.map((r) => r.solv).filter((s): s is number => s != null)
      : completed.map((r) => r.solv).filter((s): s is number => s != null);

  const rankValues =
    hydratedRuns.length > 0
      ? hydratedRuns
          .map((r) => r.averageRank)
          .filter((rk): rk is number => rk != null)
      : completed
          .map((r) => r.averageRank)
          .filter((rk): rk is number => rk != null);

  const totalPoints = runs.reduce((sum, r) => sum + r.totalPoints, 0);
  const completedPoints = runs.reduce((sum, r) => sum + r.completedPoints, 0);
  const completeness =
    totalPoints > 0
      ? Number(((completedPoints / totalPoints) * 100).toFixed(1))
      : 0;

  const totalCost = Number(
    runs.reduce((sum, r) => sum + r.costUsd, 0).toFixed(4),
  );

  return {
    runsCount: runs.length,
    completedRunsCount: completed.length,
    avgSolv:
      solvValues.length > 0
        ? Number(
            (solvValues.reduce((a, b) => a + b, 0) / solvValues.length).toFixed(
              2,
            ),
          )
        : null,
    avgRank:
      rankValues.length > 0
        ? Number(
            (rankValues.reduce((a, b) => a + b, 0) / rankValues.length).toFixed(
              2,
            ),
          )
        : null,
    totalCostUsd: totalCost,
    dataCompletenessPct: completeness,
  };
}
