import type { ReportSchedule } from "@/types/schemas/reports";

/** Compute the next run timestamp (ISO UTC) for a weekly/monthly schedule. */
export function computeNextRunAt(
  schedule: ReportSchedule,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  from: Date = new Date(),
): string | null {
  if (schedule === "none") return null;
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

  // monthly
  const target = Math.min(dayOfMonth ?? 1, 28);
  const day = next.getUTCDate();
  if (day < target) {
    next.setUTCDate(target);
  } else {
    next.setUTCMonth(next.getUTCMonth() + 1, target);
  }
  return next.toISOString();
}
