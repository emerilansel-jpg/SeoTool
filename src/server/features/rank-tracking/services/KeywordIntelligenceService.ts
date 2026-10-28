import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  rankSnapshots,
  rankCheckRuns,
  serpSnapshots,
  rankTrackingKeywords,
} from "@/db/schema";
import { toSqliteTimestamp } from "@/server/features/rank-tracking/rankTrackingTimestamps";
import { positionToVisibility } from "@/shared/rank-tracking";

export { positionToVisibility };

export interface KeywordIntelligenceDetail {
  keyword: string;
  domain: string;
  device: "desktop" | "mobile";
  currentPosition: number | null;
  previousPosition: number | null;
  positionDelta: number;
  visibilityScore: number;
  visibilityDelta: number;
  aiOverview: {
    status: "found" | "cited" | "missing" | "no_ai_overview";
    sharePercent: number;
    label: string;
  };
  aeoScore: number;
  aeoStatus: string;
  geoScore: number;
  geoStatus: string;
  serpVolatility: {
    score: number;
    level: "calm" | "moderate" | "high";
    label: string;
    description: string;
  };
  topMovers24h: {
    headline: string;
    change: number;
  };
  visibilityHistory: Array<{
    date: string;
    score: number;
    position: number | null;
  }>;
  rankDistribution30d: {
    top3: number;
    pos4_10: number;
    pos11_20: number;
    pos21_50: number;
    pos51_100: number;
  };
  historyPoints: Array<{
    date: string;
    position: number | null;
    previousPosition: number | null;
    change: number;
  }>;
}

