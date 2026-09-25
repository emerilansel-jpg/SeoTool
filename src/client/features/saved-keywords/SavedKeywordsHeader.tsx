import {
  Bookmark,
  ChevronDown,
  Download,
  FileDown,
  Loader2,
  RefreshCw,
  Sheet,
} from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";

export function SavedKeywordsHeader({
  totalCount,
  exporting,
  metricsRefreshing,
  onExportCsv,
  onExportSheets,
  onRefreshMetrics,
}: {
  totalCount: number;
  exporting: "csv" | "sheets" | null;
  metricsRefreshing: boolean;
  onExportCsv: () => void;
  onExportSheets: () => void;
  onRefreshMetrics: () => void;
}) {
  const disabled = totalCount === 0 || exporting != null;

  return (
    <FeatureHeader
      icon={Bookmark}
      title="Saved Keywords"
      badge="Keyword Watchlist & Collections"
      description="Save keyword ideas from research, organize them with tags, and revisit when you're ready to act."
      actions={
        <div className="flex items-center gap-2">
          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              disabled={disabled || metricsRefreshing}
              aria-haspopup="menu"
              className={`btn btn-ghost btn-sm gap-1.5 ${disabled || metricsRefreshing ? "btn-disabled" : ""}`}
            >
              <RefreshCw
                className={`size-4 ${metricsRefreshing ? "animate-spin" : ""}`}
              />
              {metricsRefreshing ? "Updating..." : "Actions"}
              <ChevronDown className="size-3 opacity-60" />
            </button>
            <ul
              tabIndex={0}
              role="menu"
              className="dropdown-content menu z-10 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            >
              <li>
                <button
                  type="button"
                  onClick={onRefreshMetrics}
                  disabled={disabled || metricsRefreshing}
                >
                  <RefreshCw className="size-4" />
                  <span className="flex flex-col items-start">
                    <span>Update keyword stats</span>
                    <span className="text-xs text-base-content/50">
                      Volume, difficulty &amp; CPC
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              disabled={disabled}
              aria-haspopup="menu"
              className={`btn btn-ghost btn-sm gap-1.5 ${disabled ? "btn-disabled" : ""}`}
            >
              {exporting != null ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Export
              <ChevronDown className="size-3 opacity-60" />
            </button>
            <ul
              tabIndex={0}
              role="menu"
              className="dropdown-content menu z-10 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            >
              <li>
                <button
                  type="button"
                  onClick={onExportSheets}
                  disabled={disabled}
                >
                  <Sheet className="size-4" />
                  Export to Sheets
                </button>
              </li>
              <li>
                <button type="button" onClick={onExportCsv} disabled={disabled}>
                  <FileDown className="size-4" />
                  Export CSV
                </button>
              </li>
            </ul>
          </div>
        </div>
      }
    />
  );
}
