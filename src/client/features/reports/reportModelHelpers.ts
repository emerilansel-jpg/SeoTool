import {
  asRecord,
  readNumber,
  readString,
  readValue,
  type UnknownRecord,
} from "./reportDataCore";

export type ComparisonMetric = { current?: number; previous?: number };
export type Completeness = {
  label: string;
  detail?: string;
  percent?: number;
};

function metricPaths(names: readonly string[], previous = false): string[] {
  const bucket = previous ? "previous" : "current";
  const paths = names.flatMap((name) => [
    `summary.${bucket}.${name}`,
    `metrics.${bucket}.${name}`,
    `${bucket}.${name}`,
    `${bucket}${name.charAt(0).toUpperCase()}${name.slice(1)}`,
  ]);
  return previous
    ? paths
    : [
        ...paths,
        ...names.flatMap((name) => [
          `summary.${name}`,
          `metrics.${name}`,
          name,
        ]),
      ];
}

export function comparison(
  source: unknown,
  names: readonly string[],
  currentFallbacks: readonly string[] = [],
): ComparisonMetric {
  return {
    current: readNumber(source, [...metricPaths(names), ...currentFallbacks]),
    previous: readNumber(source, metricPaths(names, true)),
  };
}

export function trendLabel(row: UnknownRecord, index: number): string {
  const direct = readString(row, [
    "label",
    "date",
    "period",
    "snapshotDate",
    "runAt",
    "createdAt",
    "startedAt",
  ]);
  if (direct) {
    const d = new Date(direct);
    if (!Number.isNaN(d.getTime()) && direct.includes("T")) {
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
    return direct;
  }
  const year = readNumber(row, ["year"]);
  const month = readNumber(row, ["month"]);
  if (year !== undefined && month !== undefined) {
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
      undefined,
      {
        month: "short",
        year: "numeric",
      },
    );
  }
  return `Row ${index + 1}`;
}

export function completeness(source: unknown): Completeness | undefined {
  const raw = readValue(source, [
    "completeness",
    "dataCompleteness",
    "coverage",
    "current.dataCompletenessPct",
  ]);
  if (typeof raw === "string") return { label: capitalize(raw) };
  if (typeof raw === "number") return { label: "Data coverage", percent: raw };
  const record = asRecord(raw);
  if (!record) return undefined;
  const done = readNumber(record, [
    "complete",
    "completed",
    "successful",
    "available",
    "successfulObservations",
  ]);
  const total = readNumber(record, [
    "total",
    "expected",
    "requested",
    "totalObservations",
  ]);
  const percent =
    readNumber(record, ["percent", "percentage", "rate", "completenessPct"]) ??
    (done !== undefined && total ? (done / total) * 100 : undefined);
  const status = readString(record, ["label", "status"]);
  const detail = readString(record, ["detail", "reason", "note", "message"]);
  if (status || detail || percent !== undefined) {
    return {
      label: status ? capitalize(status) : "Data coverage",
      detail,
      percent,
    };
  }
  return undefined;
}

export function derivedCompleteness(
  source: unknown,
  donePaths: readonly string[],
  totalPaths: readonly string[],
): Completeness | undefined {
  const existing = completeness(source);
  if (existing) return existing;
  const done = readNumber(source, donePaths);
  const total = readNumber(source, totalPaths);
  if (done === undefined || !total) return undefined;
  return {
    label: "Data coverage",
    detail: `${formatInteger(done)} of ${formatInteger(total)} complete`,
    percent: (done / total) * 100,
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    value,
  );
}
