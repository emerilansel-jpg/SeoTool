import { createHash, randomBytes } from "node:crypto";
import {
  AiBotRepository,
  type AiBotSite,
  type NewAiBotHit,
} from "../repositories/AiBotRepository";
import {
  AI_BOTS,
  classifyUserAgent,
  ROBOTS_CHECK_BOTS,
  type AiBotCategory,
} from "@/shared/ai-bots";
import { AppError } from "@/server/lib/errors";
import { parseAccessLog, type ParsedLogEntry } from "./logParser";
import { parseRobotsForBot } from "./robotsParser";

const HITS_PER_IMPORT_CAP = 50_000;

/** Persisted robots.txt compliance result shape (ai_bot_sites.robots_compliance). */
export type RobotsCompliance = {
  checkedAt: string;
  groups: Array<{
    bot: string;
    uaToken: string;
    directive: "allowed" | "disallowed" | "not_mentioned";
  }>;
  fetchError?: string;
};

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function normalizeUrl(url: string, domain: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `https://${domain}${path}`;
}

async function ensureSite(input: {
  projectId: string;
  organizationId: string;
  domain: string;
}): Promise<AiBotSite> {
  const domain = normalizeDomain(input.domain);
  if (!domain) {
    throw new AppError("VALIDATION_ERROR", "A site domain is required.");
  }
  const existing = await AiBotRepository.getByProjectId(input.projectId);
  if (existing && existing.domain === domain) return existing;
  const token = existing?.ingestToken ?? randomBytes(24).toString("hex");
  return AiBotRepository.upsertSite({
    projectId: input.projectId,
    organizationId: input.organizationId,
    domain,
    ingestToken: token,
  });
}

async function rotateToken(projectId: string): Promise<string> {
  const existing = await AiBotRepository.getByProjectId(projectId);
  if (!existing) {
    throw new AppError("NOT_FOUND", "Connect a site first.");
  }
  const token = randomBytes(24).toString("hex");
  await AiBotRepository.upsertSite({
    projectId,
    organizationId: existing.organizationId,
    domain: existing.domain,
    ingestToken: token,
  });
  return token;
}

type IngestHitInput = {
  url: string;
  userAgent?: string | null;
  bot?: string | null;
  method?: string | null;
  statusCode?: number | null;
  at?: string | null;
  ip?: string | null;
};

/** Classify + persist a batch of hits from the on-site beacon. Returns how
 *  many rows were accepted and how many were dropped (unknown bot or bad URL). */
async function ingestHits(input: {
  site: Pick<AiBotSite, "projectId" | "organizationId" | "domain">;
  hits: IngestHitInput[];
  source: "ingest" | "log_upload";
}): Promise<{ accepted: number; rejected: number }> {
  const nowIso = new Date().toISOString();
  const rows: NewAiBotHit[] = [];
  let rejected = 0;

  for (const hit of input.hits.slice(0, 500)) {
    const botDef =
      classifyUserAgent(hit.userAgent) ??
      (hit.bot ? (AI_BOTS.find((b) => b.key === hit.bot) ?? null) : null);
    if (!botDef) {
      // Unknown/generic crawlers stay out of the AEO tables entirely.
      rejected += 1;
      continue;
    }
    const rawUrl = hit.url.trim();
    if (!rawUrl || rawUrl.length > 2048) {
      rejected += 1;
      continue;
    }
    const at = hit.at ? new Date(hit.at) : new Date(nowIso);
    if (Number.isNaN(at.getTime())) {
      rejected += 1;
      continue;
    }
    rows.push({
      projectId: input.site.projectId,
      organizationId: input.site.organizationId,
      bot: botDef.key,
      url: normalizeUrl(rawUrl, input.site.domain),
      userAgent: hit.userAgent?.slice(0, 512) ?? null,
      statusCode: typeof hit.statusCode === "number" ? hit.statusCode : null,
      ipHash: hit.ip
        ? createHash("sha256").update(hit.ip).digest("hex").slice(0, 16)
        : null,
      source: input.source,
      hitAt: at.toISOString(),
    });
  }

  const accepted = await AiBotRepository.insertHits(rows);
  if (rows.length > 0) {
    const lastHitAt = rows.reduce(
      (latest, row) => (row.hitAt > latest ? row.hitAt : latest),
      rows[0].hitAt,
    );
    await AiBotRepository.touchLastHit(input.site.projectId, lastHitAt);
  }
  return { accepted, rejected };
}

/** Parse an access-log file (Nginx/Apache combined or Cloudflare NDJSON),
 *  keep only crawler hits the AEO taxonomy knows, and store them. */
async function importAccessLog(input: {
  projectId: string;
  organizationId: string;
  domain: string;
  content: string;
}): Promise<{ accepted: number; skipped: number; truncated: boolean }> {
  const site = await ensureSite({
    projectId: input.projectId,
    organizationId: input.organizationId,
    domain: input.domain,
  });
  const parsed = parseAccessLog(input.content);
  const botRows: IngestHitInput[] = parsed.entries
    .filter(
      (entry: ParsedLogEntry) => classifyUserAgent(entry.userAgent) !== null,
    )
    .slice(0, HITS_PER_IMPORT_CAP)
    .map((entry: ParsedLogEntry) => ({
      url: entry.path,
      userAgent: entry.userAgent,
      method: entry.method,
      statusCode: entry.status,
      at: entry.at,
      ip: entry.ip,
    }));
  const result = await ingestHits({
    site,
    hits: botRows,
    source: "log_upload",
  });
  return {
    accepted: result.accepted,
    skipped: parsed.skipped + (parsed.entries.length - botRows.length),
    truncated: parsed.truncated,
  };
}

