/**
 * Deterministic content-quality scoring engine.
 *
 * Scores each audited page 0-100 from the signals already captured in
 * `audit_pages` (no external API, no cost). The result is fully explainable:
 * six weighted sub-scores plus a list of human-readable flags the UI can show
 * in a drill-down.
 *
 * Thresholds follow widely-cited SEO best practice (not a proprietary model).
 * They are deliberately simple and unit-tested so they stay tunable. When the
 * engine changes, update the tests first.
 *
 * Weights (sum to 100):
 *   depth 25, headings 20, metadata 20, technical 15, media 10, linking 10
 */

export type FlagSeverity = "critical" | "warning" | "info";

export type ContentFlag = {
  severity: FlagSeverity;
  /** Stable machine code for grouping/dedup in the UI, e.g. "thin_content". */
  code: string;
  message: string;
};

/** Signals derived from an `audit_pages` row (plus parsed robots/canonical). */
export type ContentScoreInput = {
  wordCount: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  /** Heading tag levels in document order (1..6), from `heading_order_json`.
   *  Null when the order wasn't captured; counts are still scored. */
  headingOrder: number[] | null;
  title: string | null;
  metaDescription: string | null;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  imagesTotal: number;
  imagesMissingAlt: number;
  internalLinkCount: number;
  externalLinkCount: number;
  hasStructuredData: boolean;
  isIndexable: boolean;
  hasCanonical: boolean;
};

type ContentSubScores = {
  depth: number;
  headings: number;
  metadata: number;
  media: number;
  linking: number;
  technical: number;
};

type ContentScoreResult = {
  score: number;
  subScores: ContentSubScores;
  flags: ContentFlag[];
};

const WEIGHTS = {
  depth: 0.25,
  headings: 0.2,
  metadata: 0.2,
  technical: 0.15,
  media: 0.1,
  linking: 0.1,
} as const;

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

/** Score a page. Pure: same input always yields the same output. */
export function scoreContent(input: ContentScoreInput): ContentScoreResult {
  const depth = scoreDepth(input);
  const headings = scoreHeadings(input);
  const metadata = scoreMetadata(input);
  const media = scoreMedia(input);
  const linking = scoreLinking(input);
  const technical = scoreTechnical(input);

  const flags = [
    ...depth.flags,
    ...headings.flags,
    ...metadata.flags,
    ...media.flags,
    ...linking.flags,
    ...technical.flags,
  ];

  const raw =
    depth.score * WEIGHTS.depth +
    headings.score * WEIGHTS.headings +
    metadata.score * WEIGHTS.metadata +
    technical.score * WEIGHTS.technical +
    media.score * WEIGHTS.media +
    linking.score * WEIGHTS.linking;

  const score = clamp(raw);

  return {
    score,
    subScores: {
      depth: depth.score,
      headings: headings.score,
      metadata: metadata.score,
      media: media.score,
      linking: linking.score,
      technical: technical.score,
    },
    flags,
  };
}

// ---------------------------------------------------------------------------
// Sub-scores. Each returns { score: 0-100, flags: [] }.
// ---------------------------------------------------------------------------

type SubResult = { score: number; flags: ContentFlag[] };

/** Content depth based on visible word count. */
function scoreDepth(input: ContentScoreInput): SubResult {
  const words = input.wordCount;
  const flags: ContentFlag[] = [];

  let score: number;
  if (words <= 0) {
    score = 0;
    flags.push({
      severity: "critical",
      code: "no_content",
      message: "No readable body content found.",
    });
  } else if (words < 100) {
    score = 15;
    flags.push({
      severity: "critical",
      code: "very_thin_content",
      message: `Very thin content (${words} words).`,
    });
  } else if (words < 300) {
    score = 40;
    flags.push({
      severity: "warning",
      code: "thin_content",
      message: `Thin content (${words} words); aim for 600+.`,
    });
  } else if (words < 600) {
    score = 70;
    flags.push({
      severity: "info",
      code: "short_content",
      message: `Short content (${words} words).`,
    });
  } else if (words <= 2500) {
    score = 100;
  } else if (words <= 4000) {
    score = 90;
  } else {
    score = 80;
    flags.push({
      severity: "info",
      code: "lengthy_content",
      message: `Lengthy content (${words} words).`,
    });
  }

  return { score, flags };
}

/** Heading structure: a single H1, logical subheadings, no skipped levels. */
function scoreHeadings(input: ContentScoreInput): SubResult {
  let score = 100;
  const flags: ContentFlag[] = [];

  if (input.h1Count === 0) {
    score -= 50;
    flags.push({
      severity: "critical",
      code: "missing_h1",
      message: "Missing H1 heading.",
    });
  } else if (input.h1Count > 1) {
    score -= 25;
    flags.push({
      severity: "warning",
      code: "multiple_h1",
      message: `${input.h1Count} H1 headings; use one per page.`,
    });
  }

  if (input.h2Count === 0) {
    score -= 25;
    flags.push({
      severity: "warning",
      code: "no_h2",
      message: "No H2 subheadings; structure improves scannability.",
    });
  } else if (input.h3Count === 0) {
    score -= 10;
    flags.push({
      severity: "info",
      code: "no_h3",
      message: "No H3 subheadings.",
    });
  }

  const skipped = skippedHeadingLevels(input.headingOrder);
  if (skipped > 0) {
    score -= Math.min(20, skipped * 10);
    flags.push({
      severity: "warning",
      code: "skipped_heading_level",
      message: "Heading levels are skipped (e.g. H2 to H4).",
    });
  }

  return { score: clamp(score), flags };
}

