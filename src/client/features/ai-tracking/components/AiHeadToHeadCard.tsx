import { Swords, Trophy } from "lucide-react";
import type { AiHeadToHeadRecord } from "@/types/schemas/ai-tracking";

interface Props {
  headToHead?: AiHeadToHeadRecord[];
  brandName: string;
}

export function AiHeadToHeadCard({ headToHead = [], brandName }: Props) {
  if (headToHead.length === 0) return null;

  return (
    <div className="rounded-2xl border border-base-300/80 bg-base-100 p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-base-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Swords className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-base-content">
                Head-to-Head Win-Loss Matrix
              </h3>
              <span className="badge badge-primary badge-sm font-semibold">
                Share of Model
              </span>
            </div>
            <p className="text-xs text-base-content/60">
              Direct recommendation matchups between {brandName} and competitors
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {headToHead.map((record) => {
          const total = record.totalPromptsCompared;
          const winPct = total > 0 ? (record.wins / total) * 100 : 0;
          const lossPct = total > 0 ? (record.losses / total) * 100 : 0;
          const tiePct = total > 0 ? (record.ties / total) * 100 : 0;

          return (
            <div
              key={record.competitorDomain}
              className="rounded-xl border border-base-300/80 bg-base-100 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-base-content">
                    vs. {record.competitorBrand || record.competitorDomain}
                  </h4>
                  <p className="text-[11px] text-base-content/50">
                    {record.competitorDomain} &middot; {total} queries compared
                  </p>
                </div>
                <span
                  className={`badge badge-sm font-bold ${
                    record.winRatePercent >= 50
                      ? "badge-success badge-soft"
                      : "badge-warning badge-soft"
                  }`}
                >
                  <Trophy className="size-3 mr-1" />
                  {record.winRatePercent}% Win Rate
                </span>
              </div>

              {/* Stacked Visual Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full flex rounded-full overflow-hidden bg-base-200">
                  <div
                    style={{ width: `${winPct}%` }}
                    className="bg-success transition-all"
                    title={`Wins: ${record.wins} (${Math.round(winPct)}%)`}
                  />
                  <div
                    style={{ width: `${tiePct}%` }}
                    className="bg-warning transition-all"
                    title={`Ties: ${record.ties} (${Math.round(tiePct)}%)`}
                  />
                  <div
                    style={{ width: `${lossPct}%` }}
                    className="bg-error transition-all"
                    title={`Losses: ${record.losses} (${Math.round(lossPct)}%)`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-base-content/70">
                  <span className="text-success">{record.wins} Wins</span>
                  <span className="text-warning">{record.ties} Ties</span>
                  <span className="text-error">{record.losses} Losses</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
