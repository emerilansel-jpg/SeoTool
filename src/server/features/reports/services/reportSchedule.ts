import type { ReportSchedule } from "@/types/schemas/reports";

/** Compute the next run timestamp (ISO UTC) for a weekly/monthly/yearly schedule. */
export function computeNextRunAt(
  schedule: ReportSchedule,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  fromOrMonth?: Date | number | null,
  monthOrFrom?: number | Date | null,
): string | null {
  if (schedule === "none") return null;

  let from = new Date();
  let monthOfYear: number | null = null;

  if (fromOrMonth instanceof Date) {
    from = fromOrMonth;
    if (typeof monthOrFrom === "number") monthOfYear = monthOrFrom;
  } else if (typeof fromOrMonth === "number") {
    monthOfYear = fromOrMonth;
    if (monthOrFrom instanceof Date) from = monthOrFrom;
  } else if (monthOrFrom instanceof Date) {
    from = monthOrFrom;
  }

  const next = new Date(from);
  next.setUTCHours(8, 0, 0, 0); // default 08:00 UTC dispatch window

  if (schedule === "weekly") {
    const target = dayOfWeek ?? 1; // default Monday
    const cur = next.getUTCDay();
    let diff = (target - cur + 7) % 7;
    if (diff === 0) diff = 7; // always next occurrence, not today
    next.setUTCDate(next.getUTCDate() + diff);
    return next.toISOString();
  }

  if (schedule === "monthly") {
    const target = Math.min(dayOfMonth ?? 1, 28);
    const day = next.getUTCDate();
    if (day < target) {
      next.setUTCDate(target);
    } else {
      next.setUTCMonth(next.getUTCMonth() + 1, target);
    }
    return next.toISOString();
  }

  // yearly
  const targetMonth = Math.max(0, Math.min((monthOfYear ?? 1) - 1, 11));
  const targetDay = Math.max(1, Math.min(dayOfMonth ?? 1, 28));
  const curMonth = from.getUTCMonth();
  const curDay = from.getUTCDate();

  const isAheadThisYear =
    curMonth < targetMonth || (curMonth === targetMonth && curDay < targetDay);

  const targetYear = isAheadThisYear
    ? from.getUTCFullYear()
    : from.getUTCFullYear() + 1;

  const yearlyRun = new Date(
    Date.UTC(targetYear, targetMonth, targetDay, 8, 0, 0, 0),
  );
  return yearlyRun.toISOString();
}
