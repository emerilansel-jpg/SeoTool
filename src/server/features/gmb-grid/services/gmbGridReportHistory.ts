import { GmbGridRepository } from "../repositories/GmbGridRepository";

export async function getReportHistory(projectId: string, days = 30) {
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - days * 86400000).toISOString();
  const history = await GmbGridRepository.getReportHistory(
    projectId,
    startDate,
  );

  const rows = await Promise.all(
    history.map(async ({ run, config }) => {
      const snapshots = await GmbGridRepository.getSnapshotsForRun(run.id);
      const ranks = snapshots.flatMap((s) =>
        s.status === "completed" && s.rank != null ? [s.rank] : [],
      );
      const top3 = ranks.filter((r) => r <= 3).length;
      const top10 = ranks.filter((r) => r <= 10).length;
      const top20 = ranks.filter((r) => r <= 20).length;
      const totalPoints = run.totalPoints || snapshots.length;
      const foundCoverage =
        totalPoints > 0 ? Math.round((ranks.length / totalPoints) * 100) : 0;

      return {
        runId: run.id,
        configId: config.id,
        date: run.startedAt.slice(0, 10),
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        businessName: config.businessName,
        keyword: config.keyword,
        gridSize: config.gridSize,
        radiusMeters: config.radiusMeters,
        status: run.status,
        solv: run.solv,
        averageRank: run.averageRank,
        foundCoverage,
        top3,
        top10,
        top20,
        completedPoints: run.completedPoints,
        failedPoints: run.failedPoints,
        totalPoints,
        costUsd: run.costUsd,
      };
    }),
  );

  return {
    range: {
      startDate,
      endDate,
    },
    rows,
  };
}
