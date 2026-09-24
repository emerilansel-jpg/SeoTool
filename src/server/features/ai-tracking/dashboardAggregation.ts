import { safeHostname, safeHttpUrl } from "@/server/features/ai-search/safeUrl";
import type { LlmResponseResult } from "@/server/lib/dataforseoLlmSchemas";
import type {
  aiTrackingObservations,
  aiTrackingMentions,
  aiTrackingCitations,
  aiTrackingPrompts,
  aiTrackingRuns,
} from "@/db/schema";
import type {
  AiTrackingDashboardData,
  AiTrackingPlatform,
  AiTrackingSchedule,
  AiTrackingScheduleStatus,
} from "@/types/schemas/ai-tracking";

type ObservationRow = typeof aiTrackingObservations.$inferSelect;
type MentionRow = typeof aiTrackingMentions.$inferSelect;
type CitationRow = typeof aiTrackingCitations.$inferSelect;
type PromptRow = typeof aiTrackingPrompts.$inferSelect;
type RunRow = typeof aiTrackingRuns.$inferSelect;

export function extractText(response: LlmResponseResult): string {
  const textParts: string[] = [];
  for (const item of response.items ?? []) {
    if (item.type !== "message") continue;
    for (const section of item.sections ?? []) {
      if (typeof section.text === "string" && section.text.length > 0) {
        textParts.push(section.text);
      }
    }
  }
  return textParts.join("\n\n").trim();
}

export function extractCitations(response: LlmResponseResult) {
  const citations: Array<{
    url: string;
    domain: string;
    title: string | null;
  }> = [];
  const seen = new Set<string>();

  for (const item of response.items ?? []) {
    if (item.type !== "message") continue;
    for (const section of item.sections ?? []) {
      for (const annotation of section.annotations ?? []) {
        if (!annotation.url) continue;
        const safeUrl = safeHttpUrl(annotation.url);
        if (!safeUrl || seen.has(safeUrl)) continue;
        seen.add(safeUrl);
        citations.push({
          url: safeUrl,
          domain: safeHostname(safeUrl) ?? safeUrl,
          title: annotation.title ?? null,
        });
      }
    }
  }
  return citations;
}

