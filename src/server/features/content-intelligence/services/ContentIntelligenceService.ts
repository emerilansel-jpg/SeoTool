import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditPages } from "@/db/schema";
import { AuditRepository } from "@/server/features/audit/repositories/AuditRepository";
import {
  scoreContent,
  type ContentFlag,
  type ContentScoreInput,
} from "@/server/features/content-intelligence/contentScore";
import {
  ContentScoreRepository,
  type InsertContentScore,
} from "@/server/features/content-intelligence/repositories/ContentScoreRepository";
import {
  PageEntityRepository,
  type InsertPageEntity,
} from "@/server/features/content-intelligence/repositories/PageEntityRepository";
import {
  extractEntities,
  isOpenRouterAvailable,
  type ExtractedEntity,
  type ExtractedTopic,
} from "@/server/features/content-intelligence/entityExtraction";
import { AppError } from "@/server/lib/errors";

// Only the content signals needed by the scoring engine. Queried explicitly
// (rather than select()) to mirror AuditRepository.getPagesForAudit and keep
// the payload small.
type ScoreablePage = {
  id: string;
  url: string;
  fetchClass: "ok" | "blocked" | "error";
  wordCount: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  headingOrderJson: string | null;
  title: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  imagesTotal: number;
  imagesMissingAlt: number;
  internalLinkCount: number;
  externalLinkCount: number;
  hasStructuredData: boolean;
  isIndexable: boolean;
  canonicalUrl: string | null;
  robotsMeta: string | null;
};

/** Score every successfully-fetched page of an audit and persist the results.
 *  Called by the audit workflow's content-scoring phase. Idempotent: re-runs
 *  replace the audit's scores. */
async function computeScoresForAudit(
  auditId: string,
): Promise<{ scored: number }> {
  const pages = await db
    .select({
      id: auditPages.id,
      url: auditPages.url,
      fetchClass: auditPages.fetchClass,
      wordCount: auditPages.wordCount,
      h1Count: auditPages.h1Count,
      h2Count: auditPages.h2Count,
      h3Count: auditPages.h3Count,
      h4Count: auditPages.h4Count,
      h5Count: auditPages.h5Count,
      h6Count: auditPages.h6Count,
      headingOrderJson: auditPages.headingOrderJson,
      title: auditPages.title,
      metaDescription: auditPages.metaDescription,
      ogTitle: auditPages.ogTitle,
      ogDescription: auditPages.ogDescription,
      imagesTotal: auditPages.imagesTotal,
      imagesMissingAlt: auditPages.imagesMissingAlt,
      internalLinkCount: auditPages.internalLinkCount,
      externalLinkCount: auditPages.externalLinkCount,
      hasStructuredData: auditPages.hasStructuredData,
      isIndexable: auditPages.isIndexable,
      canonicalUrl: auditPages.canonicalUrl,
      robotsMeta: auditPages.robotsMeta,
    })
    .from(auditPages)
    .where(eq(auditPages.auditId, auditId));

  // Blocked/error fetches have no content to evaluate; they are surfaced
  // separately in the audit UI. Redirects may carry wordCount 0 and are
  // scored (accurately flagging "no content").
  const rows = pages
    .filter((page) => page.fetchClass === "ok")
    .map((page) => toInsertRow(auditId, page));

  await ContentScoreRepository.replaceForAudit(auditId, rows);
  return { scored: rows.length };
}

function toInsertRow(auditId: string, page: ScoreablePage): InsertContentScore {
  const result = scoreContent(toScoreInput(page));
  return {
    id: crypto.randomUUID(),
    auditId,
    pageId: page.id,
    url: page.url,
    score: result.score,
    depthScore: result.subScores.depth,
    headingsScore: result.subScores.headings,
    metadataScore: result.subScores.metadata,
    mediaScore: result.subScores.media,
    linkingScore: result.subScores.linking,
    technicalScore: result.subScores.technical,
    flagsJson: JSON.stringify(result.flags),
    wordCount: page.wordCount,
  };
}

function toScoreInput(page: ScoreablePage): ContentScoreInput {
  const noindex = /noindex/i.test(page.robotsMeta ?? "");
  return {
    wordCount: page.wordCount,
    h1Count: page.h1Count,
    h2Count: page.h2Count,
    h3Count: page.h3Count,
    headingOrder: parseHeadingOrder(page.headingOrderJson),
    title: page.title,
    metaDescription: page.metaDescription,
    hasOgTitle: Boolean(page.ogTitle),
    hasOgDescription: Boolean(page.ogDescription),
    imagesTotal: page.imagesTotal,
    imagesMissingAlt: page.imagesMissingAlt,
    internalLinkCount: page.internalLinkCount,
    externalLinkCount: page.externalLinkCount,
    hasStructuredData: page.hasStructuredData,
    // Fold an explicit robots noindex into the indexability flag so it always
    // scores as non-indexable, regardless of how the crawler derived the flag.
    isIndexable: page.isIndexable && !noindex,
    hasCanonical: Boolean(page.canonicalUrl),
  };
}

