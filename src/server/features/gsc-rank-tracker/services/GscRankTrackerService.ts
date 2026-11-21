import { generateText } from "ai";
import {
  GscRankTrackerRepository,
  type SyncKeywordRow,
} from "../repositories/GscRankTrackerRepository";
import { GscConnectionRepository } from "@/server/features/gsc/repositories/GscConnectionRepository";
import { GscNotConnectedError } from "@/server/features/gsc/services/GscService";
import {
  createGscClient,
  GscTokenError,
  type GscSearchAnalyticsRequest,
} from "@/server/lib/gscClient";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { AppError } from "@/server/lib/errors";

// GSC performance data trails by ~3 days; the sync never chases fresher data
// because positions for the newest days are incomplete.
const GSC_DATA_LAG_DAYS = 3;
const GSC_SYNC_PAGE_SIZE = 25_000;
const BACKFILL_WINDOW_DAYS = 30;

type GscQueryRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

async function fetchAllRows(
  client: ReturnType<typeof createGscClient>,
  siteUrl: string,
  request: GscSearchAnalyticsRequest,
): Promise<GscQueryRow[]> {
  const rows: GscQueryRow[] = [];
  let startRow = 0;
  for (;;) {
    const page = await client.querySearchAnalytics(siteUrl, {
      ...request,
      rowLimit: GSC_SYNC_PAGE_SIZE,
      startRow: startRow > 0 ? startRow : undefined,
    });
    rows.push(...page);
    if (page.length < GSC_SYNC_PAGE_SIZE) break;
    startRow += GSC_SYNC_PAGE_SIZE;
    // Hard stop so a pathological property can't loop forever.
    if (startRow > 100_000) break;
  }
  return rows;
}

function dayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Rows keyed ["date","query"]: metrics per keyword per day. */
function rowsToKeywordDays(rows: GscQueryRow[]): SyncKeywordRow[] {
  const out: SyncKeywordRow[] = [];
  for (const row of rows) {
    const [day, keyword] = row.keys ?? [];
    if (!day || !keyword) continue;
    out.push({
      keyword,
      day,
      position: row.position > 0 ? row.position : null,
      impressions: row.impressions,
      clicks: row.clicks,
      url: null,
    });
  }
  return out;
}

/** Rows keyed ["query","page"]: best URL per query over the range. */
function rowsToTopUrls(rows: GscQueryRow[]): Map<string, string> {
  const best = new Map<string, { url: string; impressions: number }>();
  for (const row of rows) {
    const [keyword, url] = row.keys ?? [];
    if (!keyword || !url) continue;
    const current = best.get(keyword);
    if (!current || row.impressions > current.impressions) {
      best.set(keyword, { url, impressions: row.impressions });
    }
  }
  return new Map([...best].map(([keyword, value]) => [keyword, value.url]));
}

function buildQueryRequest(
  startDate: string,
  endDate: string,
): GscSearchAnalyticsRequest {
  return {
    startDate,
    endDate,
    dimensions: ["date", "query"],
    type: "web",
    dataState: "all",
  };
}

function buildPageRequest(
  startDate: string,
  endDate: string,
): GscSearchAnalyticsRequest {
  return {
    startDate,
    endDate,
    dimensions: ["query", "page"],
    type: "web",
    dataState: "all",
  };
}

/** Fetch a [from,to] window from GSC and persist keyword + history rows. */
async function syncWindow(input: {
  projectId: string;
  organizationId: string;
  siteUrl: string;
  userId: string;
  gscAccountId?: string | null;
  fromDate: string;
  toDate: string;
}): Promise<{ keywordsTouched: number; historyRows: number }> {
  const client = createGscClient({
    userId: input.userId,
    gscAccountId: input.gscAccountId ?? undefined,
  });

  const [dayRows, pageRows] = await Promise.all([
    fetchAllRows(
      client,
      input.siteUrl,
      buildQueryRequest(input.fromDate, input.toDate),
    ),
    fetchAllRows(
      client,
      input.siteUrl,
      buildPageRequest(input.fromDate, input.toDate),
    ),
  ]);

  const topUrls = rowsToTopUrls(pageRows);
  const keywordDays = rowsToKeywordDays(dayRows).map((row) => ({
    ...row,
    url: topUrls.get(row.keyword) ?? null,
  }));

  const result = await GscRankTrackerRepository.syncKeywordDays(
    input.projectId,
    input.organizationId,
    keywordDays,
  );
  return {
    keywordsTouched: result.keywordsTouched,
    historyRows: result.historyRows,
  };
}

