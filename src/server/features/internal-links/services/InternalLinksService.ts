import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gscTrackedKeywords } from "@/db/schema";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { AppError } from "@/server/lib/errors";
import {
  InternalLinksRepository,
  type InternalLinkSuggestion,
} from "../repositories/InternalLinksRepository";

// Quick-win window: GSC positions 4-20. Page 2-3 rankings convert best from
// new internal links; position 1-3 keywords are already won, >20 is too far.
const QUICK_WIN_MIN = 4;
const QUICK_WIN_MAX = 20;
const MAX_SUGGESTIONS_PER_RUN = 15;
const SOURCE_CANDIDATES_PER_KEYWORD = 2;

type AuditPageLite = {
  url: string;
  title: string | null;
  bodyText: string | null;
  wordCount: number;
};

/** Candidate pages whose body mentions the keyword, best first. */
export function pickSourcePages(
  pages: AuditPageLite[],
  keyword: string,
  targetUrl: string,
): AuditPageLite[] {
  const needle = keyword.toLowerCase();
  return pages
    .filter(
      (page) =>
        page.url !== targetUrl &&
        page.bodyText !== null &&
        page.bodyText.toLowerCase().includes(needle),
    )
    .toSorted((a, b) => b.wordCount - a.wordCount)
    .slice(0, SOURCE_CANDIDATES_PER_KEYWORD);
}

/** Generate internal-link suggestions from the latest completed audit and
 *  the project's GSC quick-win keywords. LLM proposes anchor + sentence. */
async function generateSuggestions(input: {
  projectId: string;
  organizationId: string;
  maxSuggestions?: number;
}): Promise<{ created: number; pairsConsidered: number }> {
  const { AuditRepository } =
    await import("@/server/features/audit/repositories/AuditRepository");
  const audit = await AuditRepository.getLatestCompletedAuditForProject(
    input.projectId,
  );
  if (!audit) {
    throw new AppError(
      "NOT_FOUND",
      "Run a completed Site Audit first - suggestions are built from audit body text.",
    );
  }
  const pages = await AuditRepository.getPagesForAudit(audit.id);

  const quickWins = await db
    .select({
      keyword: gscTrackedKeywords.keyword,
      position: gscTrackedKeywords.lastPosition,
      url: gscTrackedKeywords.lastUrl,
    })
    .from(gscTrackedKeywords)
    .where(
      and(
        eq(gscTrackedKeywords.projectId, input.projectId),
        eq(gscTrackedKeywords.status, "active"),
      ),
    );

  const candidates = quickWins
    .filter(
      (row) =>
        row.url !== null &&
        row.position !== null &&
        row.position >= QUICK_WIN_MIN &&
        row.position <= QUICK_WIN_MAX,
    )
    .toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .slice(0, 25);

  if (candidates.length === 0) {
    return { created: 0, pairsConsidered: 0 };
  }

  // Audit pages keyed by URL for title lookups (getPagesForAudit lacks body
  // text, so fetch the body from the crawl rows separately).
  const { auditPages } = await import("@/db/schema");
  const bodyRows = await db
    .select({
      url: auditPages.url,
      bodyText: auditPages.bodyText,
    })
    .from(auditPages)
    .where(eq(auditPages.auditId, audit.id));
  const bodyByUrl = new Map(bodyRows.map((row) => [row.url, row.bodyText]));

  const litePages: AuditPageLite[] = pages.map((page) => ({
    url: page.url,
    title: page.title,
    bodyText: bodyByUrl.get(page.url) ?? null,
    wordCount: page.wordCount,
  }));

  type Pair = {
    sourceUrl: string;
    targetUrl: string;
    keyword: string;
    position: number;
  };
  const pairs: Pair[] = [];
  for (const candidate of candidates) {
    const sources = pickSourcePages(
      litePages,
      candidate.keyword,
      candidate.url as string,
    );
    for (const source of sources) {
      pairs.push({
        sourceUrl: source.url,
        targetUrl: candidate.url as string,
        keyword: candidate.keyword,
        position: candidate.position as number,
      });
      if (pairs.length >= MAX_SUGGESTIONS_PER_RUN) break;
    }
    if (pairs.length >= MAX_SUGGESTIONS_PER_RUN) break;
  }

  if (pairs.length === 0) {
    return { created: 0, pairsConsidered: 0 };
  }

  const targetTitles = new Map(litePages.map((page) => [page.url, page.title]));

  const model = await getChatAgentModel(input.organizationId);
  const result = await generateText({
    model,
    maxOutputTokens: 2500,
    prompt: [
      "You are an internal linking strategist. For each pair below, write an internal link recommendation.",
      'Return ONLY valid JSON: {"links":[{"sourceUrl":"...","targetUrl":"...","anchorText":"2-5 word descriptive anchor","sentence":"one natural sentence from the source page containing the anchor text as a link","rationale":"max 15 words why"}]}',
      "Rules: anchor text must describe the target page topic (not 'click here'), the sentence must fit naturally in an article about the source page, no duplicate anchors.",
      "Pairs:",
      ...pairs.map(
        (pair) =>
          `- source: ${pair.sourceUrl} (about: ${targetTitles.get(pair.sourceUrl) ?? "unknown"}) -> target: ${pair.targetUrl} (about: ${targetTitles.get(pair.targetUrl) ?? "unknown"}), keyword: "${pair.keyword}"`,
      ),
    ].join("\n"),
  });

  const parsed = parseLinksJson(result.text);
  const rows = pairs.flatMap((pair) => {
    const match =
      parsed
        .get(pair.sourceUrl)
        ?.find((entry) => entry.targetUrl === pair.targetUrl) ??
      parsed.get(pair.sourceUrl)?.[0];
    return [
      {
        projectId: input.projectId,
        organizationId: input.organizationId,
        auditId: audit.id,
        sourceUrl: pair.sourceUrl,
        targetUrl: pair.targetUrl,
        targetKeyword: pair.keyword,
        gscPosition: String(pair.position),
        anchorText: match?.anchorText ?? pair.keyword,
        sentence:
          match?.sentence ??
          `Learn more about ${pair.keyword} on ${pair.targetUrl}.`,
        rationale:
          match?.rationale ??
          `GSC position ${pair.position} for "${pair.keyword}".`,
      },
    ];
  });

  const created = await InternalLinksRepository.insertSuggestions(rows);
  return { created, pairsConsidered: pairs.length };
}

