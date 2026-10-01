/** Pure volatility computation functions. No DB calls or side effects. */

export type PositionChange = {
  currentPosition: number | null;
  previousPosition: number | null;
  unrankedPosition: number;
};

export type KeywordPositionChange = PositionChange & {
  keyword: string;
};

export type TopMover = {
  keyword: string;
  currentPosition: number | null;
  previousPosition: number | null;
  change: number;
  status: "new" | "dropped" | "improved" | "declined" | "unchanged";
};

function effectivePosition(
  position: number | null,
  unrankedPosition: number,
): number {
  return position ?? unrankedPosition;
}

export function getPositionChange(change: PositionChange): number {
  return (
    effectivePosition(change.previousPosition, change.unrankedPosition) -
    effectivePosition(change.currentPosition, change.unrankedPosition)
  );
}

/**
 * Score absolute movement magnitude, breadth, and ranking entries/exits.
 * Magnitude contributes 50 points, breadth 30, and new/dropped terms 20.
 */
export function calculateVolatilityScore(changes: PositionChange[]): number {
  if (changes.length === 0) return 0;

  let absoluteMovement = 0;
  let moving = 0;
  let newOrDropped = 0;

  for (const change of changes) {
    const delta = getPositionChange(change);
    absoluteMovement += Math.abs(delta);
    if (delta !== 0) moving += 1;
    if (
      (change.currentPosition === null) !==
      (change.previousPosition === null)
    ) {
      newOrDropped += 1;
    }
  }

  const meanAbsolute = absoluteMovement / changes.length;
  const magnitudeScore = Math.min(meanAbsolute / 10, 1) * 50;
  const breadthScore = (moving / changes.length) * 30;
  const entryExitScore = (newOrDropped / changes.length) * 20;

  return Math.min(
    100,
    Math.round((magnitudeScore + breadthScore + entryExitScore) * 100) / 100,
  );
}

/** Largest effective position changes. Positive means improved or newly ranked. */
export function identifyTopMovers(
  changes: KeywordPositionChange[],
): TopMover[] {
  return changes
    .map((change): TopMover => {
      const delta = getPositionChange(change);
      const status =
        change.previousPosition === null && change.currentPosition !== null
          ? "new"
          : change.previousPosition !== null && change.currentPosition === null
            ? "dropped"
            : delta > 0
              ? "improved"
              : delta < 0
                ? "declined"
                : "unchanged";

      return {
        keyword: change.keyword,
        currentPosition: change.currentPosition,
        previousPosition: change.previousPosition,
        change: delta,
        status,
      };
    })
    .filter((mover) => mover.change !== 0)
    .toSorted((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);
}

export function categorizeVolatility(
  score: number,
): "low" | "moderate" | "high" | "extreme" {
  if (score < 20) return "low";
  if (score < 50) return "moderate";
  if (score < 80) return "high";
  return "extreme";
}
