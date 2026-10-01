import type { ReportPeriod } from "@/types/schemas/reports";

export type ReportDateRange = {
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
  days: number;
};

const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Resolve standard report date ranges:
 * weekly = last 7 complete days
 * monthly = last 30 complete days
 * yearly = last 365 complete days
 * ending yesterday UTC. Previous period has identical duration.
 */
export function resolveReportPeriodRange(
  period: ReportPeriod = "monthly",
  now: Date = new Date(),
): ReportDateRange {
  const days = period === "weekly" ? 7 : period === "yearly" ? 365 : 30;

  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  const start = new Date(
    Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate() - (days - 1),
    ),
  );

  const prevEnd = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() - 1,
    ),
  );
  const prevStart = new Date(
    Date.UTC(
      prevEnd.getUTCFullYear(),
      prevEnd.getUTCMonth(),
      prevEnd.getUTCDate() - (days - 1),
    ),
  );

  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
    prevStartDate: toIsoDate(prevStart),
    prevEndDate: toIsoDate(prevEnd),
    days,
  };
}
