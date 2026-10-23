// oxlint-disable complexity, max-lines-per-function
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
  CoCitedCompetitor,
  LlmCitationMetric,
  ProfoundAlert,
  ProfoundPromptDiagnostic,
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

function cleanSentenceSnippet(raw: string, maxLen = 120): string {
  // Strip leading list punctuation e.g. "- ", "* ", "# ", ": "
  let cleaned = raw.replace(/^[\s\-*#:>•]+/, "").trim();
  if (cleaned.length <= maxLen) return cleaned;

  // Truncate at word boundary to avoid chopped words
  const truncated = cleaned.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 40) {
    cleaned = truncated.slice(0, lastSpace).trim();
  } else {
    cleaned = truncated.trim();
  }
  return `${cleaned}…`;
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
        const phrase = cleanSentenceSnippet(targetMention.evidence, 120);
        if (phrase) {
          const existing = insightMap.get(phrase) ?? {
            count: 0,
            sentiment: targetMention.sentiment,
          };
          existing.count++;
          insightMap.set(phrase, existing);
        }
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

  // 1. LLM Citation & Mention Metrics (Profound Pillar 1: /seo profound citations <brand>)
  const ALL_PLATFORMS: AiTrackingPlatform[] = [
    "chat_gpt",
    "perplexity",
    "claude",
    "gemini",
  ];
  const activePlatforms = config.platforms?.length
    ? config.platforms
    : ALL_PLATFORMS;

  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const llmMetrics: LlmCitationMetric[] = activePlatforms.map((platform) => {
    const platformObs = successfulObservations.filter(
      (o) => o.platform === platform,
    );
    const totalResponsesForModel = platformObs.length;
    let citationsCount = 0;
    let mentionsCount = 0;

    let recentTotal = 0;
    let recentCitations = 0;
    let baselineTotal = 0;
    let baselineCitations = 0;

    for (const obs of platformObs) {
      const obsTime = new Date(obs.observedAt).getTime();
      const ageMs = nowMs - obsTime;

      const hasTargetCitation = (citationsByObs.get(obs.id) ?? []).some(
        (c) => c.isTargetBrand,
      );
      const hasTargetMention = (mentionsByObs.get(obs.id) ?? []).some(
        (m) => m.isTargetBrand,
      );

      if (hasTargetCitation) citationsCount++;
      if (hasTargetMention) mentionsCount++;

      if (ageMs <= sevenDaysMs) {
        recentTotal++;
        if (hasTargetCitation) recentCitations++;
      } else if (ageMs <= fourteenDaysMs) {
        baselineTotal++;
        if (hasTargetCitation) baselineCitations++;
      }
    }

    const citationRatePercent =
      totalResponsesForModel > 0
        ? Math.round((citationsCount / totalResponsesForModel) * 100)
        : 0;
    const mentionRatePercent =
      totalResponsesForModel > 0
        ? Math.round((mentionsCount / totalResponsesForModel) * 100)
        : 0;

    let trendDeltaPercent = 0;
    if (recentTotal > 0 && baselineTotal > 0) {
      const recentRate = (recentCitations / recentTotal) * 100;
      const baselineRate = (baselineCitations / baselineTotal) * 100;
      trendDeltaPercent = Math.round(recentRate - baselineRate);
    }

    return {
      platform,
      citationRatePercent,
      mentionRatePercent,
      totalResponses: totalResponsesForModel,
      citationsCount,
      mentionsCount,
      trendDeltaPercent,
    };
  });

  // 2. Profound Baseline Alerts (Profound Pillar 4: /seo profound alerts <brand>)
  const profoundAlerts: ProfoundAlert[] = [];
  const PLATFORM_NAMES: Record<string, string> = {
    chat_gpt: "ChatGPT",
    perplexity: "Perplexity",
    claude: "Claude",
    gemini: "Gemini",
  };

  for (const m of llmMetrics) {
    const name = PLATFORM_NAMES[m.platform] || m.platform;
    if (m.trendDeltaPercent >= 10) {
      profoundAlerts.push({
        id: `alert-spike-${m.platform}`,
        type: "spike",
        severity: "success",
        title: `${name} Citation Spike (+${m.trendDeltaPercent}%)`,
        description: `Citation rate on ${name} rose to ${m.citationRatePercent}% (+${m.trendDeltaPercent}% vs 7-day baseline).`,
        metric: `${m.citationRatePercent}% citation rate`,
        delta: m.trendDeltaPercent,
      });
    } else if (m.trendDeltaPercent <= -10) {
      profoundAlerts.push({
        id: `alert-drop-${m.platform}`,
        type: "drop",
        severity: "warning",
        title: `${name} Citation Drop (${m.trendDeltaPercent}%)`,
        description: `Citation rate on ${name} fell to ${m.citationRatePercent}% (${m.trendDeltaPercent}% vs 7-day baseline).`,
        metric: `${m.citationRatePercent}% citation rate`,
        delta: m.trendDeltaPercent,
      });
    }
  }

  // Check passage citability gap
  const totalTargetCitations = citations.filter((c) => c.isTargetBrand).length;
  if (targetMentionsCount > 0 && totalTargetCitations === 0) {
    profoundAlerts.push({
      id: "alert-passage-citability",
      type: "opportunity",
      severity: "info",
      title: "Passage Citability Opportunity",
      description: `${config.brandName} is recognized in AI answers, but no source links point to ${config.domain}. Add entity definition schema and concise, factual Q&A blocks to get cited.`,
    });
  }

  // Check competitor threat
  const topCompetitor = competitorRankings.find((c) => !c.isTargetBrand);
  if (topCompetitor && topCompetitor.visibilityPct >= 40) {
    profoundAlerts.push({
      id: `alert-comp-${topCompetitor.domain}`,
      type: "competitor_threat",
      severity: "warning",
      title: `Competitor Threat: ${topCompetitor.brandName}`,
      description: `${topCompetitor.brandName} (${topCompetitor.domain}) captures ${topCompetitor.visibilityPct}% AI visibility across your tracked prompts.`,
      metric: `${topCompetitor.visibilityPct}% visibility`,
    });
  }

  // 3. Winning vs Failing / Gap Prompts (Profound Pillar 2: /seo profound prompts <brand>)
  const winningPrompts: ProfoundPromptDiagnostic[] = [];
  const gapPrompts: ProfoundPromptDiagnostic[] = [];

  for (const p of promptsList) {
    const obsForPrompt = successfulObservations.filter(
      (o) =>
        o.promptId === p.id ||
        o.prompt.toLowerCase().trim() === p.prompt.toLowerCase().trim(),
    );

    const modelsSurfaced = new Set<AiTrackingPlatform>();
    const competitorsCited = new Set<string>();
    let hasDomainCitation = false;
    let isWinning = false;
    let bestPos: number | null = null;
    let lastCheckedAt: string | null = null;

    for (const obs of obsForPrompt) {
      if (!lastCheckedAt || obs.observedAt > lastCheckedAt) {
        lastCheckedAt = obs.observedAt;
      }
      const obsMentions = mentionsByObs.get(obs.id) ?? [];
      const tm = obsMentions.find((m) => m.isTargetBrand);
      const obsCits = citationsByObs.get(obs.id) ?? [];
      const tc = obsCits.find((c) => c.isTargetBrand);

      if (tc) hasDomainCitation = true;
      if (tm || tc) {
        isWinning = true;
        modelsSurfaced.add(obs.platform as AiTrackingPlatform);
        if (
          tm?.position != null &&
          (bestPos == null || tm.position < bestPos)
        ) {
          bestPos = tm.position;
        }
      }

      for (const m of obsMentions) {
        if (!m.isTargetBrand) {
          competitorsCited.add(m.brandName || m.domain);
        }
      }
      for (const c of obsCits) {
        if (!c.isTargetBrand) {
          competitorsCited.add(c.domain);
        }
      }
    }

    const diag: ProfoundPromptDiagnostic = {
      id: p.id,
      prompt: p.prompt,
      isWinning,
      position: bestPos,
      modelsSurfaced: Array.from(modelsSurfaced),
      competitorsCited: Array.from(competitorsCited),
      hasDomainCitation,
      lastCheckedAt,
    };

    if (isWinning) {
      winningPrompts.push(diag);
    } else {
      gapPrompts.push(diag);
    }
  }

  const sortedWinningPrompts = winningPrompts.toSorted((a, b) => {
    if (a.position != null && b.position != null)
      return a.position - b.position;
    if (a.position != null) return -1;
    if (b.position != null) return 1;
    return b.modelsSurfaced.length - a.modelsSurfaced.length;
  });

  const sortedGapPrompts = gapPrompts.toSorted(
    (a, b) => b.competitorsCited.length - a.competitorsCited.length,
  );

  // 4. Co-Cited Competitors (Profound Pillar 3: /seo profound competitors <brand>)
  const targetObsIds = new Set<string>();
  for (const obs of successfulObservations) {
    const hasMention = (mentionsByObs.get(obs.id) ?? []).some(
      (m) => m.isTargetBrand,
    );
    const hasCit = (citationsByObs.get(obs.id) ?? []).some(
      (c) => c.isTargetBrand,
    );
    if (hasMention || hasCit) {
      targetObsIds.add(obs.id);
    }
  }

  const coCitationMap = new Map<
    string,
    { brandName: string; coCitationCount: number; standaloneWins: number }
  >();

  for (const obs of successfulObservations) {
    const isTargetPresent = targetObsIds.has(obs.id);
    const obsMentions = mentionsByObs.get(obs.id) ?? [];
    const obsCits = citationsByObs.get(obs.id) ?? [];

    const presentCompetitors = new Map<string, string>();
    for (const m of obsMentions) {
      if (!m.isTargetBrand) {
        presentCompetitors.set(m.domain.toLowerCase(), m.brandName);
      }
    }
    for (const c of obsCits) {
      if (!c.isTargetBrand) {
        const domain = c.domain.toLowerCase();
        if (!presentCompetitors.has(domain)) {
          presentCompetitors.set(domain, c.title || domain);
        }
      }
    }

    for (const [dom, name] of presentCompetitors.entries()) {
      const curr = coCitationMap.get(dom) ?? {
        brandName: name,
        coCitationCount: 0,
        standaloneWins: 0,
      };
      if (isTargetPresent) {
        curr.coCitationCount++;
      } else {
        curr.standaloneWins++;
      }
      coCitationMap.set(dom, curr);
    }
  }

  const coCitedCompetitors: CoCitedCompetitor[] = Array.from(
    coCitationMap.entries(),
  )
    .map(([domain, data]) => ({
      domain,
      brandName: data.brandName,
      coCitationCount: data.coCitationCount,
      coCitationRate:
        targetObsIds.size > 0
          ? Math.round((data.coCitationCount / targetObsIds.size) * 100)
          : 0,
      standaloneWins: data.standaloneWins,
    }))
    .toSorted(
      (a, b) =>
        b.coCitationCount - a.coCitationCount ||
        b.standaloneWins - a.standaloneWins,
    );

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
    llmMetrics,
    profoundAlerts,
    promptDiagnostics: {
      winning: sortedWinningPrompts,
      gaps: sortedGapPrompts,
    },
    coCitedCompetitors,
    lastRun: latestRun,
  };
}
