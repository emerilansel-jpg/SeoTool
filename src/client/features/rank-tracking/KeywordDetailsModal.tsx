import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Globe,
  Loader2,
  Minus,
  Monitor,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/client/components/Modal";
import { buildCsv, downloadCsv } from "@/client/lib/csv";
import { captureClientEvent } from "@/client/lib/posthog";
import { LOCATIONS } from "@/client/features/keywords/locations";
import { formatLocationLabel } from "@/shared/keyword-locations";
import { SerpSnapshotViewer } from "@/client/features/serp-snapshots/SerpSnapshotViewer";
import { getKeywordIntelligenceDetail } from "@/serverFunctions/rank-tracking";
import { KeywordIntelligenceCards } from "./KeywordIntelligenceCards";
import { KeywordDistributionChart } from "./KeywordDistributionChart";

export interface KeywordDetailsTarget {
  trackingKeywordId: string;
  keyword: string;
}

interface Props {
  target: KeywordDetailsTarget;
  projectId: string;
  configId: string;
  domain: string;
  locationCode: number;
  locationName?: string;
  serpDepth: number;
  configDevices?: "both" | "desktop" | "mobile";
  onClose: () => void;
}

type TimeframePreset = "1d" | "daily" | "weekly" | "monthly";

export function KeywordDetailsModal({
  target,
  projectId,
  configId,
  domain,
  locationCode,
  locationName,
  configDevices = "both",
  onClose,
}: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">(
    configDevices === "mobile" ? "mobile" : "desktop",
  );
  const [timeframe, setTimeframe] = useState<TimeframePreset>("daily");
  const [activeTab, setActiveTab] = useState<"intelligence" | "serp">(
    "intelligence",
  );

  const sinceDays = useMemo(() => {
    switch (timeframe) {
      case "1d":
        return 7;
      case "daily":
        return 30;
      case "weekly":
        return 90;
      case "monthly":
        return 365;
    }
  }, [timeframe]);

  const { data: detail, isLoading } = useQuery({
    queryKey: [
      "keywordIntelligenceDetail",
      projectId,
      configId,
      target.trackingKeywordId,
      device,
      sinceDays,
    ],
    queryFn: () =>
      getKeywordIntelligenceDetail({
        data: {
          projectId,
          configId,
          trackingKeywordId: target.trackingKeywordId,
          device,
          sinceDays,
        },
      }),
  });

  const handleExportCsv = () => {
    if (!detail?.historyPoints) return;
    const headers = ["Date", "Position", "Previous Position", "Change"];
    const rows = detail.historyPoints.map((p) => [
      p.date,
      p.position ?? "Not in top 100",
      p.previousPosition ?? "—",
      p.change > 0 ? `+${p.change}` : p.change,
    ]);
    downloadCsv(
      `keyword-intelligence-${domain}-${target.keyword.replace(/\s+/g, "-")}.csv`,
      buildCsv(headers, rows),
    );
    toast.success("CSV export downloaded");
    captureClientEvent("rank_tracking:keyword_export_csv");
  };

  const handleCopy = () => {
    if (!detail?.historyPoints) return;
    const headers = ["Date", "Position", "Change"];
    const rows = detail.historyPoints.map((p) => [
      p.date,
      p.position ?? "N/A",
      p.change > 0 ? `+${p.change}` : p.change,
    ]);
    void navigator.clipboard.writeText(buildCsv(headers, rows));
    toast.success("Copied to clipboard");
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="keyword-details-title"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 border-b border-base-300/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm font-semibold uppercase tracking-wider">
                Keyword Details
              </span>
              <h2
                id="keyword-details-title"
                className="text-xl font-bold tracking-tight text-base-content"
              >
                {target.keyword}
              </h2>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-base-content/60">
              <Globe className="size-3.5 text-primary" />
              <span className="font-medium text-base-content/80">{domain}</span>
              <span>&middot;</span>
              <span>
                {locationName
                  ? formatLocationLabel(locationName, 2)
                  : (LOCATIONS[locationCode] ?? "US")}
              </span>
              <span>&middot;</span>
              <span className="capitalize">{device} SERP</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {configDevices === "both" && (
              <div className="join border border-base-300">
                <button
                  type="button"
                  className={`join-item btn btn-xs gap-1.5 ${device === "desktop" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setDevice("desktop")}
                >
                  <Monitor className="size-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  className={`join-item btn btn-xs gap-1.5 ${device === "mobile" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setDevice("mobile")}
                >
                  <Smartphone className="size-3.5" /> Mobile
                </button>
              </div>
            )}

            <div className="join border border-base-300">
              <button
                type="button"
                className={`join-item btn btn-xs ${timeframe === "1d" ? "btn-neutral" : "btn-ghost"}`}
                onClick={() => setTimeframe("1d")}
              >
                1d History
              </button>
              <button
                type="button"
                className={`join-item btn btn-xs ${timeframe === "daily" ? "btn-neutral" : "btn-ghost"}`}
                onClick={() => setTimeframe("daily")}
              >
                Daily
              </button>
              <button
                type="button"
                className={`join-item btn btn-xs ${timeframe === "weekly" ? "btn-neutral" : "btn-ghost"}`}
                onClick={() => setTimeframe("weekly")}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`join-item btn btn-xs ${timeframe === "monthly" ? "btn-neutral" : "btn-ghost"}`}
                onClick={() => setTimeframe("monthly")}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div
          role="tablist"
          className="tabs tabs-boxed tabs-sm w-fit bg-base-200"
        >
          <button
            role="tab"
            className={`tab gap-1.5 font-medium ${activeTab === "intelligence" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("intelligence")}
          >
            <Activity className="size-3.5" /> Intelligence Overview
          </button>
          <button
            role="tab"
            className={`tab gap-1.5 font-medium ${activeTab === "serp" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("serp")}
          >
            <Globe className="size-3.5" /> Live SERP Composition
          </button>
        </div>

        {activeTab === "serp" ? (
          <SerpSnapshotViewer
            projectId={projectId}
            trackingKeywordId={target.trackingKeywordId}
            keyword={target.keyword}
            defaultDevice={device}
          />
        ) : isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : !detail ? (
          <div className="rounded-2xl border border-dashed border-base-300 p-12 text-center text-sm text-base-content/60">
            No rank tracking data found for this keyword yet. Run a check to
            gather SERP intelligence.
          </div>
        ) : (
          <div className="space-y-6">
            <KeywordIntelligenceCards detail={detail} />

            <KeywordDistributionChart detail={detail} />

            {/* Checkpoint History Table */}
            <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-3 bg-base-200/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Daily Checkpoint History
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={handleCopy}
                  >
                    <Copy className="size-3" /> Copy
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={handleExportCsv}
                  >
                    <Download className="size-3" /> Export CSV
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                <table className="table table-sm">
                  <thead>
                    <tr className="text-xs text-base-content/60">
                      <th>Check Timestamp</th>
                      <th>SERP Position</th>
                      <th>Previous</th>
                      <th className="text-right">Net Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.historyPoints.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-xs text-base-content/50"
                        >
                          No historical check entries found.
                        </td>
                      </tr>
                    ) : (
                      detail.historyPoints.map((row, idx) => (
                        <tr key={idx} className="hover">
                          <td className="text-xs font-medium text-base-content">
                            {row.date}
                          </td>
                          <td className="font-mono text-xs font-bold">
                            {row.position !== null
                              ? `#${row.position}`
                              : "Not in Top 100"}
                          </td>
                          <td className="font-mono text-xs text-base-content/60">
                            {row.previousPosition !== null
                              ? `#${row.previousPosition}`
                              : "—"}
                          </td>
                          <td className="text-right font-mono text-xs font-semibold">
                            {row.change > 0 ? (
                              <span className="text-success inline-flex items-center gap-0.5">
                                <ArrowUp className="size-3" /> +{row.change}
                              </span>
                            ) : row.change < 0 ? (
                              <span className="text-error inline-flex items-center gap-0.5">
                                <ArrowDown className="size-3" /> {row.change}
                              </span>
                            ) : (
                              <span className="text-base-content/40 inline-flex items-center gap-0.5">
                                <Minus className="size-3" /> 0
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
