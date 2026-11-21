import { generateText } from "ai";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { AppError } from "@/server/lib/errors";

// DataForSEO Keyword Overview accepts up to 200 keywords per request.
const KEYWORDS_PER_OVERVIEW_CALL = 200;
const MAX_KEYWORDS = 1_000;
const MAX_TERMS = 20;
const MAX_PAA_KEYWORDS = 20;
const MAX_AUTOCOMPLETE_KEYWORDS = 20;

function cleanKeywordList(keywords: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const keyword of keywords) {
    const trimmed = keyword.trim().slice(0, 200);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(trimmed);
    if (cleaned.length >= MAX_KEYWORDS) break;
  }
  return cleaned;
}

export type BulkKeywordMetricsRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
  difficulty: number | null;
  intent: string | null;
  foreignIntent: string[];
};

/** Bulk keyword metrics + search intent via Keyword Overview (200/call). */
async function bulkKeywordMetrics(
  input: { keywords: string[]; locationCode?: number; languageCode?: string },
  billingCustomer: BillingCustomerContext,
): Promise<{ rows: BulkKeywordMetricsRow[]; unmatched: string[] }> {
  const keywords = cleanKeywordList(input.keywords);
  if (keywords.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Provide at least one keyword.");
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);

  const rows: BulkKeywordMetricsRow[] = [];
  for (let i = 0; i < keywords.length; i += KEYWORDS_PER_OVERVIEW_CALL) {
    const chunk = keywords.slice(i, i + KEYWORDS_PER_OVERVIEW_CALL);
    // Sequenced so hosted-mode credit reservation settles between calls.
    const items = await dataforseo.labs.keywordOverview({
      keywords: chunk,
      locationCode,
      languageCode,
      creditFeature: "keyword_research",
    });
    const found = new Set<string>();
    for (const item of items) {
      const keyword = item.keyword ?? "";
      if (!keyword) continue;
      found.add(keyword.toLowerCase());
      rows.push({
        keyword,
        searchVolume: item.keyword_info?.search_volume ?? null,
        cpc: item.keyword_info?.cpc ?? null,
        competition: item.keyword_info?.competition ?? null,
        difficulty: item.keyword_properties?.keyword_difficulty ?? null,
        intent: item.search_intent_info?.main_intent ?? null,
        foreignIntent: item.search_intent_info?.foreign_intent ?? [],
      });
    }
    // Keyword Overview omits keywords it has no data for; surface them so the
    // UI can distinguish "0 volume" from "not in database".
    for (const keyword of chunk) {
      if (!found.has(keyword.toLowerCase())) {
        rows.push({
          keyword,
          searchVolume: null,
          cpc: null,
          competition: null,
          difficulty: null,
          intent: null,
          foreignIntent: [],
        });
      }
    }
  }
  return { rows, unmatched: [] };
}

/** Bulk People Also Ask: one depth-1 SERP call per keyword. */
async function bulkPaa(
  input: { keywords: string[]; locationCode?: number; languageCode?: string },
  billingCustomer: BillingCustomerContext,
): Promise<Array<{ keyword: string; questions: string[] }>> {
  const keywords = cleanKeywordList(input.keywords).slice(0, MAX_PAA_KEYWORDS);
  if (keywords.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Provide at least one keyword.");
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);

  const results: Array<{ keyword: string; questions: string[] }> = [];
  for (const keyword of keywords) {
    try {
      const result = await dataforseo.serp.paa({
        keyword,
        locationCode,
        languageCode,
        creditFeature: "keyword_research",
      });
      results.push({ keyword, questions: result.questions });
    } catch (error) {
      console.error(`[bulk-tools] PAA failed for "${keyword}":`, error);
      results.push({ keyword, questions: [] });
    }
  }
  return results;
}

/** Bulk autocomplete suggestions: one cheap call per seed keyword. */
async function bulkAutocomplete(
  input: { keywords: string[]; locationCode?: number; languageCode?: string },
  billingCustomer: BillingCustomerContext,
): Promise<Array<{ keyword: string; suggestions: string[] }>> {
  const keywords = cleanKeywordList(input.keywords).slice(
    0,
    MAX_AUTOCOMPLETE_KEYWORDS,
  );
  if (keywords.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Provide at least one keyword.");
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);

  const results: Array<{ keyword: string; suggestions: string[] }> = [];
  for (const keyword of keywords) {
    try {
      const result = await dataforseo.keywords.autocomplete({
        keyword,
        locationCode,
        languageCode,
        creditFeature: "keyword_research",
      });
      results.push({ keyword, suggestions: result.suggestions });
    } catch (error) {
      console.error(
        `[bulk-tools] autocomplete failed for "${keyword}":`,
        error,
      );
      results.push({ keyword, suggestions: [] });
    }
  }
  return results;
}

export type BulkMentionRow = {
  term: string;
  results: Array<{
    title: string | null;
    url: string | null;
    description: string | null;
  }>;
  resultCount: number | null;
};

