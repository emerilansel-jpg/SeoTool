import {
  asRecord,
  readCollection,
  readNumber,
  readString,
  readValue,
} from "./reportDataCore";
import {
  comparison,
  derivedCompleteness,
  completeness,
  trendLabel,
} from "./reportModelHelpers";

// ---------------------------------------------------------------------------
// GMB Grid
// ---------------------------------------------------------------------------

export function buildGmbGridModel(source: unknown) {
  const trend = readCollection(source, [
    "trend",
    "trends",
    "history",
    "scanTrend",
    "timeSeries",
    "runs",
  ]);
  const rows = readCollection(source, [
    "keywordLocations",
    "keywordLocationRows",
    "breakdown",
    "rows",
    "items",
    "configs",
    "runs",
  ]);
  return {
    totalScans: readNumber(source, [
      "summary.totalScans",
      "totalScans",
      "scanCount",
      "current.runsCount",
      "runs.length",
    ]),
    metrics: {
      solv: comparison(source, ["solv", "shareOfLocalVoice", "avgSolv"]),
      averageRank: comparison(source, ["averageRank", "avgRank"]),
      top3: {
        current:
          comparison(source, ["top3", "top3Count", "top3Percent"]).current ??
          (rows.length
            ? rows.reduce((s, r) => s + (readNumber(r, ["top3"]) ?? 0), 0)
            : undefined),
        previous: comparison(source, ["top3", "top3Count", "top3Percent"])
          .previous,
      },
      top10: {
        current:
          comparison(source, ["top10", "top10Count", "top10Percent"]).current ??
          (rows.length
            ? rows.reduce((s, r) => s + (readNumber(r, ["top10"]) ?? 0), 0)
            : undefined),
        previous: comparison(source, ["top10", "top10Count", "top10Percent"])
          .previous,
      },
      top20: {
        current:
          comparison(source, ["top20", "top20Count", "top20Percent"]).current ??
          (rows.length
            ? rows.reduce((s, r) => s + (readNumber(r, ["top20"]) ?? 0), 0)
            : undefined),
        previous: comparison(source, ["top20", "top20Count", "top20Percent"])
          .previous,
      },
      cost: comparison(source, [
        "cost",
        "costUsd",
        "actualCostUsd",
        "totalCostUsd",
      ]),
    },
    trend: trend.map((row, index) => ({
      label: trendLabel(row, index),
      solv: readNumber(row, ["solv", "shareOfLocalVoice", "metrics.solv"]),
      averageRank: readNumber(row, [
        "averageRank",
        "avgRank",
        "metrics.averageRank",
      ]),
      top3: readNumber(row, ["top3", "top3Count"]),
      top10: readNumber(row, ["top10", "top10Count"]),
      top20: readNumber(row, ["top20", "top20Count"]),
      cost: readNumber(row, ["cost", "costUsd", "actualCostUsd"]),
    })),
    keywordLocations: rows.map((row, index) => ({
      keyword:
        readString(row, ["keyword", "query", "term"]) ?? `Keyword ${index + 1}`,
      location:
        readString(row, [
          "location",
          "locationName",
          "address",
          "businessName",
        ]) ?? "N/A",
      scans: readNumber(row, [
        "scans",
        "totalScans",
        "scanCount",
        "totalPoints",
      ]),
      solv: readNumber(row, ["solv", "shareOfLocalVoice", "latestRun.solv"]),
      averageRank: readNumber(row, [
        "averageRank",
        "avgRank",
        "latestRun.averageRank",
      ]),
    })),
    completeness:
      completeness(source) ??
      derivedCompleteness(
        source,
        ["completedScans", "completedPoints", "summary.completed"],
        ["totalScans", "totalPoints", "summary.total"],
      ),
  };
}

// ---------------------------------------------------------------------------
// Brand Lookup
// ---------------------------------------------------------------------------