function parseHeadingOrder(json: string | null): number[] | null {
  if (!json) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  return parsed.filter((n): n is number => typeof n === "number");
}

/** A client-facing content score: flags parsed from JSON, no internal columns. */
type ContentScoreView = {
  id: string;
  pageId: string;
  url: string;
  score: number;
  depthScore: number;
  headingsScore: number;
  metadataScore: number;
  mediaScore: number;
  linkingScore: number;
  technicalScore: number;
  flags: ContentFlag[];
  wordCount: number;
};

/** Return all content scores for an audit. Ownership is verified against the
 *  project; the client derives averages and distribution from the list. */
async function getScoresForAudit(
  auditId: string,
  projectId: string,
): Promise<{ scores: ContentScoreView[] }> {
  const audit = await AuditRepository.getAuditForProject(auditId, projectId);
  if (!audit)
    throw new AppError("NOT_FOUND", "Audit not found in this project.");

  const rows = await ContentScoreRepository.listForAudit(auditId);
  return {
    scores: rows.map((row) => ({
      id: row.id,
      pageId: row.pageId,
      url: row.url,
      score: row.score,
      depthScore: row.depthScore,
      headingsScore: row.headingsScore,
      metadataScore: row.metadataScore,
      mediaScore: row.mediaScore,
      linkingScore: row.linkingScore,
      technicalScore: row.technicalScore,
      flags: parseFlags(row.flagsJson),
      wordCount: row.wordCount,
    })),
  };
}

function parseFlags(json: string): ContentFlag[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is ContentFlag => isContentFlag(item));
}

// Type guard using `in` checks avoids unsafe `as` assertions on JSON input.
function isContentFlag(item: unknown): item is ContentFlag {
  if (typeof item !== "object" || item === null) return false;
  return (
    "severity" in item &&
    typeof item.severity === "string" &&
    "code" in item &&
    typeof item.code === "string" &&
    "message" in item &&
    typeof item.message === "string"
  );
}

/** Aggregated content-quality summary for an audit. Used by the dashboard
 *  card, the Custom Reports "content" section, and the MCP tool. */
type ContentSummary = {
  auditId: string;
  averageScore: number;
  total: number;
  distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  // Worst pages (lowest scores), worst-first.
  worstPages: Array<{ url: string; score: number; wordCount: number }>;
};

function computeSummary(
  auditId: string,
  rows: Array<{ url: string; score: number; wordCount: number }>,
): ContentSummary {
  const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
  let total = 0;
  for (const row of rows) {
    total += row.score;
    if (row.score >= 90) distribution.excellent += 1;
    else if (row.score >= 70) distribution.good += 1;
    else if (row.score >= 50) distribution.fair += 1;
    else distribution.poor += 1;
  }
  return {
    auditId,
    averageScore: rows.length > 0 ? Math.round(total / rows.length) : 0,
    total: rows.length,
    distribution,
    worstPages: rows.slice(0, 5),
  };
}

/** Summary for a specific audit. Ownership verified against the project. */
async function getSummaryForAudit(
  auditId: string,
  projectId: string,
): Promise<ContentSummary | null> {
  const audit = await AuditRepository.getAuditForProject(auditId, projectId);
  if (!audit)
    throw new AppError("NOT_FOUND", "Audit not found in this project.");

  const rows = await ContentScoreRepository.listScoreRowsForAudit(auditId);
  if (rows.length === 0) return null;
  return computeSummary(auditId, rows);
}

/** Summary for the project's most recent completed audit. Returns null when
 *  the project has no completed audit or no scored pages yet. */
async function getSummaryForProject(
  projectId: string,
): Promise<ContentSummary | null> {
  const latest =
    await AuditRepository.getLatestCompletedAuditForProject(projectId);
  if (!latest) return null;
  const rows = await ContentScoreRepository.listScoreRowsForAudit(latest.id);
  if (rows.length === 0) return null;
  return computeSummary(latest.id, rows);
}

// --- Entity extraction (LLM via OpenRouter) ---

/** Max concurrent LLM calls per batch. Controls cost and avoids rate limits. */
const ENTITY_BATCH_SIZE = 5;

