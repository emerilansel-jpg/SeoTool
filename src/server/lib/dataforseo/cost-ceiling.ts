import {
  CREDITS_PER_USD,
  SEO_DATA_BYOK_FEE_MULTIPLIER,
  SEO_DATA_COST_MARKUP,
  roundUsdForBilling,
} from "@/shared/billing";

/**
 * Conservative pre-authorization profiles. The rates mirror DataForSEO's
 * public PAYG model as of 2026-08: a request component plus a row/task
 * component. They intentionally round upward and should be reviewed whenever
 * provider pricing changes; actual billing is always settled from the task's
 * returned `cost` field.
 */
export type DataforseoCostProfile =
  | "backlinks-summary"
  | "backlinks-list"
  | "backlinks-bulk"
  | "labs-list"
  | "labs-keywords"
  | "google-ads"
  | "serp-live"
  | "serp-task-batch"
  | "business-list"
  | "business-depth"
  | "lighthouse"
  | "ai-mentions"
  | "ai-llm-response";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function numberField(
  input: Record<string, unknown>,
  key: string,
  fallback: number,
) {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : fallback;
}

function arrayLength(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return Array.isArray(value) ? value.length : 0;
}

function clampRows(value: number, fallback = 1, maximum = 1_000) {
  const normalized = value > 0 ? Math.ceil(value) : fallback;
  return Math.min(maximum, Math.max(1, normalized));
}

export function estimateDataforseoRawCostCeilingUsd(
  profile: DataforseoCostProfile,
  inputValue: unknown,
): number {
  const input = isRecord(inputValue) ? inputValue : {};
  const limit = numberField(input, "limit", 0);
  const targets = arrayLength(input, "targets");
  const keywords = arrayLength(input, "keywords");
  const tasks = arrayLength(input, "tasks");
  const depth = numberField(input, "depth", 10);

  switch (profile) {
    case "backlinks-summary":
      return 0.024_036;
    case "backlinks-list":
      return 0.024 + 0.000_036 * clampRows(limit, 100);
    case "backlinks-bulk":
      return 0.024 + 0.000_036 * clampRows(targets);
    case "labs-list": {
      const rows = clampRows(Math.max(limit, keywords));
      const optionalDataMultiplier =
        input.includeClickstreamData === true || input.includeSerpInfo === true
          ? 2
          : 1;
      return (0.012 + 0.000_12 * rows) * optionalDataMultiplier;
    }
    case "labs-keywords": {
      const rows = clampRows(Math.max(keywords, 1), 1, 700);
      const optionalDataMultiplier =
        input.includeClickstreamData === true || input.includeSerpInfo === true
          ? 2
          : 1;
      return (0.012 + 0.000_12 * rows) * optionalDataMultiplier;
    }
    case "google-ads":
      // Flat-priced live request (the endpoint can return many suggestions).
      return 0.09;
    case "serp-live": {
      // Advanced live SERPs are billed per results page and can include
      // provider-side premiums that are only known from the returned task.
      // Keep a deliberately conservative hold; settlement refunds the unused
      // portion using the authoritative cost returned by DataForSEO.
      const pages = clampRows(Math.ceil(depth / 100), 1, 10);
      return 0.02 * pages;
    }
    case "serp-task-batch": {
      const taskCount = clampRows(tasks, 1, 100);
      const pagesPerTask = clampRows(Math.ceil(depth / 100), 1, 10);
      return 0.001_2 * taskCount * pagesPerTask;
    }
    case "business-list":
      return 0.012 + 0.000_12 * clampRows(limit, 100);
    case "business-depth":
      return 0.012 + 0.001_2 * clampRows(Math.ceil(depth / 10), 1, 10);
    case "lighthouse":
      return 0.024;
    case "ai-mentions": {
      const rows = clampRows(
        Math.max(
          limit,
          numberField(input, "internalListLimit", 0),
          numberField(input, "itemsListLimit", 0),
          arrayLength(input, "groups"),
        ),
        100,
      );
      return 0.12 + 0.001_2 * rows;
    }
    case "ai-llm-response": {
      const outputTokens = Math.min(
        4_096,
        Math.max(256, numberField(input, "maxOutputTokens", 1_024)),
      );
      const prompt =
        typeof input.userPrompt === "string" ? input.userPrompt : "";
      const promptTokens = Math.ceil(prompt.length / 3);
      // Includes DataForSEO's task fee, web-search allowance, and a generous
      // cross-model token ceiling. Returned provider cost remains authoritative.
      return 0.015 + (promptTokens + outputTokens) * 0.000_05;
    }
  }
}

export function estimateDataforseoReservationCredits(input: {
  profile: DataforseoCostProfile;
  request: unknown;
  billingMode: "standard" | "byok";
}) {
  const rawCostUsd = estimateDataforseoRawCostCeilingUsd(
    input.profile,
    input.request,
  );
  const multiplier =
    input.billingMode === "byok"
      ? SEO_DATA_BYOK_FEE_MULTIPLIER
      : SEO_DATA_COST_MARKUP;
  return Math.max(
    1,
    Math.ceil(roundUsdForBilling(rawCostUsd * multiplier) * CREDITS_PER_USD),
  );
}