export function aggregateDashboardMetrics(params: {
  config: {
    id: string;
    projectId: string;
    brandName: string;
    domain: string;
    brandAliases: string[];
    platforms: AiTrackingPlatform[];
    schedule: AiTrackingSchedule;
    scheduleStatus: AiTrackingScheduleStatus;
    lastRunAt: string | null;
  };
  promptsList: PromptRow[];
  observations: ObservationRow[];
  mentions: MentionRow[];
  citations: CitationRow[];
  latestRun: RunRow | null;
}): AiTrackingDashboardData {
  const { config, promptsList, observations, mentions, citations, latestRun } =
    params;

  const mentionsByObs = new Map<string, MentionRow[]>();
  for (const m of mentions) {
    const list = mentionsByObs.get(m.observationId) ?? [];
    list.push(m);
    mentionsByObs.set(m.observationId, list);
  }

  const citationsByObs = new Map<string, CitationRow[]>();
  for (const c of citations) {
    const list = citationsByObs.get(c.observationId) ?? [];
    list.push(c);
    citationsByObs.set(c.observationId, list);
  }

  const successfulObservations = observations.filter(
    (o) => o.status === "success",
  );
  const totalResponses = successfulObservations.length;

  let targetMentionsCount = 0;
  const targetPositions: number[] = [];
  let positiveSentiment = 0;
  let mixedSentiment = 0;
  let negativeSentiment = 0;
  let neutralSentiment = 0;
  const insightMap = new Map<
    string,
    { count: number; sentiment: MentionRow["sentiment"] }
  >();

  const entityStats = new Map<
    string,
    {
      domain: string;
      brandName: string;
      isTargetBrand: boolean;
      positions: number[];
      mentionsCount: number;
    }
  >();

  entityStats.set(config.domain.toLowerCase(), {
    domain: config.domain,
    brandName: config.brandName,
    isTargetBrand: true,
    positions: [],
    mentionsCount: 0,
  });

  for (const obs of successfulObservations) {
    const obsMentions = mentionsByObs.get(obs.id) ?? [];
    const targetMention = obsMentions.find((m) => m.isTargetBrand);

    if (targetMention) {
      targetMentionsCount++;
      if (targetMention.position != null)
        targetPositions.push(targetMention.position);
      if (targetMention.sentiment === "positive") positiveSentiment++;
      else if (targetMention.sentiment === "mixed") mixedSentiment++;
      else if (targetMention.sentiment === "negative") negativeSentiment++;
      else neutralSentiment++;

      if (targetMention.evidence) {
        const phrase = targetMention.evidence.slice(0, 60).trim();
        const existing = insightMap.get(phrase) ?? {
          count: 0,
          sentiment: targetMention.sentiment,
        };
        existing.count++;
        insightMap.set(phrase, existing);
      }
    }

    for (const m of obsMentions) {
      const key = m.domain.toLowerCase();
      let stat = entityStats.get(key);
      if (!stat) {
        stat = {
          domain: m.domain,
          brandName: m.brandName,
          isTargetBrand: m.isTargetBrand,
          positions: [],
          mentionsCount: 0,
        };
        entityStats.set(key, stat);
      }
      stat.mentionsCount++;
      if (m.position != null) stat.positions.push(m.position);
    }
  }

  const mentionCoveragePercent =
    totalResponses > 0
      ? Math.round((targetMentionsCount / totalResponses) * 100)
      : 0;
  const averageListPosition =
    targetPositions.length > 0
      ? Number(
          (
            targetPositions.reduce((a, b) => a + b, 0) / targetPositions.length
          ).toFixed(1),
        )
      : null;

  const sentimentPercent = (count: number) =>
    targetMentionsCount > 0
      ? Math.round((count / targetMentionsCount) * 100)
      : 0;
  const positivePercent = sentimentPercent(positiveSentiment);
  const mixedPercent = sentimentPercent(mixedSentiment);
  const neutralPercent = sentimentPercent(neutralSentiment);
  const negativePercent = sentimentPercent(negativeSentiment);

  const dayMap = new Map<
    string,
    { positions: number[]; mentions: number; total: number }
  >();
  for (const obs of successfulObservations) {
    const dateKey = obs.observedAt.slice(0, 10);
    let dayData = dayMap.get(dateKey);
    if (!dayData) {
      dayData = { positions: [], mentions: 0, total: 0 };
      dayMap.set(dateKey, dayData);
    }
    dayData.total++;
    const tm = (mentionsByObs.get(obs.id) ?? []).find((m) => m.isTargetBrand);
    if (tm) {
      dayData.mentions++;
      if (tm.position != null) dayData.positions.push(tm.position);
    }
  }

  const sortedDates = Array.from(dayMap.keys()).toSorted();
  const positionTrend = sortedDates.map((date) => {
    const d = dayMap.get(date)!;
    const pos =
      d.positions.length > 0
        ? Number(
            (
              d.positions.reduce((a, b) => a + b, 0) / d.positions.length
            ).toFixed(1),
          )
        : null;
    return { date, position: pos };
  });

  const visibilityTrend = sortedDates.map((date) => {
    const d = dayMap.get(date)!;
    const vis = d.total > 0 ? Math.round((d.mentions / d.total) * 100) : 0;
    return { date, visibility: vis };
  });

  const competitorRankings = Array.from(entityStats.values())
    .map((stat) => {
      const avgPosition =
        stat.positions.length > 0
          ? Number(
              (
                stat.positions.reduce((a, b) => a + b, 0) /
                stat.positions.length
              ).toFixed(1),
            )
          : 0;
      const visibilityPct =
        totalResponses > 0
          ? Math.round((stat.mentionsCount / totalResponses) * 100)
          : 0;
      return {
        domain: stat.domain,
        brandName: stat.brandName,
        isTargetBrand: stat.isTargetBrand,
        avgPosition,
        mentionsCount: stat.mentionsCount,
        visibilityPct,
      };
    })
    .toSorted(
      (a, b) =>
        b.mentionsCount - a.mentionsCount ||
        b.visibilityPct - a.visibilityPct ||
        a.domain.localeCompare(b.domain),
    );

  const topInsights = Array.from(insightMap.entries())
    .map(([text, val]) => ({
      text,
      count: val.count,
      sentiment: val.sentiment,
    }))
    .toSorted((a, b) => b.count - a.count)
    .slice(0, 10);

  const promptItems = promptsList.map((p) => {
    const obsForPrompt = observations.filter((o) => o.promptId === p.id);
    const latestObs = obsForPrompt[0];
    const tm = latestObs
      ? (mentionsByObs.get(latestObs.id) ?? []).find((m) => m.isTargetBrand)
      : null;
    return {
      id: p.id,
      prompt: p.prompt,
      active: p.active,
      createdAt: p.createdAt,
      lastPosition: tm?.position ?? null,
      lastMentioned: tm ? true : latestObs ? false : null,
      lastSentiment: tm?.sentiment ?? null,
      lastCheckedAt: latestObs?.observedAt ?? null,
    };
  });

  const recentObservations = observations.slice(0, 20).map((obs) => {
    const obsMentions = mentionsByObs.get(obs.id) ?? [];
    const tm = obsMentions.find((m) => m.isTargetBrand);
    const obsCitations = citationsByObs.get(obs.id) ?? [];
    return {
      id: obs.id,
      prompt: obs.prompt,
      platform: obs.platform,
      status: obs.status,
      observedAt: obs.observedAt,
      brandMentioned: Boolean(tm),
      position: tm?.position ?? null,
      sentiment: tm?.sentiment ?? "neutral",
      evidence: tm?.evidence ?? null,
      responseText: obs.responseText,
      citations: obsCitations.map((c) => ({
        url: c.url,
        domain: c.domain,
        title: c.title,
        isTargetBrand: c.isTargetBrand,
      })),
    };
  });

  return {
    config,
    prompts: promptItems,
    kpi: {
      mentionCoveragePercent,
      positiveMentions: positiveSentiment,
      positiveMentionPercent: positivePercent,
      averageListPosition,
      listPositionSamples: targetPositions.length,
      totalResponses,
      brandMentions: targetMentionsCount,
    },
    sentiment: {
      positive: positiveSentiment,
      mixed: mixedSentiment,
      neutral: neutralSentiment,
      negative: negativeSentiment,
      total: targetMentionsCount,
      positivePercent,
      mixedPercent,
      neutralPercent,
      negativePercent,
      topInsights,
    },
    positionTrend,
    visibilityTrend,
    competitorRankings,
    recentObservations,
    lastRun: latestRun,
  };
}