/** Title, meta description, and Open Graph metadata completeness. */
function scoreMetadata(input: ContentScoreInput): SubResult {
  let score = 100;
  const flags: ContentFlag[] = [];

  const titleLen = (input.title ?? "").trim().length;
  if (titleLen === 0) {
    score -= 50;
    flags.push({
      severity: "critical",
      code: "missing_title",
      message: "Missing <title> tag.",
    });
  } else if (titleLen < 30) {
    score -= 25;
    flags.push({
      severity: "warning",
      code: "short_title",
      message: `Title is short (${titleLen} chars); 30-60 is ideal.`,
    });
  } else if (titleLen > 60) {
    score -= 15;
    flags.push({
      severity: "warning",
      code: "long_title",
      message: `Title may be truncated in SERPs (${titleLen} chars).`,
    });
  }

  const descLen = (input.metaDescription ?? "").trim().length;
  if (descLen === 0) {
    score -= 25;
    flags.push({
      severity: "warning",
      code: "missing_meta_description",
      message: "Missing meta description.",
    });
  } else if (descLen < 120) {
    score -= 10;
    flags.push({
      severity: "info",
      code: "short_meta_description",
      message: `Short meta description (${descLen} chars); 120-160 is ideal.`,
    });
  } else if (descLen > 160) {
    score -= 15;
    flags.push({
      severity: "warning",
      code: "long_meta_description",
      message: `Meta description may be truncated (${descLen} chars).`,
    });
  }

  if (!input.hasOgTitle) {
    score -= 5;
    flags.push({
      severity: "info",
      code: "missing_og_title",
      message: "Missing Open Graph title.",
    });
  }
  if (!input.hasOgDescription) {
    score -= 5;
    flags.push({
      severity: "info",
      code: "missing_og_description",
      message: "Missing Open Graph description.",
    });
  }

  return { score: clamp(score), flags };
}

/** Image usage and alt-text coverage. */
function scoreMedia(input: ContentScoreInput): SubResult {
  const flags: ContentFlag[] = [];

  if (input.imagesTotal === 0) {
    return {
      score: 60,
      flags: [
        {
          severity: "info",
          code: "no_images",
          message: "No images on this page.",
        },
      ],
    };
  }

  const missingRatio = input.imagesMissingAlt / input.imagesTotal;
  const score = clamp(100 * (1 - missingRatio));
  if (missingRatio > 0) {
    flags.push({
      severity: missingRatio > 0.5 ? "warning" : "info",
      code: "images_missing_alt",
      message: `${input.imagesMissingAlt} of ${input.imagesTotal} images missing alt text.`,
    });
  }

  return { score, flags };
}

/** Internal linking: contextual links aid discovery and topical relevance. */
function scoreLinking(input: ContentScoreInput): SubResult {
  const flags: ContentFlag[] = [];
  let score: number;

  if (input.internalLinkCount === 0) {
    score = 50;
    flags.push({
      severity: "warning",
      code: "no_internal_links",
      message: "No internal links detected.",
    });
  } else if (input.internalLinkCount < 4) {
    score = 80;
    flags.push({
      severity: "info",
      code: "few_internal_links",
      message: `Only ${input.internalLinkCount} internal links.`,
    });
  } else {
    score = 100;
  }

  return { score, flags };
}

/** Technical SEO signals: indexability, canonical, structured data. */
function scoreTechnical(input: ContentScoreInput): SubResult {
  const flags: ContentFlag[] = [];

  if (!input.isIndexable) {
    return {
      score: 0,
      flags: [
        {
          severity: "critical",
          code: "not_indexable",
          message: "Page is not indexable (noindex or blocked).",
        },
      ],
    };
  }

  let score = 100;
  if (!input.hasCanonical) {
    score -= 20;
    flags.push({
      severity: "warning",
      code: "missing_canonical",
      message: "Missing canonical link.",
    });
  }
  if (!input.hasStructuredData) {
    score -= 20;
    flags.push({
      severity: "info",
      code: "no_structured_data",
      message: "No structured data (JSON-LD) found.",
    });
  }

  return { score: clamp(score), flags };
}

/** Count skipped heading levels from an ordered list of heading depths.
 *  A skip is a jump larger than +1 between consecutive headings
 *  (e.g. 2 followed by 4). Returns 0 when the order is unavailable. */
function skippedHeadingLevels(headingOrder: number[] | null): number {
  if (!headingOrder || headingOrder.length < 2) return 0;
  let skipped = 0;
  for (let i = 1; i < headingOrder.length; i += 1) {
    const prev = headingOrder[i - 1];
    const curr = headingOrder[i];
    if (curr - prev > 1) skipped += 1;
  }
  return skipped;
}
