/**
 * Alert condition evaluator — pure functions for unit-testability.
 *
 * Each evaluator takes the alert condition config + the relevant data snapshot
 * and returns either `null` (condition not met) or an `AlertTrigger` describing
 * what fired (used in the email notification).
 */

export interface AlertCondition {
  threshold: number;
  keyword?: string;
  device?: "desktop" | "mobile";
}

export interface RankSnapshotInput {
  keyword: string;
  device: string;
  position: number | null;
  url: string | null;
}

export interface AlertTrigger {
  summary: string;
  details: string[];
}

/**
 * Evaluates a rank-drop alert. Triggers when any tracked keyword's position
 * worsens by more than `condition.threshold` positions compared to the previous
 * snapshot.
 *
 * `null` position means "not ranking" — treated as position Infinity for
 * comparison purposes (a drop from #5 to not-ranking is an infinite drop).
 */
export function evaluateRankDrop(
  condition: AlertCondition,
  current: RankSnapshotInput[],
  previous: RankSnapshotInput[],
): AlertTrigger | null {
  const threshold = condition.threshold;

  // Optional keyword filter
  const filtered = condition.keyword
    ? current.filter(
        (s) => s.keyword.toLowerCase() === condition.keyword!.toLowerCase(),
      )
    : current;

  if (filtered.length === 0) return null;

  // Optional device filter
  const deviceFiltered = condition.device
    ? filtered.filter((s) => s.device === condition.device)
    : filtered;

  const dropped: {
    keyword: string;
    device: string;
    from: number;
    to: string;
  }[] = [];

  for (const snap of deviceFiltered) {
    const prev = previous.find(
      (p) =>
        p.keyword.toLowerCase() === snap.keyword.toLowerCase() &&
        p.device === snap.device,
    );

    const currentPos = snap.position ?? Infinity;
    const prevPos = prev?.position ?? Infinity;

    // Position numbers are "higher = worse" in SEO (position 1 is best)
    const drop = currentPos - prevPos;

    if (drop >= threshold) {
      dropped.push({
        keyword: snap.keyword,
        device: snap.device,
        from: prev?.position ?? 0, // 0 means "wasn't tracked before"
        to: snap.position === null ? "Not ranking" : `#${snap.position}`,
      });
    }
  }

  if (dropped.length === 0) return null;

  return {
    summary: `${dropped.length} keyword${dropped.length > 1 ? "s" : ""} dropped by ${threshold}+ positions`,
    details: dropped.map(
      (d) =>
        `"${d.keyword}" (${d.device || "all devices"}): ${d.from === 0 ? "new" : `#${d.from}`} → ${d.to}`,
    ),
  };
}

/**
 * Evaluates an audit-critical alert. Triggers when the latest completed audit
 * has critical issues count >= `condition.threshold`.
 */
export function evaluateAuditCritical(
  condition: AlertCondition,
  criticalIssueCount: number,
  auditDate: Date | null,
): AlertTrigger | null {
  if (criticalIssueCount < condition.threshold) return null;

  return {
    summary: `${criticalIssueCount} critical issue${criticalIssueCount > 1 ? "s" : ""} found in latest audit`,
    details: [
      `Threshold: ${condition.threshold} critical issues`,
      auditDate
        ? `Audit date: ${auditDate.toISOString().split("T")[0]}`
        : "Audit date: unknown",
    ],
  };
}