function parseLinksJson(
  raw: string,
): Map<
  string,
  Array<{
    targetUrl: string;
    anchorText: string;
    sentence: string;
    rationale: string;
  }>
> {
  const bySource = new Map<
    string,
    Array<{
      targetUrl: string;
      anchorText: string;
      sentence: string;
      rationale: string;
    }>
  >();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return bySource;
  try {
    const json: unknown = JSON.parse(raw.slice(start, end + 1));
    const links = (json as { links?: unknown }).links;
    if (!Array.isArray(links)) return bySource;
    for (const link of links) {
      if (!link || typeof link !== "object") continue;
      const record = link as Record<string, unknown>;
      const sourceUrl = record.sourceUrl;
      const targetUrl = record.targetUrl;
      if (typeof sourceUrl !== "string" || typeof targetUrl !== "string")
        continue;
      const list = bySource.get(sourceUrl) ?? [];
      list.push({
        targetUrl,
        anchorText:
          typeof record.anchorText === "string"
            ? record.anchorText
            : "learn more",
        sentence: typeof record.sentence === "string" ? record.sentence : "",
        rationale: typeof record.rationale === "string" ? record.rationale : "",
      });
      bySource.set(sourceUrl, list);
    }
  } catch (error) {
    console.error("[internal-links] LLM JSON parse failed:", error);
  }
  return bySource;
}

async function listSuggestions(
  projectId: string,
  status?: InternalLinkSuggestion["status"],
) {
  return InternalLinksRepository.listSuggestions(projectId, status);
}

async function setStatus(input: {
  projectId: string;
  suggestionId: string;
  status: InternalLinkSuggestion["status"];
}) {
  await InternalLinksRepository.setStatus(
    input.projectId,
    input.suggestionId,
    input.status,
  );
  return { ok: true };
}

export const InternalLinksService = {
  generateSuggestions,
  listSuggestions,
  setStatus,
  QUICK_WIN_MIN,
  QUICK_WIN_MAX,
};
