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
  /doesn['’]?t (?:show|mention|have|find|return) any specific (?:business|service|listing|result)/i,
  /don['’]?t (?:show|mention|have|find|return) any specific (?:business|service|listing|result)/i,
  /couldn['’]?t find (?:a |any )?(?:clear,? )?(?:official |well[-‑]established )?(?:business|listing|information|review|result|profile|page|website)/i,
  /could not find (?:a |any )?(?:clear,? )?(?:official |well[-‑]established )?(?:business|listing|information|review|result|profile|page|website)/i,
  /didn['’]?t (?:return|find) specific information about/i,
  /did not (?:return|find) specific information about/i,
  /no clear,? official business listing/i,
  /none (?:that )?i found use that exact name/i,
  /no results? found for/i,
  /unable to (?:find|verify|load|access) (?:any )?(?:specific )?(?:information|business|listing|detail|website|official)/i,
  /tidak menemukan (?:adanya )?(?:bisnis|layanan|informasi|listing|situs|halaman)/i,
  /tidak ditemukan (?:adanya )?(?:bisnis|layanan|informasi|listing|situs|halaman)/i,
  /tidak ada (?:informasi|ulasan|listing|profil|bisnis|situs|agregator) spesifik/i,
  /belum menemukan (?:informasi|halaman|situs|website)/i,
  /tidak terdaftar secara resmi/i,
  /belum bisa (?:memuat|menemukan|verifikasi|memverifikasi)/i,
  /tidak (?:bisa|dapat) (?:memuat|menemukan|memverifikasi)/i,
  /belum bisa memverifikasi/i,
  /bukan (?:satu|suatu)?\s*(?:merek|brand|perusahaan|entitas|pabrikan)/i,
  /bukan (?:khusus )?(?:dari|milik|untuk)\b/i,
  /bukan (?:merupakan )?(?:nama|merek|brand)\b/i,
  /tampaknya bukan (?:nama )?(?:brand|merek)\b/i,
  /melainkan istilah umum\b/i,
  /aren['’]?t tied to\b/i,
  /not tied to\b/i,
  /use (?:that|this) phrase\b/i,
  /generic\s+["'“][^"'”]+["'”]/i,
  /coba telusuri ulang untuk menemukan/i,
  /no (?:reliable,? )?(?:independent )?(?:review|online|public)\s+(?:footprint|profile|listing|presence)\s+found/i,
  /^do you mean a (?:specific )?(?:company|business|social account|brand|service)/i,
  /try (?:the handle|searching|searching for)/i,
  /if you (?:can )?share (?:the |a )?(?:exact |link |map )/i,
  /not a (?:specific|single)?\s*(?:brand|manufacturer|company|entity)/i,
  /(?:literally means|formed from)/i,
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
  /^(?:singkatnya,? )?["'“]?[^"'”]+["'”]? (?:adalah istilah yang merujuk|biasanya merujuk|merupakan istilah yang merujuk|merujuk (?:ke|pada) (?:jasa\/penyedia|penyedia\/instalator|layanan|sistem|istilah|instalator))/i,
  /^(?:ringkasnya,? )?[-–—\s]*["'“]?[^"'”]+["'”]? (?:biasanya merujuk|adalah istilah)/i,
  /["'“]?[^"'”]+["'”]? adalah istilah yang merujuk/i,
  /(?:adalah|merupakan) istilah yang merujuk/i,
  /(?:biasanya |adalah istilah yang |hanya )?merujuk (?:ke|pada) (?:jasa|penyedia|layanan|sistem|istilah|instalator)/i,
  /(?:selain|apart from|other than)\s+["'“]?[^"'”\s]+["'”]?/i,
  /(?:it looks like|it appears to be) an? indonesian/i,
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

function isOnlyInsideOtherDomainUrl(
  text: string,
  brandRegex: RegExp,
  targetDomain?: string,
): boolean {
  if (!targetDomain) return false;
  const cleanTarget = targetDomain.toLowerCase().replace(/^www\./, "");
  const urlRegex = /https?:\/\/[^\s)"'>]+/gi;
  const stripped = text.replace(urlRegex, (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.toLowerCase().includes(cleanTarget)) {
        return url;
      }
      return "[EXTERNAL_URL]";
    } catch {
      return "[EXTERNAL_URL]";
    }
  });
  return !brandRegex.test(stripped) && brandRegex.test(text);
}

function bulletBelongsToOtherDomain(
  text: string,
  targetDomain?: string,
): boolean {
  if (!targetDomain) return false;
  const cleanTarget = targetDomain.toLowerCase().replace(/^www\./, "");
  const domainInParenMatch =
    /\(([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)\)/.exec(text);
  if (domainInParenMatch) {
    const domain = domainInParenMatch[1].toLowerCase().replace(/^www\./, "");
    if (!domain.includes(cleanTarget) && !cleanTarget.includes(domain)) {
      return true;
    }
  }
  return false;
}

function isCompetitorBullet(
  sentence: string,
  competitorNames: string[],
): boolean {
  const bulletMatch =
    /^(?:[-*•]|\d+[.)])\s+(?:\*\*)?([^:*–—\n(]+?)(?:\*\*)?(?:\s*\([^)]*\))?\s*(?:[:–—-]|\b(?:punya|memiliki|menawarkan|menyediakan|adalah|merupakan|merujuk|fokus|spesialis)\b)/i.exec(
      sentence,
    );
  if (!bulletMatch) return false;
  const subject = bulletMatch[1].toLowerCase().trim();
  return competitorNames.some(
    (c) =>
      subject.includes(c.toLowerCase()) || c.toLowerCase().includes(subject),
  );
}

/**
 * Find the most relevant sentence or snippet where the brand appears affirmatively.
 */
function findValidEvidenceSnippet(
  text: string,
  regex: RegExp,
  prompt?: string,
  competitorNames?: string[],
  targetDomain?: string,
): { evidence: string | null; hasValidMention: boolean } {
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  let validSnippet: string | null = null;
  let hasValidMention = false;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 5 && regex.test(trimmed)) {
      if (
        isNegativeDisclaimer(trimmed) ||
        isPreambleEcho(trimmed, prompt) ||
        isOnlyInsideOtherDomainUrl(trimmed, regex, targetDomain) ||
        bulletBelongsToOtherDomain(trimmed, targetDomain)
      ) {
        continue;
      }
      if (
        competitorNames &&
        competitorNames.length > 0 &&
        isCompetitorBullet(trimmed, competitorNames)
      ) {
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
  const competitorNames = entities
    .filter((e) => !e.isTargetBrand)
    .map((e) => e.name);

  for (const entity of entities) {
    const keywords = [entity.name, entity.domain, ...entity.aliases];
    const regex = buildBrandRegex(keywords);

    const { evidence: snippet, hasValidMention } = findValidEvidenceSnippet(
      text,
      regex,
      prompt,
      entity.isTargetBrand ? competitorNames : undefined,
      entity.domain,
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
