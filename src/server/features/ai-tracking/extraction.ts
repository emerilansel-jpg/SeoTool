const POSITIVE_WORDS = new Set([
  "best",
  "great",
  "excellent",
  "top",
  "leading",
  "powerful",
  "affordable",
  "budget",
  "recommended",
  "popular",
  "trusted",
  "effective",
  "intuitive",
  "reliable",
  "good",
  "easy",
  "standout",
  "solid",
  "favorite",
  "efficient",
  "comprehensive",
]);

const NEGATIVE_WORDS = new Set([
  "poor",
  "slow",
  "expensive",
  "complex",
  "difficult",
  "buggy",
  "lacks",
  "limited",
  "downside",
  "drawback",
  "issue",
  "worst",
  "confusing",
  "steep",
  "outdated",
  "clunky",
]);

export interface TrackingEntity {
  name: string;
  domain: string;
  aliases: string[];
  isTargetBrand: boolean;
}

export interface ExtractedMention {
  brandName: string;
  domain: string;
  isTargetBrand: boolean;
  position: number | null;
  sentiment: "positive" | "mixed" | "neutral" | "negative";
  evidence: string | null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildBrandRegex(names: string[]): RegExp {
  const allNames = new Set<string>();
  for (const raw of names) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    allNames.add(trimmed);

    // If name contains spaces, add joined and hyphenated versions (e.g. "Jet Digital Pro" -> "JetDigitalPro", "Jet-Digital-Pro")
    if (trimmed.includes(" ")) {
      allNames.add(trimmed.replace(/\s+/g, ""));
      allNames.add(trimmed.replace(/\s+/g, "-"));
    }

    // If name is camelCase or PascalCase, split it (e.g. "JetDigitalPro" -> "Jet Digital Pro")
    const unCamel = trimmed.replace(/([a-z])([A-Z])/g, "$1 $2");
    if (unCamel !== trimmed) {
      allNames.add(unCamel);
    }

    // Strip common TLDs if domain was passed e.g. "jetdigitalpro.com" -> "jetdigitalpro"
    const withoutTld = trimmed.replace(
      /\.(com|co|id|org|net|io|ai|im|app|biz|info|site|tech)$/i,
      "",
    );
    if (withoutTld !== trimmed && withoutTld.length >= 3) {
      allNames.add(withoutTld);
    }
  }

  const parts = Array.from(allNames).map((name) => {
    const escaped = escapeRegex(name);
    const leading = /^\w/.test(name) ? "\\b" : "";
    const trailing = /\w$/.test(name) ? "\\b" : "";
    return `${leading}${escaped}${trailing}`;
  });
  if (parts.length === 0) return /$^/; // matches nothing
  return new RegExp(`(?:${parts.join("|")})`, "i");
}

/**
 * Extracts 1-based ranking position from numbered or ordered lists in response text.
 * Returns null if the response is not a ranked/ordered list or the brand is not in the list.
 */
export function extractRankPosition(
  text: string,
  brandKeywords: string[],
): number | null {
  const regex = buildBrandRegex(brandKeywords);
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Match lines like "1. Brand", "1) Brand", "**1. Brand**", "#1 Brand"
  const numberedPattern =
    /^(?:(?:\*\*|#)?\s*(\d+)[.)]\s*(?:\*\*)?|#(\d+)\s+)(.+)/i;

  const rankedItems: Array<{ rank: number; content: string }> = [];

  for (const line of lines) {
    const match = numberedPattern.exec(line);
    if (match) {
      const rankNum = Number.parseInt(match[1] || match[2] || "0", 10);
      if (rankNum > 0 && rankNum <= 50) {
        rankedItems.push({ rank: rankNum, content: match[3] ?? line });
      }
    }
  }

  // Must have at least 2 ranked items to be considered a ranked response
  if (rankedItems.length >= 2) {
    for (const item of rankedItems) {
      if (regex.test(item.content)) {
        return item.rank;
      }
    }
  }

  return null;
}

/**
 * Classify sentiment from context surrounding brand mentions.
 */
export function analyzeSentiment(
  snippet: string,
): "positive" | "mixed" | "neutral" | "negative" {
  const words = snippet
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positiveCount++;
    if (NEGATIVE_WORDS.has(word)) negativeCount++;
  }

  if (positiveCount > 0 && negativeCount > 0) return "mixed";
  if (positiveCount > 0) return "positive";
  if (negativeCount > 0) return "negative";
  return "neutral";
}

/**
 * Find the most relevant sentence or snippet where the brand appears.
 */
function findEvidenceSnippet(text: string, regex: RegExp): string | null {
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 5 && regex.test(trimmed)) {
      return trimmed.slice(0, 300);
    }
  }
  return null;
}

/**
 * Extract all entity mentions (target brand and competitors) from LLM text and citations.
 */
export function extractMentions(
  text: string,
  citations: Array<{ url: string; domain: string; title?: string | null }>,
  entities: TrackingEntity[],
): ExtractedMention[] {
  const results: ExtractedMention[] = [];

  for (const entity of entities) {
    const keywords = [entity.name, entity.domain, ...entity.aliases];
    const regex = buildBrandRegex(keywords);

    const cleanEntityDomain = entity.domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");

    const mentionedInText = regex.test(text);
    const mentionedInCitations = citations.some((c) => {
      const cleanCitDomain = c.domain
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");

      return (
        cleanCitDomain.includes(cleanEntityDomain) ||
        cleanEntityDomain.includes(cleanCitDomain) ||
        c.url.toLowerCase().includes(cleanEntityDomain) ||
        regex.test(c.title ?? "") ||
        regex.test(c.url ?? "")
      );
    });

    if (mentionedInText || mentionedInCitations) {
      const position = extractRankPosition(text, keywords);
      const evidence =
        findEvidenceSnippet(text, regex) ||
        (mentionedInCitations ? `Cited in ${citations[0]?.url}` : null);
      const sentiment = evidence ? analyzeSentiment(evidence) : "neutral";

      results.push({
        brandName: entity.name,
        domain: entity.domain,
        isTargetBrand: entity.isTargetBrand,
        position,
        sentiment,
        evidence,
      });
    }
  }

  return results;
}
