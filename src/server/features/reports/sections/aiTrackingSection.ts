// oxlint-disable typescript-eslint/no-unsafe-type-assertion
import { AiTrackingRepository } from "@/server/features/ai-tracking/repositories/AiTrackingRepository";

type RangeInput = {
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
};

export type AiTrackingSectionResult =
  | { status: "ok"; data: AiTrackingSectionData }
  | { status: "skipped"; reason: string };

export type AiVisibilitySummary = {
  avgVisibilityScore: number | null;
  avgMentionRate: number | null;
  avgCitationRate: number | null;
  avgShareOfVoice: number | null;
  snapshotsCount: number;
};

export type AiTrackingSectionData = {
  hasData: boolean;
  config: {
    brandName: string;
    domain: string;
    platforms: string[];
  };
  current: AiVisibilitySummary;
  previous: AiVisibilitySummary;
  comparison: {
    visibilityDelta: number | null;
    mentionRateDelta: number | null;
    citationRateDelta: number | null;
    shareOfVoiceDelta: number | null;
  };
  sentiment: {
    positive: number;
    mixed: number;
    neutral: number;
    negative: number;
    positivePct: number;
  };
  perPlatform: Array<{
    platform: string;
    responsesCount: number;
    mentionsCount: number;
    mentionRatePct: number;
  }>;
  competitors: Array<{
    domain: string;
    brandName: string;
    isTargetBrand: boolean;
    mentionsCount: number;
    avgPosition: number | null;
  }>;
  topCitedPages: Array<{
    url: string;
    domain: string;
    isTargetBrand: boolean;
    frequency: number;
  }>;
  promptMovers: Array<{
    prompt: string;
    currentMentioned: boolean;
    previousMentioned: boolean;
    change: "gained" | "lost" | "maintained" | "new";
  }>;
  dataCompleteness: {
    totalObservations: number;
    successfulObservations: number;
    completenessPct: number;
  };
};

export async function buildAiTrackingSection(
  projectId: string,
  range: RangeInput,
): Promise<AiTrackingSectionResult> {
  const config = await AiTrackingRepository.getConfig(projectId);
  if (!config) {
    return {
      status: "skipped",
      reason: "AI Tracking is not configured for this project.",
    };
  }

  const [currentVis, prevVis, currentObs, prevObs] = await Promise.all([
    AiTrackingRepository.listVisibilitySnapshotsForDateRange(
      config.id,
      range.startDate,
      range.endDate,
    ),
    AiTrackingRepository.listVisibilitySnapshotsForDateRange(
      config.id,
      range.prevStartDate,
      range.prevEndDate,
    ),
    AiTrackingRepository.getObservationsForDateRange(
      config.id,
      range.startDate,
      `${range.endDate}T23:59:59.999Z`,
    ),
    AiTrackingRepository.getObservationsForDateRange(
      config.id,
      range.prevStartDate,
      `${range.prevEndDate}T23:59:59.999Z`,
    ),
  ]);

  const currentSummary = summarizeVisibility(currentVis);
  const prevSummary = summarizeVisibility(prevVis);

  const currentObsIds = currentObs.map((o) => o.id);
  const prevObsIds = prevObs.map((o) => o.id);

  const [currentMentions, currentCitations, prevMentions] = await Promise.all([
    AiTrackingRepository.getMentionsForObservations(config.id, currentObsIds),
    AiTrackingRepository.getCitationsForObservations(config.id, currentObsIds),
    AiTrackingRepository.getMentionsForObservations(config.id, prevObsIds),
  ]);

  const totalObs = currentObs.length;
  const successfulObs = currentObs.filter((o) => o.status === "success").length;
  const completenessPct =
    totalObs > 0 ? Number(((successfulObs / totalObs) * 100).toFixed(1)) : 0;

  const targetMentions = currentMentions.filter((m) => m.isTargetBrand);
  let positive = 0;
  let mixed = 0;
  let neutral = 0;
  let negative = 0;
  for (const m of targetMentions) {
    if (m.sentiment === "positive") positive++;
    else if (m.sentiment === "mixed") mixed++;
    else if (m.sentiment === "negative") negative++;
    else neutral++;
  }
  const positivePct =
    targetMentions.length > 0
      ? Math.round((positive / targetMentions.length) * 100)
      : 0;

  const platformsConfig = (
    typeof config.platforms === "string"
      ? JSON.parse(config.platforms || "[]")
      : config.platforms
  ) as string[];

  const perPlatform = platformsConfig.map((platform) => {
    const obsForPlatform = currentObs.filter(
      (o) => o.platform === platform && o.status === "success",
    );
    const obsIds = new Set(obsForPlatform.map((o) => o.id));
    const mentionsCount = currentMentions.filter(
      (m) => m.isTargetBrand && obsIds.has(m.observationId),
    ).length;
    const rate =
      obsForPlatform.length > 0
        ? Math.round((mentionsCount / obsForPlatform.length) * 100)
        : 0;

    return {
      platform,
      responsesCount: obsForPlatform.length,
      mentionsCount,
      mentionRatePct: rate,
    };
  });

  const competitorMap = new Map<
    string,
    {
      domain: string;
      brandName: string;
      isTargetBrand: boolean;
      mentionsCount: number;
      positions: number[];
    }
  >();

  for (const m of currentMentions) {
    const key = m.domain.toLowerCase();
    const entry = competitorMap.get(key) ?? {
      domain: m.domain,
      brandName: m.brandName,
      isTargetBrand: m.isTargetBrand,
      mentionsCount: 0,
      positions: [],
    };
    entry.mentionsCount++;
    if (m.position != null) entry.positions.push(m.position);
    competitorMap.set(key, entry);
  }

  const competitors = Array.from(competitorMap.values())
    .map((c) => ({
      domain: c.domain,
      brandName: c.brandName,
      isTargetBrand: c.isTargetBrand,
      mentionsCount: c.mentionsCount,
      avgPosition:
        c.positions.length > 0
          ? Number(
              (
                c.positions.reduce((a, b) => a + b, 0) / c.positions.length
              ).toFixed(1),
            )
          : null,
    }))
    .toSorted((a, b) => b.mentionsCount - a.mentionsCount)
    .slice(0, 15);

  const citationUrlMap = new Map<
    string,
    { url: string; domain: string; isTargetBrand: boolean; count: number }
  >();
  for (const c of currentCitations) {
    const entry = citationUrlMap.get(c.url) ?? {
      url: c.url,
      domain: c.domain,
      isTargetBrand: c.isTargetBrand,
      count: 0,
    };
    entry.count++;
    citationUrlMap.set(c.url, entry);
  }
  const topCitedPages = Array.from(citationUrlMap.values())
    .map((c) => ({
      url: c.url,
      domain: c.domain,
      isTargetBrand: c.isTargetBrand,
      frequency: c.count,
    }))
    .toSorted((a, b) => b.frequency - a.frequency)
    .slice(0, 15);

  const promptMovers = buildPromptMovers(
    currentObs,
    currentMentions,
    prevObs,
    prevMentions,
  );

  return {
    status: "ok",
    data: {
      hasData: currentObs.length > 0 || currentVis.length > 0,
      config: {
        brandName: config.brandName,
        domain: config.domain,
        platforms: platformsConfig,
      },
      current: currentSummary,
      previous: prevSummary,
      comparison: {
        visibilityDelta: delta(
          currentSummary.avgVisibilityScore,
          prevSummary.avgVisibilityScore,
        ),
        mentionRateDelta: delta(
          currentSummary.avgMentionRate,
          prevSummary.avgMentionRate,
        ),
        citationRateDelta: delta(
          currentSummary.avgCitationRate,
          prevSummary.avgCitationRate,
        ),
        shareOfVoiceDelta: delta(
          currentSummary.avgShareOfVoice,
          prevSummary.avgShareOfVoice,
        ),
      },
      sentiment: {
        positive,
        mixed,
        neutral,
        negative,
        positivePct,
      },
      perPlatform,
      competitors,
      topCitedPages,
      promptMovers,
      dataCompleteness: {
        totalObservations: totalObs,
        successfulObservations: successfulObs,
        completenessPct,
      },
    },
  };
}

