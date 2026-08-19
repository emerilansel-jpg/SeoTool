/**
 * Pure volatility computation functions — no DB calls, no side effects.
 */

export type TopMover = {
  keyword: string;
  currentPosition: number | null;
  previousPosition: number | null;
  change: number; // positive = improved, negative = dropped
};

/**
 * Compute a 0-100 volatility score from an array of day-over-day position
 * changes. Uses normalized standard deviation: (stdDev / meanAbsolute) * 10,
 * capped at 100. Returns 0 for empty input.
 */
export function calculateVolatilityScore(positionChanges: number[]): number {
  if (positionChanges.length === 0) return 0;

  const mean =
    positionChanges.reduce((sum, v) => sum + v, 0) / positionChanges.length;
  const variance =
    positionChanges.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
    positionChanges.length;
  const stdDev = Math.sqrt(variance);

  // Normalize by mean absolute change so the score is scale-invariant.
  const meanAbsolute =
    positionChanges.reduce((sum, v) => sum + Math.abs(v), 0) /
    positionChanges.length;

  if (meanAbsolute === 0) return 0;

  const score = (stdDev / meanAbsolute) * 10;
  return Math.min(100, Math.round(score * 100) / 100);
}

/**
 * Identify the top 5 movers (largest absolute position change).
 * Change is positive when a keyword improved (lower position number = better).
 */
export function identifyTopMovers(
  changes: {
    keyword: string;
    currentPosition: number | null;
    previousPosition: number | null;
  }[],
): TopMover[] {
  const withChange: TopMover[] = changes
    .filter((c) => c.currentPosition != null || c.previousPosition != null)
    .map((c) => {
      const prev = c.previousPosition ?? 0;
      const curr = c.currentPosition ?? 0;
      return {
        keyword: c.keyword,
        currentPosition: c.currentPosition,
        previousPosition: c.previousPosition,
        change: prev - curr, // positive = improved rank
      };
    });

  return withChange
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);
}

/**
 * Categorize a volatility score into a human-readable bucket.
 */
export function categorizeVolatility(
  score: number,
): "low" | "moderate" | "high" | "extreme" {
  if (score < 20) return "low";
  if (score < 50) return "moderate";
  if (score < 80) return "high";
  return "extreme";
}