export function buildBrandLookupModel(source: unknown) {
  const platforms = readCollection(source, [
    "perPlatform",
    "platformBreakdown",
    "platforms",
    "byPlatform",
    "current.platformTrends",
  ]);
  const platformTrend = readCollection(source, [
    "platformTrend",
    "monthlyVolume",
    "volumeTrend",
    "trend",
    "snapshots",
  ]);
  const sovEntries = readCollection(source, [
    "shareOfVoice.entries",
    "sov.entries",
    "sovEntries",
    "shareOfVoice",
    "current.sovEntries",
  ]);
  const sovTrend = readCollection(source, [
    "shareOfVoice.trend",
    "sov.trend",
    "sovTrend",
    "shareOfVoiceTrend",
  ]);
  const successful = platforms.filter(
    (row) => readString(row, ["status"]) !== "error",
  ).length;
  const completeValue =
    completeness(source) ??
    (platforms.length
      ? {
          label: "Platform coverage",
          detail: `${successful} of ${platforms.length} platforms available`,
          percent: (successful / platforms.length) * 100,
        }
      : undefined);
  return {
    target: readString(source, [
      "resolvedTarget",
      "target",
      "query",
      "brand",
      "latestTarget.query",
      "latestTarget.targetValue",
    ]),
    totalMentions: readNumber(source, [
      "totalMentions",
      "summary.totalMentions",
      "mentions",
      "current.avgTotalMentions",
    ]),
    searchVolume: readNumber(source, [
      "totalAiSearchVolume",
      "searchVolume",
      "summary.searchVolume",
      "current.avgTotalAiSearchVolume",
    ]),
    freshness: readString(source, [
      "fetchedAt",
      "freshness",
      "lastUpdatedAt",
      "generatedAt",
      "dataFreshness.lastFetchedAt",
      "latestTarget.fetchedAt",
    ]),
    platforms: platforms.map((row) => {
      const points = readCollection(row, ["points"]);
      const latestPoint = points[points.length - 1];
      return {
        platform: readString(row, ["platform", "name", "label", "__key"]),
        status: readString(row, ["status"]),
        mentions: readNumber(row, [
          "mentions",
          "totalMentions",
          "latestMentions",
          "avgMentions",
        ]),
        searchVolume:
          readNumber(row, [
            "aiSearchVolume",
            "searchVolume",
            "volume",
          ]) ??
          (latestPoint
            ? readNumber(latestPoint, ["aiSearchVolume", "searchVolume"])
            : undefined),
      };
    }),
    platformTrend: platformTrend.map((row, index) => ({
      label: trendLabel(row, index),
      platform: readString(row, ["platform", "name"]),
      mentions: readNumber(row, ["mentions", "totalMentions"]),
      searchVolume: readNumber(row, [
        "aiSearchVolume",
        "searchVolume",
        "volume",
        "totalAiSearchVolume",
      ]),
    })),
    sovEntries: sovEntries.map((row, index) => ({
      label:
        readString(row, ["label", "brand", "name", "domain", "__key"]) ??
        `Entry ${index + 1}`,
      isTarget: readValue(row, ["isTarget"]) === true,
      mentions: readNumber(row, ["mentions", "totalMentions"]),
      share: readNumber(row, ["sharePct", "share", "shareOfVoice", "sov"]),
    })),
    sovTrend: sovTrend.map((row, index) => ({
      label: trendLabel(row, index),
      target: readString(row, ["target", "brand", "name"]),
      share: readNumber(row, [
        "sharePct",
        "share",
        "shareOfVoice",
        "sov",
        "value",
      ]),
    })),
    completeness: completeValue,
  };
}

// ---------------------------------------------------------------------------
// AI Tracking
// ---------------------------------------------------------------------------

