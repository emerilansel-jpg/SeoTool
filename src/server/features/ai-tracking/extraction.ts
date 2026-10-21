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
  "solution",
  "solutions",
  "specializes",
  "specialized",
  "features",
  "robust",
  "streamline",
  "ideal",
  "suitable",
  "professional",
  "fast",
  "accurate",
  "advanced",
  "terbaik",
  "bagus",
  "rekomendasi",
  "unggul",
  "unggulan",
  "efektif",
  "solusi",
  "lengkap",
  "murah",
  "andal",
  "terpercaya",
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
  "buruk",
  "lambat",
  "mahal",
  "sulit",
  "kekurangan",
  "masalah",
  "kecewa",
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

export function isDomainMatch(
  sourceUrlOrDomain: string,
  entityDomain: string,
): boolean {
  if (!sourceUrlOrDomain || !entityDomain) return false;
  const cleanTarget = entityDomain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  const cleanSource = sourceUrlOrDomain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  if (cleanSource === cleanTarget) return true;
  if (cleanSource.endsWith(`.${cleanTarget}`)) return true;
  return false;
}

const NEGATIVE_DISCLAIMER_PATTERNS = [
  /doesn'?t (?:show|mention|have|find|return) any specific (?:business|service|listing|result)/i,
  /don'?t (?:show|mention|have|find|return) any specific (?:business|service|listing|result)/i,
  /couldn'?t find (?:a |any )?(?:clear,? )?(?:official )?(?:business|listing|information|review|result)/i,
  /could not find (?:a |any )?(?:clear,? )?(?:official )?(?:business|listing|information|review|result)/i,
  /didn'?t (?:return|find) specific information about/i,
  /did not (?:return|find) specific information about/i,
  /no clear,? official business listing/i,
  /none (?:that )?i found use that exact name/i,
  /no results? found for/i,
  /unable to find (?:any )?(?:specific )?(?:information|business|listing)/i,
  /tidak menemukan (?:adanya )?(?:bisnis|layanan|informasi|listing)/i,
  /tidak ditemukan (?:adanya )?(?:bisnis|layanan|informasi|listing)/i,
  /tidak ada (?:informasi|ulasan|listing|profil|bisnis) spesifik/i,
  /belum menemukan informasi/i,
  /tidak terdaftar secara resmi/i,
];

export function isNegativeDisclaimer(sentence: string): boolean {
  const trimmed = sentence.trim();
  return NEGATIVE_DISCLAIMER_PATTERNS.some((pat) => pat.test(trimmed));
}

const PREAMBLE_ECHO_PATTERNS = [
  /^(?:based on (?:my )?search results,? )?["'“]?[^"'”]+["'”]? refers to /i,
  /^(?:here are (?:some|the)? (?:top )?(?:nearby )?(?:alternatives|competitors|options|substitutes) (?:to|for))/i,
  /^(?:when (?:looking|searching) for alternatives to)/i,
  /^(?:if you are looking for alternatives to)/i,
  /^(?:in response to your query about)/i,
  /^#+\s*(?:top )?(?:alternatives|competitors|options)/i,
  /^(?:berdasarkan hasil pencarian,? )?["'“]?[^"'”]+["'”]? merujuk pada /i,
  /^(?:berikut (?:ini )?(?:adalah )?(?:beberapa )?(?:alternatif|kompetitor|pilihan) (?:selain|untuk))/i,
  /^(?:jika anda mencari alternatif)/i,
];

export function isPreambleEcho(sentence: string, prompt?: string): boolean {
  const s = sentence.trim();
  if (PREAMBLE_ECHO_PATTERNS.some((pat) => pat.test(s))) {
    return true;
  }
  if (prompt) {
    const isAltPrompt =
      /(?:alternatives?|competitors?|alternatif|kompetitor|selain|versus|vs)\b/i.test(
        prompt,
      );
    if (isAltPrompt) {
      if (
        /(?:alternatives? to|competitors? to|alternatif selain|kompetitor dari)/i.test(
          s,
        ) &&
        !/(?:^\d+[.)]|^[-*•]\s+)/m.test(s)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Find the most relevant sentence or snippet where the brand appears affirmatively.
 */
function findValidEvidenceSnippet(
  text: string,
  regex: RegExp,
  prompt?: string,
): { evidence: string | null; hasValidMention: boolean } {
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  let validSnippet: string | null = null;
  let hasValidMention = false;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 5 && regex.test(trimmed)) {
      if (isNegativeDisclaimer(trimmed)) {
        continue;
      }
      if (isPreambleEcho(trimmed, prompt)) {
        continue;
      }
      hasValidMention = true;
      if (!validSnippet) {
        validSnippet = trimmed.slice(0, 300);
      }
    }
  }

  return { evidence: validSnippet, hasValidMention };
}

/**
 * Extract all entity mentions (target brand and competitors) from LLM text and citations.
 */
export function extractMentions(
  text: string,
  citations: Array<{ url: string; domain: string; title?: string | null }>,
  entities: TrackingEntity[],
  prompt?: string,
): ExtractedMention[] {
  const results: ExtractedMention[] = [];

  for (const entity of entities) {
    const keywords = [entity.name, entity.domain, ...entity.aliases];
    const regex = buildBrandRegex(keywords);

    const { evidence: snippet, hasValidMention } = findValidEvidenceSnippet(
      text,
      regex,
      prompt,
    );

    const matchingCitation = citations.find(
      (c) =>
        isDomainMatch(c.domain, entity.domain) ||
        isDomainMatch(c.url, entity.domain),
    );
    const mentionedInCitations = Boolean(matchingCitation);

    if (hasValidMention || mentionedInCitations) {
      const position = extractRankPosition(text, keywords);
      const evidence =
        snippet ||
        (matchingCitation ? `Cited in ${matchingCitation.url}` : null);
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