function parseSerpFeatures(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface SerpItem {
  domain: string | null;
  rank: number;
}

interface ChurnResult {
  volatilityScore: number;
  topMoverHeadline: string;
  topMoverChange: number;
}

function computeSerpChurn(
  itemsLatest: SerpItem[],
  itemsPrevious: SerpItem[],
  keywordFallback: string,
  posDelta: number,
): ChurnResult {
  if (itemsLatest.length === 0 || itemsPrevious.length === 0) {
    return {
      volatilityScore: 2.4,
      topMoverHeadline: `${keywordFallback} No change`,
      topMoverChange: posDelta,
    };
  }

  const prevMap = new Map<string, number>();
  for (const item of itemsPrevious) {
    if (item.domain) prevMap.set(item.domain.toLowerCase(), item.rank);
  }

  let rankChurn = 0;
  let newEntrants = 0;
  let maxCompetitorMove = 0;
  let maxMoverDomain = "";

  for (const item of itemsLatest) {
    if (!item.domain) continue;
    const prevRank = prevMap.get(item.domain.toLowerCase());
    if (prevRank !== undefined) {
      const diff = Math.abs(prevRank - item.rank);
      rankChurn += diff;
      if (diff > Math.abs(maxCompetitorMove)) {
        maxCompetitorMove = prevRank - item.rank;
        maxMoverDomain = item.domain;
      }
    } else {
      newEntrants++;
    }
  }

  const rawScore = rankChurn / 8 + newEntrants * 1.5;
  const volatilityScore = Math.min(
    10,
    Math.max(1, Math.round(rawScore * 10) / 10),
  );

  let topMoverHeadline = `${keywordFallback} No change`;
  let topMoverChange = posDelta;

  if (maxMoverDomain) {
    topMoverHeadline = `${maxMoverDomain} ${maxCompetitorMove > 0 ? `+${maxCompetitorMove}` : maxCompetitorMove} pos`;
    topMoverChange = maxCompetitorMove;
  } else if (posDelta !== 0) {
    topMoverHeadline = `${keywordFallback} ${posDelta > 0 ? `+${posDelta}` : posDelta} pos`;
  }

  return { volatilityScore, topMoverHeadline, topMoverChange };
}

async function fetchRecentRuns(trackingKeywordId: string, device: string) {
  return db
    .select({
      runId: serpSnapshots.runId,
      checkedAt: sql<Date>`max(${serpSnapshots.checkedAt})`.as("checked_at"),
    })
    .from(serpSnapshots)
    .where(
      and(
        eq(serpSnapshots.trackingKeywordId, trackingKeywordId),
        eq(serpSnapshots.device, device),
      ),
    )
    .groupBy(serpSnapshots.runId)
    .orderBy(desc(sql`max(${serpSnapshots.checkedAt})`))
    .limit(2);
}

async function computeVolatilityData(
  trackingKeywordId: string,
  device: string,
  keywordName: string,
  positionDelta: number,
): Promise<ChurnResult> {
  try {
    const distinctRuns = await fetchRecentRuns(trackingKeywordId, device);
    if (distinctRuns.length < 2) {
      const score =
        Math.abs(positionDelta) >= 5
          ? 8.5
          : Math.abs(positionDelta) >= 2
            ? 5.2
            : 2.4;
      return {
        volatilityScore: score,
        topMoverHeadline:
          positionDelta !== 0
            ? `${keywordName} ${positionDelta > 0 ? `+${positionDelta}` : positionDelta} pos`
            : `${keywordName} No change`,
        topMoverChange: positionDelta,
      };
    }

    const [itemsLatest, itemsPrevious] = await Promise.all([
      db
        .select({ domain: serpSnapshots.domain, rank: serpSnapshots.rank })
        .from(serpSnapshots)
        .where(
          and(
            eq(serpSnapshots.runId, distinctRuns[0].runId),
            eq(serpSnapshots.trackingKeywordId, trackingKeywordId),
            eq(serpSnapshots.device, device),
          ),
        )
        .limit(20),
      db
        .select({ domain: serpSnapshots.domain, rank: serpSnapshots.rank })
        .from(serpSnapshots)
        .where(
          and(
            eq(serpSnapshots.runId, distinctRuns[1].runId),
            eq(serpSnapshots.trackingKeywordId, trackingKeywordId),
            eq(serpSnapshots.device, device),
          ),
        )
        .limit(20),
    ]);

    return computeSerpChurn(
      itemsLatest,
      itemsPrevious,
      keywordName,
      positionDelta,
    );
  } catch {
    const score =
      Math.abs(positionDelta) >= 5
        ? 8.5
        : Math.abs(positionDelta) >= 2
          ? 5.2
          : 2.4;
    return {
      volatilityScore: score,
      topMoverHeadline: `${keywordName} No change`,
      topMoverChange: positionDelta,
    };
  }
}

export const KeywordIntelligenceService = {
  async getDetail(input: {
    configId: string;
    domain: string;
    trackingKeywordId: string;
    device: "desktop" | "mobile";
    sinceDays?: number;
  }): Promise<KeywordIntelligenceDetail> {
    const sinceDays = input.sinceDays ?? 30;
    const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

    const [kwRow] = await db
      .select({ keyword: rankTrackingKeywords.keyword })
      .from(rankTrackingKeywords)
      .where(eq(rankTrackingKeywords.id, input.trackingKeywordId))
      .limit(1);

    const keywordName = kwRow?.keyword ?? "Keyword";

    const snapshots = await db
      .select({
        runId: rankSnapshots.runId,
        position: rankSnapshots.position,
        url: rankSnapshots.url,
        serpFeatures: rankSnapshots.serpFeatures,
        checkedAt: rankSnapshots.checkedAt,
      })
      .from(rankSnapshots)
      .innerJoin(rankCheckRuns, eq(rankSnapshots.runId, rankCheckRuns.id))
      .where(
        and(
          eq(rankCheckRuns.configId, input.configId),
          eq(rankCheckRuns.status, "completed"),
          eq(rankSnapshots.trackingKeywordId, input.trackingKeywordId),
          eq(rankSnapshots.device, input.device),
          gte(rankSnapshots.checkedAt, toSqliteTimestamp(cutoff)),
        ),
      )
      .orderBy(desc(rankSnapshots.checkedAt))
      .limit(60);

    const latest = snapshots[0] ?? null;
    const previous = snapshots[1] ?? null;

    const currentPosition = latest?.position ?? null;
    const previousPosition = previous?.position ?? null;

    const positionDelta =
      currentPosition !== null && previousPosition !== null
        ? previousPosition - currentPosition
        : 0;

    const currentVis = positionToVisibility(currentPosition);
    const prevVis = positionToVisibility(previousPosition);
    const visibilityDelta = currentVis - prevVis;

    const latestFeatures = parseSerpFeatures(latest?.serpFeatures ?? null);
    const hasAiOverview = latestFeatures.includes("ai_overview");
    const aiOverview: KeywordIntelligenceDetail["aiOverview"] = hasAiOverview
      ? currentPosition !== null && currentPosition <= 10
        ? { status: "found", sharePercent: 100, label: "100% Status: Found" }
        : { status: "missing", sharePercent: 0, label: "0% Not Cited" }
      : { status: "no_ai_overview", sharePercent: 0, label: "No AI Overview" };

    const aeoScore = currentPosition
      ? currentPosition <= 3
        ? 85
        : currentPosition <= 10
          ? 62
          : 25
      : 0;

    const hasLocalPack =
      latestFeatures.includes("local_pack") ||
      latestFeatures.includes("local_finder");
    const geoScore = hasLocalPack
      ? currentPosition && currentPosition <= 3
        ? 100
        : 35
      : 0;
    const geoStatus = hasLocalPack
      ? geoScore === 100
        ? "100% in 3-Pack"
        : "Local Pack Present"
      : "0 GEO Status";

    const { volatilityScore, topMoverHeadline, topMoverChange } =
      await computeVolatilityData(
        input.trackingKeywordId,
        input.device,
        keywordName,
        positionDelta,
      );

    const volatilityLevel: "calm" | "moderate" | "high" =
      volatilityScore >= 6.6
        ? "high"
        : volatilityScore >= 3.5
          ? "moderate"
          : "calm";

    const volatilityLabel =
      volatilityLevel === "high"
        ? "High"
        : volatilityLevel === "moderate"
          ? "Moderate"
          : "Calm";

    const volatilityDesc =
      volatilityLevel === "high"
        ? `Turbulent SERPs (Score: ${volatilityScore}/10)`
        : volatilityLevel === "moderate"
          ? `Fluctuating SERPs (Score: ${volatilityScore}/10)`
          : `Stable SERPs (Score: ${volatilityScore}/10)`;

    const chronological = snapshots.toReversed();
    const visibilityHistory = chronological.map((s) => ({
      date: new Date(s.checkedAt).toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      }),
      score: positionToVisibility(s.position),
      position: s.position,
    }));

    let top3 = 0;
    let pos4_10 = 0;
    let pos11_20 = 0;
    let pos21_50 = 0;
    let pos51_100 = 0;

    for (const s of snapshots) {
      const pos = s.position;
      if (pos === null) pos51_100++;
      else if (pos <= 3) top3++;
      else if (pos <= 10) pos4_10++;
      else if (pos <= 20) pos11_20++;
      else if (pos <= 50) pos21_50++;
      else pos51_100++;
    }

    const historyPoints = snapshots.map((s, idx) => {
      const prev = snapshots[idx + 1]?.position ?? null;
      const change =
        s.position !== null && prev !== null ? prev - s.position : 0;
      return {
        date: new Date(s.checkedAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        position: s.position,
        previousPosition: prev,
        change,
      };
    });

    return {
      keyword: keywordName,
      domain: input.domain,
      device: input.device,
      currentPosition,
      previousPosition,
      positionDelta,
      visibilityScore: currentVis,
      visibilityDelta,
      aiOverview,
      aeoScore,
      aeoStatus: `${aeoScore}% AEO Status`,
      geoScore,
      geoStatus,
      serpVolatility: {
        score: volatilityScore,
        level: volatilityLevel,
        label: volatilityLabel,
        description: volatilityDesc,
      },
      topMovers24h: {
        headline: topMoverHeadline,
        change: topMoverChange,
      },
      visibilityHistory,
      rankDistribution30d: {
        top3,
        pos4_10,
        pos11_20,
        pos21_50,
        pos51_100,
      },
      historyPoints,
    };
  },
};