export function buildAiTrackingModel(source: unknown) {
  const platforms = readCollection(source, [
    "perPlatform",
    "platformBreakdown",
    "byPlatform",
    "platforms",
  ]);
  const competitors = readCollection(source, [
    "competitors",
    "competitorRankings",
    "shareOfVoice",
  ]);
  const pages = readCollection(source, [
    "topCitedPages",
    "citedPages",
    "topPages",
    "citations.pages",
  ]);
  const movers = readCollection(source, [
    "promptMovers",
    "movers",
    "topMovers",
    "promptChanges",
  ]);
  const sentimentRecord = asRecord(
    readValue(source, ["sentiment", "sentimentBreakdown"]),
  );
  const sentimentRows = readCollection(source, [
    "sentiment.entries",
    "sentimentBreakdown.entries",
  ]);
  const sentiment = sentimentRows.length
    ? sentimentRows.map((row) => ({
        label:
          readString(row, ["label", "sentiment", "name", "__key"]) ?? "Unknown",
        count: readNumber(row, ["count", "mentions", "value"]),
        percent: readNumber(row, ["percent", "percentage", "share"]),
      }))
    : ["positive", "mixed", "neutral", "negative"].flatMap((label) => {
        const count = readNumber(sentimentRecord, [label]);
        const percent = readNumber(sentimentRecord, [`${label}Percent`]);
        return count === undefined && percent === undefined
          ? []
          : [{ label, count, percent }];
      });
  return {
    target: readString(source, [
      "target",
      "brandName",
      "config.brandName",
      "domain",
      "config.domain",
    ]),
    metrics: {
      visibility: comparison(
        source,
        ["visibilityScore", "visibility", "avgVisibilityScore"],
        ["kpi.visibilityScore"],
      ),
      mentionRate: comparison(
        source,
        ["mentionRate", "mentionCoveragePercent", "avgMentionRate"],
        ["kpi.mentionCoveragePercent"],
      ),
      citationRate: comparison(source, [
        "citationRate",
        "citationCoveragePercent",
        "avgCitationRate",
      ]),
      shareOfVoice: comparison(source, [
        "shareOfVoice",
        "sov",
        "avgShareOfVoice",
      ]),
    },
    platforms: platforms.map((row) => ({
      platform: readString(row, ["platform", "name", "label", "__key"]),
      visibility: readNumber(row, ["visibilityScore", "visibility"]),
      mentionRate: readNumber(row, [
        "mentionRate",
        "mentionCoveragePercent",
        "mentionRatePct",
      ]),
      citationRate: readNumber(row, [
        "citationRate",
        "citationCoveragePercent",
      ]),
      shareOfVoice: readNumber(row, ["shareOfVoice", "sov"]),
    })),
    sentiment,
    competitors: competitors.map((row, index) => ({
      label:
        readString(row, ["brandName", "label", "name", "domain", "__key"]) ??
        `Competitor ${index + 1}`,
      mentions: readNumber(row, ["mentions", "mentionsCount", "mentionCount"]),
      visibility: readNumber(row, [
        "visibility",
        "visibilityPct",
        "visibilityScore",
      ]),
      shareOfVoice: readNumber(row, ["shareOfVoice", "sharePct", "sov"]),
      position: readNumber(row, ["averagePosition", "avgPosition", "position"]),
    })),
    topCitedPages: pages.map((row) => ({
      page:
        readString(row, ["title", "url", "page", "domain"]) ?? "Unknown page",
      domain: readString(row, ["domain", "hostname"]),
      citations: readNumber(row, [
        "citations",
        "citationCount",
        "count",
        "frequency",
      ]),
      mentions: readNumber(row, ["mentions", "mentionCount"]),
    })),
    promptMovers: movers.map((row) => {
      const numericChange = readNumber(row, ["change", "delta", "movement"]);
      return {
        prompt:
          readString(row, ["prompt", "query", "question", "label"]) ??
          "Unknown prompt",
        platform: readString(row, ["platform"]),
        current: readNumber(row, ["current", "currentPosition", "position"]),
        previous: readNumber(row, ["previous", "previousPosition"]),
        change:
          numericChange !== undefined
            ? numericChange
            : readString(row, ["change", "status"]),
      };
    }),
    completeness:
      completeness(source) ??
      derivedCompleteness(
        source,
        ["completed", "promptsCompleted", "lastRun.promptsCompleted"],
        ["total", "promptsTotal", "lastRun.promptsTotal"],
      ),
  };
}