/** Bulk mentions: who/what ranks when someone searches the term in quotes. */
async function bulkMentions(
  input: { terms: string[]; locationCode?: number; languageCode?: string },
  billingCustomer: BillingCustomerContext,
): Promise<BulkMentionRow[]> {
  const terms = cleanKeywordList(input.terms).slice(0, MAX_TERMS);
  if (terms.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Provide at least one term.");
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);

  const rows: BulkMentionRow[] = [];
  for (const term of terms) {
    try {
      const serp = await dataforseo.serp.competition({
        keyword: `"${term}"`,
        locationCode,
        languageCode,
        creditFeature: "keyword_research",
      });
      rows.push({
        term,
        resultCount: serp.seResultsCount,
        results: serp.items.slice(0, 10).map((item) => ({
          title: item.title ?? null,
          url: item.url ?? null,
          description: item.description ?? null,
        })),
      });
    } catch (error) {
      console.error(`[bulk-tools] mentions failed for "${term}":`, error);
      rows.push({ term, resultCount: null, results: [] });
    }
  }
  return rows;
}

export type MetadataSuggestion = {
  url: string;
  currentTitle: string | null;
  suggestedTitle: string | null;
  currentMetaDescription: string | null;
  suggestedMetaDescription: string | null;
  notes: string | null;
};

/** Bulk metadata optimizer: rewrite titles/meta descriptions from audit pages
 *  via the configured LLM. No DataForSEO spend; LLM cost only. */
async function bulkMetadataOptimizer(
  input: { projectId: string; auditId?: string; maxPages?: number },
  billingCustomer: BillingCustomerContext,
): Promise<{ suggestions: MetadataSuggestion[]; model: string }> {
  const { AuditRepository } =
    await import("@/server/features/audit/repositories/AuditRepository");
  const audit = input.auditId
    ? await AuditRepository.getAuditForProject(input.projectId, input.auditId)
    : await AuditRepository.getLatestCompletedAuditForProject(input.projectId);
  if (!audit) {
    throw new AppError(
      "NOT_FOUND",
      "No completed site audit found. Run a Site Audit first.",
    );
  }
  const pages = (await AuditRepository.getPagesForAudit(audit.id))
    .filter((page) => (page.statusCode ?? 0) < 300)
    .slice(0, input.maxPages ?? 15);

  if (pages.length === 0) {
    throw new AppError(
      "NOT_FOUND",
      "The selected audit has no crawlable pages.",
    );
  }

  const pageSummaries = pages
    .map((page) =>
      [
        `URL: ${page.url}`,
        `TITLE: ${page.title ?? "(none)"}`,
        `META: ${page.metaDescription ?? "(none)"}`,
        `WORDS: ${page.wordCount}`,
      ].join("\n"),
    )
    .join("\n\n");

  const model = await getChatAgentModel(billingCustomer.organizationId);
  const result = await generateText({
    model,
    maxOutputTokens: 3000,
    prompt: [
      "You are an on-page SEO optimizer. For each page below, suggest an improved <title> (max 60 chars) and meta description (max 155 chars).",
      "Rules: keep the primary keyword/topic, include the brand when natural, no clickbait, US English.",
      'Return ONLY valid JSON: {"suggestions":[{"url":"...","suggestedTitle":"...","suggestedMetaDescription":"...","notes":"one short reason"}]}',
      "Pages:",
      pageSummaries,
    ].join("\n"),
  });

  const parsed = parseMetadataSuggestions(
    result.text,
    pages.map((page) => page.url),
  );
  return { suggestions: parsed, model: "configured" };
}

type ParsedMetadataEntry = {
  suggestedTitle?: string;
  suggestedMetaDescription?: string;
  notes?: string;
};

function collectSuggestionEntries(
  list: unknown[],
  byUrl: Map<string, ParsedMetadataEntry>,
): void {
  for (const entry of list) {
    if (!entry || typeof entry !== "object" || !("url" in entry)) continue;
    const record = entry as Record<string, unknown>;
    const url = typeof record.url === "string" ? record.url : null;
    if (!url) continue;
    byUrl.set(url, {
      suggestedTitle:
        typeof record.suggestedTitle === "string"
          ? record.suggestedTitle
          : undefined,
      suggestedMetaDescription:
        typeof record.suggestedMetaDescription === "string"
          ? record.suggestedMetaDescription
          : undefined,
      notes: typeof record.notes === "string" ? record.notes : undefined,
    });
  }
}

/** Parse the LLM JSON defensively; unmatched URLs get a fallback note row. */
function parseMetadataSuggestions(
  raw: string,
  urls: string[],
): MetadataSuggestion[] {
  const byUrl = new Map<string, ParsedMetadataEntry>();
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const json: unknown = JSON.parse(raw.slice(start, end + 1));
      if (json && typeof json === "object" && "suggestions" in json) {
        const list = (json as { suggestions?: unknown }).suggestions;
        if (Array.isArray(list)) {
          collectSuggestionEntries(list, byUrl);
        }
      }
    }
  } catch (error) {
    console.error("[bulk-tools] metadata optimizer JSON parse failed:", error);
  }

  return urls.map((url) => {
    const match = byUrl.get(url);
    return {
      url,
      currentTitle: null,
      suggestedTitle: match?.suggestedTitle ?? null,
      currentMetaDescription: null,
      suggestedMetaDescription: match?.suggestedMetaDescription ?? null,
      notes:
        match?.notes ??
        (match ? null : "No suggestion generated for this page."),
    };
  });
}

export const BulkToolsService = {
  bulkKeywordMetrics,
  bulkPaa,
  bulkAutocomplete,
  bulkMentions,
  bulkMetadataOptimizer,
  MAX_KEYWORDS,
};
