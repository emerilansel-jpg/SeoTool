import { ExternalLink, MapPin, X } from "lucide-react";
import { Modal } from "@/client/components/Modal";
import type { GmbPinCompetitor, GmbSnapshotMarker } from "./GmbMap";

export function PinCompetitorsModal({
  pin,
  onClose,
}: {
  pin: GmbSnapshotMarker;
  onClose: () => void;
}) {
  let competitors: GmbPinCompetitor[] = [];
  if (pin.itemsJson) {
    try {
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
      competitors = JSON.parse(pin.itemsJson);
    } catch {
      competitors = [];
    }
  }

  return (
    <Modal
      maxWidth="max-w-xl"
      onClose={onClose}
      labelledBy="pin-competitors-title"
    >
      <div className="flex items-center justify-between pb-2 border-b border-base-200">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <h3 id="pin-competitors-title" className="text-base font-bold">
            Pin Details ({pin.lat.toFixed(4)}, {pin.lng.toFixed(4)})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 py-2 bg-base-200/50 rounded-lg px-3">
        <div>
          <span className="text-xs text-base-content/60 block">Target Rank</span>
          <span
            className={`text-lg font-black ${
              pin.rank != null && pin.rank <= 3
                ? "text-success"
                : pin.rank != null && pin.rank <= 10
                  ? "text-warning"
                  : pin.rank != null
                    ? "text-error"
                    : "text-base-content/40"
            }`}
          >
            {pin.rank != null ? `#${pin.rank}` : "Not Found"}
          </span>
        </div>
        <div className="divider divider-horizontal my-0" />
        <div>
          <span className="text-xs text-base-content/60 block">Status</span>
          <span className="badge badge-sm badge-outline uppercase font-mono text-[10px]">
            {pin.status}
          </span>
        </div>
        {pin.gridRow !== undefined && pin.gridCol !== undefined && (
          <>
            <div className="divider divider-horizontal my-0" />
            <div>
              <span className="text-xs text-base-content/60 block">Position</span>
              <span className="text-xs font-mono">
                Row {pin.gridRow + 1}, Col {pin.gridCol + 1}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
          Top Google Maps Competitors at this Point
        </h4>

        {competitors.length > 0 ? (
          <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1">
            {competitors.map((comp) => (
              <div
                key={`${comp.rank}-${comp.title}`}
                className="flex items-start gap-2.5 p-2 rounded-lg border border-base-200 bg-base-100 text-xs hover:border-base-300 transition-colors"
              >
                <div
                  className={`size-6 rounded-md flex items-center justify-center font-bold shrink-0 text-[11px] ${
                    comp.rank <= 3
                      ? "bg-success/20 text-success"
                      : comp.rank <= 10
                        ? "bg-warning/20 text-warning"
                        : "bg-neutral/20 text-base-content/60"
                  }`}
                >
                  {comp.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold truncate text-sm">
                      {comp.title}
                    </span>
                    {comp.url && (
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline inline-flex items-center shrink-0"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  {comp.address && (
                    <p className="text-[11px] text-base-content/60 truncate mt-0.5">
                      {comp.address}
                    </p>
                  )}
                  {comp.category && (
                    <span className="badge badge-xs badge-ghost mt-1 text-[10px]">
                      {comp.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-base-300 rounded-lg text-xs text-base-content/50">
            <p>No competitor SERP items cached for this historical point.</p>
            <p className="mt-1 text-[11px] text-base-content/40">
              New scans capture full Google Maps top 20 rankings per pin.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