// ---------------------------------------------------------------------------
// robots.txt compliance
// ---------------------------------------------------------------------------

/** Fetch the site's robots.txt and evaluate AI bot access per group. */
async function checkRobotsCompliance(
  projectId: string,
): Promise<RobotsCompliance> {
  const site = await AiBotRepository.getByProjectId(projectId);
  if (!site) {
    throw new AppError("NOT_FOUND", "Connect a site first.");
  }
  const compliance: RobotsCompliance = {
    checkedAt: new Date().toISOString(),
    groups: [],
  };

  try {
    const response = await fetch(`https://${site.domain}/robots.txt`, {
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      compliance.fetchError = `robots.txt returned HTTP ${response.status}`;
    } else {
      const robotsTxt = await response.text();
      for (const bot of ROBOTS_CHECK_BOTS) {
        compliance.groups.push({
          bot: bot.key,
          uaToken: bot.uaToken,
          directive: parseRobotsForBot(robotsTxt, bot.uaToken),
        });
      }
    }
  } catch (error) {
    compliance.fetchError =
      error instanceof Error ? error.message : "robots.txt fetch failed";
  }

  await AiBotRepository.updateRobotsCompliance(
    projectId,
    JSON.stringify(compliance),
    compliance.checkedAt,
  );
  return compliance;
}

// ---------------------------------------------------------------------------
// Dashboard aggregation
// ---------------------------------------------------------------------------

export type AiBotDashboard = {
  site: {
    domain: string;
    ingestToken: string;
    lastHitAt: string | null;
    robotsCompliance: RobotsCompliance | null;
    robotsCheckedAt: string | null;
  } | null;
  windowDays: number;
  /** AI (any category) vs search-engine baseline hit counts. */
  aiHits: number;
  searchHits: number;
  perBot: Array<{
    key: string;
    label: string;
    operator: string;
    category: AiBotCategory;
    hits: number;
    uniqueUrls: number;
  }>;
  series: Array<{ day: string; bot: string; hits: number }>;
  topUrls: Array<{ url: string; hits: number; lastSeenAt: string }>;
  /** Pages from the latest completed audit the AI bots haven't crawled in the window. */
  stalePages: string[];
};

const DEFAULT_WINDOW_DAYS = 30;

function dayStartIso(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

async function buildDashboard(
  projectId: string,
  windowDays: number = DEFAULT_WINDOW_DAYS,
): Promise<AiBotDashboard> {
  const site = await AiBotRepository.getByProjectId(projectId);
  if (!site) {
    return {
      site: null,
      windowDays,
      aiHits: 0,
      searchHits: 0,
      perBot: [],
      series: [],
      topUrls: [],
      stalePages: [],
    };
  }

  const sinceIso = dayStartIso(windowDays);
  const [summaries, series, topUrls] = await Promise.all([
    AiBotRepository.summarizeSince(projectId, sinceIso),
    AiBotRepository.dailySeriesSince(projectId, sinceIso.slice(0, 10)),
    AiBotRepository.topUrlsSince(projectId, sinceIso, 20),
  ]);

  let aiHits = 0;
  let searchHits = 0;
  const perBot = summaries
    .map((summary) => {
      const def = AI_BOTS.find((b) => b.key === summary.bot);
      return {
        key: summary.bot,
        label: def?.label ?? summary.bot,
        operator: def?.operator ?? "Unknown",
        category: def?.category ?? ("ai_search" as AiBotCategory),
        hits: summary.hits,
        uniqueUrls: summary.uniqueUrls,
      };
    })
    .toSorted((a, b) => b.hits - a.hits);

  for (const bot of perBot) {
    if (bot.category === "search") searchHits += bot.hits;
    else aiHits += bot.hits;
  }

  // Stale pages: latest completed audit's pages minus URLs AI bots touched
  // inside the window. Search-engine crawls don't count as AI visibility.
  const stalePages = await collectStalePages(projectId, sinceIso);

  let robotsCompliance: RobotsCompliance | null = null;
  if (site.robotsCompliance) {
    try {
      robotsCompliance = JSON.parse(site.robotsCompliance) as RobotsCompliance;
    } catch {
      robotsCompliance = null;
    }
  }

  return {
    site: {
      domain: site.domain,
      ingestToken: site.ingestToken,
      lastHitAt: site.lastHitAt,
      robotsCompliance,
      robotsCheckedAt: site.robotsCheckedAt,
    },
    windowDays,
    aiHits,
    searchHits,
    perBot,
    series,
    topUrls,
    stalePages,
  };
}

async function collectStalePages(
  projectId: string,
  sinceIso: string,
): Promise<string[]> {
  const { AuditRepository } =
    await import("@/server/features/audit/repositories/AuditRepository");
  const audit =
    await AuditRepository.getLatestCompletedAuditForProject(projectId);
  if (!audit) return [];
  const pages = await AuditRepository.getPagesForAudit(audit.id);
  const aiBotKeys = AI_BOTS.filter((b) => b.category !== "search").map(
    (b) => b.key,
  );
  const crawled = await AiBotRepository.urlsCrawledByBotsSince(
    projectId,
    aiBotKeys,
    sinceIso,
  );
  return pages
    .map((page) => page.url)
    .filter((url) => !crawled.has(url))
    .slice(0, 100);
}

export const AiBotService = {
  ensureSite,
  rotateToken,
  ingestHits,
  importAccessLog,
  checkRobotsCompliance,
  buildDashboard,
  normalizeDomain,
};