/** Incremental daily sync: everything from the last synced day up to
 *  (today - GSC lag). Called by the 15-min cron and the manual "Sync now". */
async function syncProject(projectId: string): Promise<{
  synced: boolean;
  keywordsTouched: number;
  historyRows: number;
  from: string | null;
  to: string | null;
}> {
  const connection = await GscConnectionRepository.getByProjectId(projectId);
  if (!connection) throw new GscNotConnectedError(projectId);

  const lastSyncedDay =
    await GscRankTrackerRepository.getLastSyncedDay(projectId);
  const today = new Date();
  const end = addDays(today, -GSC_DATA_LAG_DAYS);

  // First sync pulls the last 30 days as a baseline; users can extend via
  // the explicit 16-month backfill.
  const from = lastSyncedDay
    ? addDays(new Date(`${lastSyncedDay}T00:00:00.000Z`), 1)
    : addDays(today, -30);
  if (dayString(from) > dayString(end)) {
    return {
      synced: false,
      keywordsTouched: 0,
      historyRows: 0,
      from: null,
      to: null,
    };
  }

  const result = await syncWindow({
    projectId,
    organizationId: connection.organizationId,
    siteUrl: connection.siteUrl,
    userId: connection.connectedByUserId,
    gscAccountId: connection.gscAccountId,
    fromDate: dayString(from),
    toDate: dayString(end),
  });

  return {
    synced: true,
    keywordsTouched: result.keywordsTouched,
    historyRows: result.historyRows,
    from: dayString(from),
    to: dayString(end),
  };
}

/** Chunked historical backfill (client drives the window loop with progress).
 *  16 months × ~1 month window keeps each GSC request comfortably under the
 *  25k row ceiling for typical properties. */
