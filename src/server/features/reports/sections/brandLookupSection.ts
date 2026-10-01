import {
  BrandLookupRepository,
  type BrandLookupSnapshotWithRelations,
} from "@/server/features/ai-search/repositories/BrandLookupRepository";

type RangeInput = {
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
};

export type BrandLookupSectionResult =
  | { status: "ok"; data: BrandLookupSectionData }
  | { status: "skipped"; reason: string };

export type BrandPlatformTrend = {
  platform: "chat_gpt" | "google";
  latestMentions: number | null;
  avgMentions: number | null;
  points: Array<{
    date: string;
    mentions: number | null;
    aiSearchVolume: number | null;
  }>;
};

export type BrandSovSummary = {
  label: string;
  isTarget: boolean;
  sharePct: number | null;
  mentions: number | null;
};

export type BrandLookupSectionData = {
  hasData: boolean;
  latestTarget: {
    query: string;
    targetType: string;
    targetValue: string;
    locationCode: number;
    languageCode: string;
    fetchedAt: string;
  } | null;
  dataFreshness: {
    lastFetchedAt: string | null;
    daysSinceLastFetch: number | null;
  };
  current: {
    snapshotsCount: number;
    avgTotalMentions: number | null;
    avgTotalAiSearchVolume: number | null;
    platformTrends: BrandPlatformTrend[];
    sovEntries: BrandSovSummary[];
  };
  previous: {
    snapshotsCount: number;
    avgTotalMentions: number | null;
    avgTotalAiSearchVolume: number | null;
  };
  comparison: {
    mentionsDelta: number | null;
    volumeDelta: number | null;
  };
  snapshots: Array<{
    id: string;
    snapshotDate: string;
    query: string;
    totalMentions: number | null;
    totalAiSearchVolume: number | null;
    fetchedAt: string;
  }>;
};

export async function buildBrandLookupSection(
  projectId: string,
  range: RangeInput,
): Promise<BrandLookupSectionResult> {
  const [currentSnapshots, prevSnapshots, latestOverall] = await Promise.all([
    BrandLookupRepository.listSnapshotsForDateRange(
      projectId,
      range.startDate,
      range.endDate,
    ),
    BrandLookupRepository.listSnapshotsForDateRange(
      projectId,
      range.prevStartDate,
      range.prevEndDate,
    ),
    BrandLookupRepository.getLatestSnapshot(projectId),
  ]);

  if (!latestOverall && currentSnapshots.length === 0) {
    return {
      status: "skipped",
      reason:
        "No Brand Lookup data recorded yet. Run a Brand Lookup in AI Search to build historical data.",
    };
  }

  const latest = currentSnapshots[0] ?? latestOverall;
  const daysSinceLastFetch = latest
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(latest.fetchedAt).getTime()) / 86400000,
        ),
      )
    : null;

  const currentSummary = summarizeSnapshots(currentSnapshots);
  const prevSummary = summarizeSnapshots(prevSnapshots);

  const platformTrends = buildPlatformTrends(currentSnapshots);
  const sovEntries: BrandSovSummary[] = (latest?.sovEntries ?? []).map((e) => ({
    label: e.label,
    isTarget: e.isTarget,
    sharePct: e.sharePct,
    mentions: e.mentions,
  }));

  const mentionsDelta =
    currentSummary.avgTotalMentions != null &&
    prevSummary.avgTotalMentions != null
      ? currentSummary.avgTotalMentions - prevSummary.avgTotalMentions
      : null;

  const volumeDelta =
    currentSummary.avgTotalAiSearchVolume != null &&
    prevSummary.avgTotalAiSearchVolume != null
      ? currentSummary.avgTotalAiSearchVolume -
        prevSummary.avgTotalAiSearchVolume
      : null;

  return {
    status: "ok",
    data: {
      hasData: currentSnapshots.length > 0,
      latestTarget: latest
        ? {
            query: latest.query,
            targetType: latest.targetType,
            targetValue: latest.targetValue,
            locationCode: latest.locationCode,
            languageCode: latest.languageCode,
            fetchedAt: latest.fetchedAt,
          }
        : null,
      dataFreshness: {
        lastFetchedAt: latest?.fetchedAt ?? null,
        daysSinceLastFetch,
      },
      current: {
        snapshotsCount: currentSnapshots.length,
        avgTotalMentions: currentSummary.avgTotalMentions,
        avgTotalAiSearchVolume: currentSummary.avgTotalAiSearchVolume,
        platformTrends,
        sovEntries,
      },
      previous: {
        snapshotsCount: prevSnapshots.length,
        avgTotalMentions: prevSummary.avgTotalMentions,
        avgTotalAiSearchVolume: prevSummary.avgTotalAiSearchVolume,
      },
      comparison: {
        mentionsDelta,
        volumeDelta,
      },
      snapshots: currentSnapshots.map((s) => ({
        id: s.id,
        snapshotDate: s.snapshotDate,
        query: s.query,
        totalMentions: s.totalMentions,
        totalAiSearchVolume: s.totalAiSearchVolume,
        fetchedAt: s.fetchedAt,
      })),
    },
  };
}

function summarizeSnapshots(snapshots: BrandLookupSnapshotWithRelations[]) {
  if (snapshots.length === 0) {
    return {
      avgTotalMentions: null,
      avgTotalAiSearchVolume: null,
    };
  }

  const mentionsList = snapshots
    .map((s) => s.totalMentions)
    .filter((m): m is number => m != null);
  const volumeList = snapshots
    .map((s) => s.totalAiSearchVolume)
    .filter((v): v is number => v != null);

  return {
    avgTotalMentions:
      mentionsList.length > 0
        ? Math.round(
            mentionsList.reduce((a, b) => a + b, 0) / mentionsList.length,
          )
        : null,
    avgTotalAiSearchVolume:
      volumeList.length > 0
        ? Math.round(volumeList.reduce((a, b) => a + b, 0) / volumeList.length)
        : null,
  };
}

function buildPlatformTrends(
  snapshots: BrandLookupSnapshotWithRelations[],
): BrandPlatformTrend[] {
  const platforms: Array<"chat_gpt" | "google"> = ["chat_gpt", "google"];

  return platforms.map((platform) => {
    const points = snapshots.map((s) => {
      const pRow = s.platforms.find((p) => p.platform === platform);
      return {
        date: s.snapshotDate,
        mentions: pRow?.mentions ?? null,
        aiSearchVolume: pRow?.aiSearchVolume ?? null,
      };
    });

    const mentions = points
      .map((p) => p.mentions)
      .filter((m): m is number => m != null);

    return {
      platform,
      latestMentions: points[0]?.mentions ?? null,
      avgMentions:
        mentions.length > 0
          ? Math.round(mentions.reduce((a, b) => a + b, 0) / mentions.length)
          : null,
      points,
    };
  });
}
