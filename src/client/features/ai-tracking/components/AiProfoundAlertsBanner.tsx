import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ProfoundAlert } from "@/types/schemas/ai-tracking";

interface Props {
  alerts: ProfoundAlert[];
}

export function AiProfoundAlertsBanner({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100/60 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content mr-2">
              Profound AI Intelligence
            </span>
            <span className="text-base-content/60">
              Baseline steady. No citation volatility anomalies detected across
              7-day model sampling.
            </span>
          </div>
        </div>
        <span className="badge badge-xs badge-outline text-[10px] shrink-0 font-medium text-base-content/60">
          Profound (live, confidence 0.90)
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Zap className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-base-content flex items-center gap-2">
              Profound AI Intelligence Alerts
              <span className="badge badge-xs badge-primary font-semibold">
                {alerts.length} New
              </span>
            </h3>
            <p className="text-[11px] text-base-content/60">
              Time-series spike, drop, and citation opportunity signals vs 7-day
              baseline
            </p>
          </div>
        </div>
        <span className="badge badge-sm badge-outline text-[11px] self-start sm:self-auto font-medium text-base-content/70">
          Profound (live, confidence 0.90)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {alerts.map((alert) => {
          const isSpike = alert.type === "spike";
          const isDrop = alert.type === "drop";
          const isThreat = alert.type === "competitor_threat";

          let borderClass = "border-info/30 bg-info/5";
          let badgeClass = "badge-info";
          let Icon = Info;

          if (isSpike) {
            borderClass = "border-success/30 bg-success/5";
            badgeClass = "badge-success";
            Icon = ArrowUpRight;
          } else if (isDrop) {
            borderClass = "border-warning/30 bg-warning/5";
            badgeClass = "badge-warning";
            Icon = ArrowDownRight;
          } else if (isThreat) {
            borderClass = "border-error/30 bg-error/5";
            badgeClass = "badge-error";
            Icon = AlertTriangle;
          }

          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-3 flex flex-col justify-between gap-2 ${borderClass}`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-base-content">
                    <Icon className="size-3.5 shrink-0" />
                    <span className="truncate">{alert.title}</span>
                  </div>
                  {alert.delta != null && (
                    <span className={`badge badge-xs font-bold ${badgeClass}`}>
                      {alert.delta > 0 ? `+${alert.delta}%` : `${alert.delta}%`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-base-content/70 leading-relaxed">
                  {alert.description}
                </p>
              </div>

              {alert.metric && (
                <div className="pt-1 border-t border-base-200/50 flex items-center justify-between text-[10px] text-base-content/60 font-mono">
                  <span>Current Metric:</span>
                  <span className="font-semibold text-base-content">
                    {alert.metric}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