function summarizeVisibility(
  snapshots: Array<{
    platform: string;
    visibilityScore: number;
    mentionRate: number;
    citationRate: number;
    shareOfVoice: number;
  }>,
): AiVisibilitySummary {
  const allRows = snapshots.filter((s) => s.platform === "all");
  const target = allRows.length > 0 ? allRows : snapshots;

  if (target.length === 0) {
    return {
      avgVisibilityScore: null,
      avgMentionRate: null,
      avgCitationRate: null,
      avgShareOfVoice: null,
      snapshotsCount: 0,
    };
  }

  const avg = (fn: (row: (typeof target)[number]) => number) =>
    Math.round(target.reduce((sum, r) => sum + fn(r), 0) / target.length);

  return {
    avgVisibilityScore: avg((r) => r.visibilityScore),
    avgMentionRate: avg((r) => r.mentionRate),
    avgCitationRate: avg((r) => r.citationRate),
    avgShareOfVoice: avg((r) => r.shareOfVoice),
    snapshotsCount: target.length,
  };
}

function delta(a: number | null, b: number | null): number | null {
  if (a == null || b == null) return null;
  return a - b;
}

function buildPromptMovers(
  currentObs: Array<{ id: string; prompt: string }>,
  currentMentions: Array<{ observationId: string; isTargetBrand: boolean }>,
  prevObs: Array<{ id: string; prompt: string }>,
  prevMentions: Array<{ observationId: string; isTargetBrand: boolean }>,
) {
  const currentTargetObsIds = new Set(
    currentMentions.filter((m) => m.isTargetBrand).map((m) => m.observationId),
  );
  const prevTargetObsIds = new Set(
    prevMentions.filter((m) => m.isTargetBrand).map((m) => m.observationId),
  );

  const currentMentionedPrompts = new Set(
    currentObs
      .filter((o) => currentTargetObsIds.has(o.id))
      .map((o) => o.prompt.toLowerCase().trim()),
  );
  const currentAllPrompts = new Set(
    currentObs.map((o) => o.prompt.toLowerCase().trim()),
  );

  const prevMentionedPrompts = new Set(
    prevObs
      .filter((o) => prevTargetObsIds.has(o.id))
      .map((o) => o.prompt.toLowerCase().trim()),
  );
  const prevAllPrompts = new Set(
    prevObs.map((o) => o.prompt.toLowerCase().trim()),
  );

  const uniquePrompts = Array.from(
    new Set([...currentAllPrompts, ...prevAllPrompts]),
  );

  return uniquePrompts
    .map((prompt) => {
      const curMentioned = currentMentionedPrompts.has(prompt);
      const preMentioned = prevMentionedPrompts.has(prompt);
      const curSeen = currentAllPrompts.has(prompt);
      const preSeen = prevAllPrompts.has(prompt);

      let change: "gained" | "lost" | "maintained" | "new" = "maintained";
      if (!preSeen && curSeen) {
        change = "new";
      } else if (!preMentioned && curMentioned) {
        change = "gained";
      } else if (preMentioned && !curMentioned) {
        change = "lost";
      }

      return {
        prompt,
        currentMentioned: curMentioned,
        previousMentioned: preMentioned,
        change,
      };
    })
    .slice(0, 20);
}
