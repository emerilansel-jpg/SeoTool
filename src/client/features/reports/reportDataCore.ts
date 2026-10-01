export const REPORT_SECTION_OPTIONS = [
  "rank",
  "audit",
  "gsc",
  "ga4",
  "backlinks",
  "content",
  "gmb_grid",
  "brand_lookup",
  "ai_tracking",
] as const;

export type ReportSectionType = (typeof REPORT_SECTION_OPTIONS)[number];
export type ReportPeriod = "weekly" | "monthly" | "yearly";
export type DeliverySchedule = "none" | ReportPeriod;
export type UnknownRecord = Record<string, unknown>;

const SECTION_LABELS: Record<ReportSectionType, string> = {
  rank: "Rank Tracking",
  audit: "Site Audit",
  gsc: "Search Console",
  ga4: "Google Analytics 4",
  backlinks: "Backlinks",
  content: "Content Quality",
  gmb_grid: "Local Map Rank",
  brand_lookup: "Brand Lookup",
  ai_tracking: "Generative AI",
};

export function getReportSectionLabel(type: string): string {
  const option = REPORT_SECTION_OPTIONS.find((item) => item === type);
  return option ? SECTION_LABELS[option] : humanize(type);
}

export function formatReportPeriod(period: string): string {
  return period === "weekly"
    ? "Weekly"
    : period === "yearly"
      ? "Yearly"
      : "Monthly";
}

export function formatDeliverySchedule(schedule: string): string {
  return schedule === "none" ? "On-demand" : formatReportPeriod(schedule);
}

export function isReportSectionType(value: string): value is ReportSectionType {
  return REPORT_SECTION_OPTIONS.some((type) => type === value);
}

export function isReportPeriod(value: unknown): value is ReportPeriod {
  return value === "weekly" || value === "monthly" || value === "yearly";
}

export function isDeliverySchedule(value: unknown): value is DeliverySchedule {
  return value === "none" || isReportPeriod(value);
}

export function asRecord(value: unknown): UnknownRecord | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- object check narrows the JSON value
      (value as UnknownRecord)
    : undefined;
}

function normalizedKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function property(record: UnknownRecord, key: string): unknown {
  if (key in record) return record[key];
  const wanted = normalizedKey(key);
  const found = Object.keys(record).find(
    (item) => normalizedKey(item) === wanted,
  );
  return found === undefined ? undefined : record[found];
}

export function readValue(source: unknown, paths: readonly string[]): unknown {
  for (const path of paths) {
    let value: unknown = source;
    for (const segment of path.split(".")) {
      const record = asRecord(value);
      value = record ? property(record, segment) : undefined;
      if (value === undefined || value === null) break;
    }
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

export function readNumber(
  source: unknown,
  paths: readonly string[],
): number | undefined {
  const value = readValue(source, paths);
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value.replace(/[$,%\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function readString(
  source: unknown,
  paths: readonly string[],
): string | undefined {
  const value = readValue(source, paths);
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

export function readCollection(
  source: unknown,
  paths: readonly string[],
): UnknownRecord[] {
  const value = readValue(source, paths);
  if (Array.isArray(value)) {
    return value
      .map(asRecord)
      .filter((row): row is UnknownRecord => Boolean(row));
  }
  const record = asRecord(value);
  if (!record) return [];
  return Object.entries(record).flatMap(([key, item]) => {
    const row = asRecord(item);
    return row ? [{ __key: key, ...row }] : [];
  });
}

export function formatReportNumber(
  value: number | undefined,
  maximumFractionDigits = 1,
): string {
  return value === undefined
    ? "N/A"
    : new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);
}

export function formatReportPercent(value: number | undefined): string {
  return value === undefined ? "N/A" : `${formatReportNumber(value, 1)}%`;
}

export function formatReportCurrency(value: number | undefined): string {
  return value === undefined
    ? "N/A"
    : new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: value < 1 ? 4 : 2,
      }).format(value);
}

export function formatReportDate(value: string | undefined): string {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatPlatform(value: string | undefined): string {
  if (!value) return "All platforms";
  const key = normalizedKey(value);
  if (key === "chatgpt") return "ChatGPT";
  if (key === "google" || key === "googleaioverview")
    return "Google AI Overview";
  if (key === "gemini") return "Gemini";
  if (key === "perplexity") return "Perplexity";
  if (key === "claude") return "Claude";
  return humanize(value);
}

export type SnapshotResult =
  | { status: "ok"; data: unknown }
  | { status: "skipped"; reason: string }
  | { status: "error"; error: string };

export type SnapshotData = {
  generatedAt: string;
  range: { startDate: string; endDate: string };
  sections: Record<string, SnapshotResult>;
};

export function parseSnapshotData(raw: string): SnapshotData | null {
  try {
    const root = asRecord(JSON.parse(raw));
    const sectionRecord = asRecord(root?.sections);
    if (!root || !sectionRecord) return null;
    const sections: Record<string, SnapshotResult> = {};
    for (const [type, value] of Object.entries(sectionRecord)) {
      const result = asRecord(value);
      const status = readString(result, ["status"]);
      if (status === "skipped") {
        sections[type] = {
          status,
          reason:
            readString(result, ["reason", "message"]) ?? "No data available",
        };
      } else if (status === "error") {
        sections[type] = {
          status,
          error: readString(result, ["error", "message"]) ?? "Unknown error",
        };
      } else {
        sections[type] = {
          status: "ok",
          data:
            status === "ok" && result && "data" in result ? result.data : value,
        };
      }
    }
    return {
      generatedAt: readString(root, ["generatedAt", "createdAt"]) ?? "",
      range: {
        startDate: readString(root, ["range.startDate", "startDate"]) ?? "",
        endDate: readString(root, ["range.endDate", "endDate"]) ?? "",
      },
      sections,
    };
  } catch {
    return null;
  }
}