async function backfillChunk(input: {
  projectId: string;
  fromDate: string;
  toDate: string;
}): Promise<{
  keywordsTouched: number;
  historyRows: number;
  fromDate: string;
  toDate: string;
}> {
  const connection = await GscConnectionRepository.getByProjectId(
    input.projectId,
  );
  if (!connection) throw new GscNotConnectedError(input.projectId);

  const fromDate = new Date(`${input.fromDate}T00:00:00.000Z`);
  const toDate = new Date(`${input.toDate}T00:00:00.000Z`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new AppError("VALIDATION_ERROR", "Invalid backfill dates.");
  }
  const windowDays =
    Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1;
  if (windowDays > BACKFILL_WINDOW_DAYS) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Backfill windows are capped at ${BACKFILL_WINDOW_DAYS} days per call.`,
    );
  }

  const result = await syncWindow({
    projectId: input.projectId,
    organizationId: connection.organizationId,
    siteUrl: connection.siteUrl,
    userId: connection.connectedByUserId,
    gscAccountId: connection.gscAccountId,
    fromDate: input.fromDate,
    toDate: input.toDate,
  });

  return { ...result, fromDate: input.fromDate, toDate: input.toDate };
}

// ---------------------------------------------------------------------------
// "Why did it move?"
// ---------------------------------------------------------------------------

export type MoveExplanation = {
  keyword: string;
  positionChange: number;
  periodStart: string;
  periodEnd: string;
  beforeUrl: string | null;
  afterUrl: string | null;
  urlChanged: boolean;
  cannibalization: boolean;
  explanation: string;
};

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Explain a keyword's position change between two 7-day windows: diff the
 *  winning URL (cannibalization detection) and ask the LLM for a one-liner. */
async function explainMove(input: {
  projectId: string;
  keyword: string;
  endDate?: string;
}): Promise<MoveExplanation> {
  const end = input.endDate
    ? new Date(`${input.endDate}T00:00:00.000Z`)
    : addDays(new Date(), -GSC_DATA_LAG_DAYS);
  const periodEnd = dayString(end);
  const periodStart = dayString(addDays(end, -7));

  const history = await GscRankTrackerRepository.getKeywordWithHistory({
    projectId: input.projectId,
    keyword: input.keyword,
    days: 60,
  });
  if (!history) {
    throw new AppError(
      "NOT_FOUND",
      "That keyword isn't tracked yet. Run a sync first.",
    );
  }

  const before = history.history.filter(
    (row) => row.day >= dayString(addDays(end, -14)) && row.day < periodStart,
  );
  const after = history.history.filter(
    (row) => row.day >= periodStart && row.day <= periodEnd,
  );

  const beforeAvg = average(
    before.map((r) => r.position).filter((p): p is number => p !== null),
  );
  const afterAvg = average(
    after.map((r) => r.position).filter((p): p is number => p !== null),
  );
  if (beforeAvg === null || afterAvg === null) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Not enough history to compare. Sync a few more days first.",
    );
  }

  const beforeUrl =
    before.map((r) => r.url).find((u): u is string => !!u) ?? null;
  const afterUrl =
    after.map((r) => r.url).findLast((u): u is string => !!u) ?? null;
  const urlChanged = !!beforeUrl && !!afterUrl && beforeUrl !== afterUrl;
  const beforeImpressions = before.reduce((sum, r) => sum + r.impressions, 0);
  const afterImpressions = after.reduce((sum, r) => sum + r.impressions, 0);

  const positionChange = Number((afterAvg - beforeAvg).toFixed(1));
  const direction =
    positionChange < 0 ? "improved" : positionChange > 0 ? "declined" : "flat";
  const cannibalization = urlChanged && positionChange > 0;

  let explanation: string;
  try {
    const model = await getChatAgentModel(history.keyword.organizationId);
    const prompt = [
      "You are an SEO analyst. Explain in ONE sentence (max 40 words) why this keyword's Google position changed.",
      `Keyword: "${input.keyword}"`,
      `Period compared: ${periodStart} (7 days before) vs ${periodStart}..${periodEnd}`,
      `Average position: ${beforeAvg.toFixed(1)} -> ${afterAvg.toFixed(1)} (${direction})`,
      `Daily impressions: ${beforeImpressions} -> ${afterImpressions}`,
      beforeUrl
        ? `Ranking URL before: ${beforeUrl}`
        : "Ranking URL before: unknown",
      afterUrl
        ? `Ranking URL after: ${afterUrl}`
        : "Ranking URL after: unknown",
      urlChanged
        ? "The ranking URL CHANGED between periods. If the position got worse, call it likely cannibalization/URL competition; if better, note the better page took over."
        : "Same ranking URL in both periods.",
      "Plain sentence, no bullet points, no preamble.",
    ].join("\n");
    const result = await generateText({ model, prompt, maxOutputTokens: 120 });
    explanation = result.text.trim();
  } catch (error) {
    console.error("[gsc-rank-tracker] LLM explanation failed:", error);
    explanation = urlChanged
      ? `Position moved from ${beforeAvg.toFixed(1)} to ${afterAvg.toFixed(1)} and the ranking URL changed${cannibalization ? " — likely multiple pages competing for this query" : ""}.`
      : `Position moved from ${beforeAvg.toFixed(1)} to ${afterAvg.toFixed(1)} with the same ranking page.`;
  }

  return {
    keyword: input.keyword,
    positionChange,
    periodStart,
    periodEnd,
    beforeUrl,
    afterUrl,
    urlChanged,
    cannibalization,
    explanation,
  };
}

/** Whether the project's stored GSC grant is usable (drives UI reconnect UX). */
async function verifyGrant(
  projectId: string,
): Promise<{ ok: boolean; error?: string }> {
  const connection = await GscConnectionRepository.getByProjectId(projectId);
  if (!connection) return { ok: false, error: "not_connected" };
  try {
    const client = createGscClient({
      userId: connection.connectedByUserId,
      gscAccountId: connection.gscAccountId ?? undefined,
    });
    await client.listSites();
    return { ok: true };
  } catch (error) {
    if (error instanceof GscTokenError)
      return { ok: false, error: "token_expired" };
    return { ok: false, error: "api_error" };
  }
}

export const GscRankTrackerService = {
  syncProject,
  backfillChunk,
  explainMove,
  verifyGrant,
  listKeywords: GscRankTrackerRepository.listKeywords,
  summarize: GscRankTrackerRepository.summarize,
  getKeywordWithHistory: GscRankTrackerRepository.getKeywordWithHistory,
  setKeywordStatus: GscRankTrackerRepository.setKeywordStatus,
};
