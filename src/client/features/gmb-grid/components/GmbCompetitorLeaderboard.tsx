// oxlint-disable
import { useState, useMemo } from "react";
import { Star, Trophy, Search, ExternalLink } from "lucide-react";
import type { GmbSnapshotMarker, GmbPinCompetitor } from "./GmbMap";

export interface AggregatedCompetitor {
  id: string;
  title: string;
  placeId?: string | null;
  category?: string | null;
  address?: string | null;
  url?: string | null;
  ratingValue?: number | null;
  votesCount?: number | null;
  totalAppearances: number;
  top3Count: number;
  top10Count: number;
  bestRank: number;
  averageRank: number;
  solvPercentage: number;
  isTarget: boolean;
}

export function aggregateGridCompetitors(
  snapshots: GmbSnapshotMarker[],
  targetBusinessName?: string,
  targetPlaceId?: string | null,
): AggregatedCompetitor[] {
  const map = new Map<
    string,
    {
      title: string;
      placeId?: string | null;
      category?: string | null;
      address?: string | null;
      url?: string | null;
      ratingValue?: number | null;
      votesCount?: number | null;
      ranks: number[];
      top3: number;
      top10: number;
      isTarget: boolean;
    }
  >();

  const totalPoints = snapshots.length || 1;

  for (const snap of snapshots) {
    if (!snap.itemsJson) continue;
    let items: GmbPinCompetitor[] = [];
    try {
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
      items = JSON.parse(snap.itemsJson);
    } catch {
      continue;
    }

    for (const item of items) {
      if (!item.title) continue;
      const key = item.placeId || item.title.toLowerCase().trim();
      const isTarget =
        (Boolean(targetPlaceId) && item.placeId === targetPlaceId) ||
        (Boolean(targetBusinessName) &&
          item.title.toLowerCase().trim() ===
            targetBusinessName?.toLowerCase().trim());

      const existing = map.get(key);
      const rank = item.rank;

      if (!existing) {
        map.set(key, {
          title: item.title,
          placeId: item.placeId,
          category: item.category,
          address: item.address,
          url: item.url,
          ratingValue: item.rating?.value,
          votesCount: item.rating?.votes_count,
          ranks: [rank],
          top3: rank <= 3 ? 1 : 0,
          top10: rank <= 10 ? 1 : 0,
          isTarget,
        });
      } else {
        existing.ranks.push(rank);
        if (rank <= 3) existing.top3 += 1;
        if (rank <= 10) existing.top10 += 1;
        if (!existing.ratingValue && item.rating?.value) {
          existing.ratingValue = item.rating.value;
          existing.votesCount = item.rating.votes_count;
        }
        if (!existing.category && item.category) {
          existing.category = item.category;
        }
        if (!existing.address && item.address) {
          existing.address = item.address;
        }
      }
    }
  }

  const result: AggregatedCompetitor[] = [];
  map.forEach((val, key) => {
    const totalAppearances = val.ranks.length;
    const sum = val.ranks.reduce((a, b) => a + b, 0);
    const averageRank = Number((sum / (totalAppearances || 1)).toFixed(1));
    const bestRank = Math.min(...val.ranks);
    const solvPercentage = Number(
      ((val.top3 / totalPoints) * 100).toFixed(1),
    );

    result.push({
      id: key,
      title: val.title,
      placeId: val.placeId,
      category: val.category,
      address: val.address,
      url: val.url,
      ratingValue: val.ratingValue,
      votesCount: val.votesCount,
      totalAppearances,
      top3Count: val.top3,
      top10Count: val.top10,
      bestRank,
      averageRank,
      solvPercentage,
      isTarget: val.isTarget,
    });
  });

  // Sort default: Target business or highest SoLV
  return result.sort((a, b) => {
    if (a.isTarget && !b.isTarget) return -1;
    if (!a.isTarget && b.isTarget) return 1;
    if (b.top3Count !== a.top3Count) return b.top3Count - a.top3Count;
    return a.averageRank - b.averageRank;
  });
}