type ExtractedPageEntity = InsertPageEntity & {
  entityCount: number;
  topicCount: number;
};

/** Client-facing page entity view: JSON fields parsed into typed arrays. */
export type PageEntityView = {
  id: string;
  pageId: string;
  url: string;
  entities: ExtractedEntity[];
  topics: ExtractedTopic[];
  extractedAt: string;
};

/**
 * Extract entities and topics from every page of an audit that has body text.
 * Called by the audit workflow's entity-extraction phase. Best-effort: if
 * OpenRouter is not configured, the phase is silently skipped. Per-page LLM
 * failures are logged and skipped without aborting the phase.
 *
 * Idempotent: re-runs replace the audit's entities (delete-then-insert).
 */
async function extractEntitiesForAudit(
  auditId: string,
): Promise<{ extracted: number }> {
  if (!(await isOpenRouterAvailable())) {
    console.warn(
      `Entity extraction skipped for audit ${auditId}: OPENROUTER_API_KEY not set.`,
    );
    return { extracted: 0 };
  }

  const pages = await db
    .select({
      id: auditPages.id,
      url: auditPages.url,
      bodyText: auditPages.bodyText,
    })
    .from(auditPages)
    .where(eq(auditPages.auditId, auditId));

  const eligible = pages.filter(
    (page) => page.bodyText && page.bodyText.trim().length > 0,
  );
  if (eligible.length === 0) {
    await PageEntityRepository.clearForAudit(auditId);
    return { extracted: 0 };
  }

  const results: ExtractedPageEntity[] = [];
  let totalCostUsd = 0;

  // Process in batches of ENTITY_BATCH_SIZE for concurrency control.
  for (let i = 0; i < eligible.length; i += ENTITY_BATCH_SIZE) {
    const batch = eligible.slice(i, i + ENTITY_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (page) => {
        try {
          const result = await extractEntities(page.bodyText!);
          totalCostUsd += result.costUsd;
          return {
            id: crypto.randomUUID(),
            auditId,
            pageId: page.id,
            url: page.url,
            entitiesJson: JSON.stringify(result.entities),
            topicsJson: JSON.stringify(result.topics),
            entityCount: result.entities.length,
            topicCount: result.topics.length,
          };
        } catch (error) {
          console.warn(`Entity extraction failed for ${page.url}:`, error);
          return null;
        }
      }),
    );
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  await PageEntityRepository.replaceForAudit(auditId, results);
  if (totalCostUsd > 0) {
    console.info(
      `Entity extraction for audit ${auditId}: ${results.length} pages, $${totalCostUsd.toFixed(4)} LLM cost.`,
    );
  }
  return { extracted: results.length };
}

/** Return all page entities for an audit. Ownership verified against the
 *  project. JSON fields are parsed into typed arrays for the client. */
async function getEntitiesForAudit(
  auditId: string,
  projectId: string,
): Promise<{ entities: PageEntityView[] }> {
  const audit = await AuditRepository.getAuditForProject(auditId, projectId);
  if (!audit)
    throw new AppError("NOT_FOUND", "Audit not found in this project.");

  const rows = await PageEntityRepository.listForAudit(auditId);
  return {
    entities: rows.map((row) => ({
      id: row.id,
      pageId: row.pageId,
      url: row.url,
      entities: parseEntities(row.entitiesJson),
      topics: parseTopics(row.topicsJson),
      extractedAt: row.extractedAt,
    })),
  };
}

function isExtractedEntity(item: unknown): item is ExtractedEntity {
  if (typeof item !== "object" || item === null) return false;
  return (
    "name" in item &&
    typeof item.name === "string" &&
    "type" in item &&
    typeof item.type === "string" &&
    "relevance" in item &&
    typeof item.relevance === "number"
  );
}

function isExtractedTopic(item: unknown): item is ExtractedTopic {
  if (typeof item !== "object" || item === null) return false;
  return (
    "topic" in item &&
    typeof item.topic === "string" &&
    "confidence" in item &&
    typeof item.confidence === "number"
  );
}

function parseEntities(json: string): ExtractedEntity[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is ExtractedEntity =>
    isExtractedEntity(item),
  );
}

function parseTopics(json: string): ExtractedTopic[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is ExtractedTopic =>
    isExtractedTopic(item),
  );
}

export const ContentIntelligenceService = {
  computeScoresForAudit,
  getScoresForAudit,
  getSummaryForAudit,
  getSummaryForProject,
  extractEntitiesForAudit,
  getEntitiesForAudit,
};