export function GmbCompetitorLeaderboard({
  snapshots,
  targetBusinessName,
  targetPlaceId,
}: {
  snapshots: GmbSnapshotMarker[];
  targetBusinessName?: string;
  targetPlaceId?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"solv" | "rank" | "reviews">("solv");

  const competitors = useMemo(
    () =>
      aggregateGridCompetitors(snapshots, targetBusinessName, targetPlaceId),
    [snapshots, targetBusinessName, targetPlaceId],
  );

  const filtered = useMemo(() => {
    let list = competitors;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => {
      if (a.isTarget && !b.isTarget) return -1;
      if (!a.isTarget && b.isTarget) return 1;
      if (sortBy === "solv") return b.solvPercentage - a.solvPercentage;
      if (sortBy === "rank") return a.averageRank - b.averageRank;
      if (sortBy === "reviews") return (b.votesCount ?? 0) - (a.votesCount ?? 0);
      return 0;
    });
  }, [competitors, search, sortBy]);

  const totalPoints = snapshots.length;

  return (
    <div className="flex h-full flex-col rounded-xl border border-base-300 bg-base-100 shadow-md overflow-hidden">
      {/* Header bar */}
      <div className="border-b border-base-200 bg-base-200/50 p-3 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-warning" />
            <h3 className="font-bold text-sm">Competitor Leaderboard</h3>
            <span className="badge badge-sm badge-ghost font-mono">
              {competitors.length} competitors across {totalPoints} pins
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Filter competitor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-xs input-bordered pl-8 w-36 sm:w-44 rounded-lg"
              />
            </div>
            <div className="join border border-base-300 rounded-lg">
              <button
                type="button"
                className={`join-item btn btn-xs ${
                  sortBy === "solv" ? "btn-primary font-bold" : "btn-ghost text-xs"
                }`}
                onClick={() => setSortBy("solv")}
                title="Sort by Share of Local Voice (Top 3)"
              >
                SoLV %
              </button>
              <button
                type="button"
                className={`join-item btn btn-xs ${
                  sortBy === "rank" ? "btn-primary font-bold" : "btn-ghost text-xs"
                }`}
                onClick={() => setSortBy("rank")}
                title="Sort by Average Rank"
              >
                Avg Rank
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="table table-xs w-full">
          <thead>
            <tr className="border-b border-base-200 bg-base-100 text-[11px] uppercase tracking-wider text-base-content/60">
              <th>Business Name</th>
              <th className="text-center">SoLV (Top 3)</th>
              <th className="text-center">Avg Rank</th>
              <th className="text-center">Pins (Top 10)</th>
              <th>Reviews & Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((comp, idx) => (
                <tr
                  key={comp.id}
                  className={`hover:bg-base-200/50 transition-colors ${
                    comp.isTarget
                      ? "bg-primary/5 font-semibold text-primary border-l-4 border-l-primary"
                      : ""
                  }`}
                >
                  <td className="max-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-base-content/40 w-4">
                        {idx + 1}
                      </span>
                      <span className="truncate text-xs font-bold text-base-content" title={comp.title}>
                        {comp.title}
                      </span>
                      {comp.isTarget && (
                        <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase tracking-wide shrink-0">
                          YOU
                        </span>
                      )}
                      {comp.url && (
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:opacity-80 shrink-0 inline-flex items-center"
                        >
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </div>
                    {comp.category && (
                      <p className="text-[10px] text-base-content/50 truncate pl-5">
                        {comp.category}
                      </p>
                    )}
                  </td>

                  <td className="text-center">
                    <span
                      className={`badge badge-sm font-bold font-mono ${
                        comp.solvPercentage >= 50
                          ? "badge-success"
                          : comp.solvPercentage >= 20
                            ? "badge-warning"
                            : "badge-ghost"
                      }`}
                    >
                      {comp.solvPercentage}%
                    </span>
                    <span className="block text-[9px] text-base-content/40 mt-0.5">
                      {comp.top3Count}/{totalPoints} pins
                    </span>
                  </td>

                  <td className="text-center font-mono font-bold text-xs">
                    <span
                      className={
                        comp.averageRank <= 3
                          ? "text-success font-extrabold"
                          : comp.averageRank <= 10
                            ? "text-warning"
                            : "text-error"
                      }
                    >
                      #{comp.averageRank}
                    </span>
                    <span className="block text-[9px] text-base-content/40 font-normal">
                      Best #{comp.bestRank}
                    </span>
                  </td>

                  <td className="text-center font-mono text-xs">
                    <span className="font-semibold text-base-content/80">
                      {comp.top10Count}
                    </span>
                    <span className="text-[10px] text-base-content/40">
                      /{totalPoints}
                    </span>
                  </td>

                  <td>
                    {comp.ratingValue != null ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-amber-500">
                          {comp.ratingValue.toFixed(1)}
                        </span>
                        {comp.votesCount != null && (
                          <span className="text-[10px] text-base-content/50">
                            ({comp.votesCount})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-base-content/30">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-base-content/50">
                  No competitors found matching &quot;{search}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
