import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Star,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { GmbPinCompetitor, GmbSnapshotMarker } from "./GmbMap";

export function calculateDistanceAndDirection(
  centerLat: number,
  centerLng: number,
  pinLat: number,
  pinLng: number,
  unit: "mi" | "km" = "mi",
): string {
  const R = 6371e3; // meters
  const phi1 = (centerLat * Math.PI) / 180;
  const phi2 = (pinLat * Math.PI) / 180;
  const deltaPhi = ((pinLat - centerLat) * Math.PI) / 180;
  const deltaLambda = ((pinLng - centerLng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;

  if (meters < 80) {
    return "At business center";
  }

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dirIndex = Math.round(brng / 45) % 8;
  const cardinal = directions[dirIndex];

  if (unit === "km") {
    const km = (meters / 1000).toFixed(1);
    return `${km} km ${cardinal}`;
  }
  const mi = (meters / 1609.34).toFixed(1);
  return `${mi} mi ${cardinal}`;
}

export function GmbPinInspector({
  pin,
  centerLat,
  centerLng,
  targetBusinessName,
  targetPlaceId,
  unit = "mi",
  onClose,
  onPrevPin,
  onNextPin,
}: {
  pin: GmbSnapshotMarker;
  centerLat?: number;
  centerLng?: number;
  targetBusinessName?: string;
  targetPlaceId?: string | null;
  unit?: "mi" | "km";
  onClose: () => void;
  onPrevPin?: () => void;
  onNextPin?: () => void;
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

  const distanceText =
    centerLat && centerLng
      ? calculateDistanceAndDirection(
          centerLat,
          centerLng,
          pin.lat,
          pin.lng,
          unit,
        )
      : null;

  const rankVal = pin.rank;
  const isRanked = rankVal != null;
  const isTop3 = rankVal != null && rankVal <= 3;
  const isTop10 = rankVal != null && rankVal <= 10;

  return (
    <div className="flex h-full flex-col rounded-xl border border-base-300 bg-base-100 shadow-md overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-base-200 bg-base-200/50 p-3 sm:px-4">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`size-8 rounded-full flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-xs ${
              pin.status === "failed"
                ? "bg-slate-700"
                : pin.rank == null
                  ? "bg-slate-500"
                  : isTop3
                    ? "bg-emerald-500"
                    : isTop10
                      ? "bg-amber-500"
                      : "bg-rose-500"
            }`}
          >
            {pin.status === "failed" ? "!" : pin.rank == null ? "-" : pin.rank}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate flex items-center gap-1.5">
              <span>
                {pin.gridRow != null && pin.gridCol != null
                  ? `Pin (${pin.gridRow + 1}, ${pin.gridCol + 1})`
                  : "Grid Pin Details"}
              </span>
              {distanceText && (
                <span className="badge badge-xs badge-ghost font-mono">
                  {distanceText}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-base-content/60 truncate font-mono">
              {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onPrevPin && (
            <button
              type="button"
              onClick={onPrevPin}
              className="btn btn-ghost btn-xs btn-square"
              title="Previous pin"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {onNextPin && (
            <button
              type="button"
              onClick={onNextPin}
              className="btn btn-ghost btn-xs btn-square"
              title="Next pin"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle ml-1"
            title="Close inspector"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Target status banner */}
      <div className="p-3 border-b border-base-200">
        <div
          className={`rounded-lg p-2.5 text-xs flex items-center gap-2.5 ${
            isTop3
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : isTop10
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                : isRanked
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                  : "bg-base-200/80 text-base-content/70 border border-base-300"
          }`}
        >
          {isTop3 ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          ) : isRanked ? (
            <MapPin className="size-4 shrink-0 text-amber-500" />
          ) : (
            <AlertTriangle className="size-4 shrink-0 text-base-content/50" />
          )}
          <div className="min-w-0 flex-1">
            <span className="font-bold block">
              {isTop3
                ? `Rank #${pin.rank} · Top 3 3-Pack`
                : isTop10
                  ? `Rank #${pin.rank} · Google Local Finder`
                  : isRanked
                    ? `Rank #${pin.rank} · Lower Local Rankings`
                    : "Not Ranking in Top 20 Here"}
            </span>
            <span className="text-[10px] opacity-80 block truncate">
              {targetBusinessName || "Target business"}
            </span>
          </div>
        </div>
      </div>

      {/* SERP Competitor list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">
            Google Maps Rankings at this Pin
          </span>
          <span className="text-[10px] font-semibold text-base-content/50">
            {competitors.length} found
          </span>
        </div>

        {competitors.length > 0 ? (
          competitors.map((comp) => {
            const isTarget =
              (Boolean(targetPlaceId) && comp.placeId === targetPlaceId) ||
              (Boolean(targetBusinessName) &&
                comp.title.toLowerCase().trim() ===
                  targetBusinessName?.toLowerCase().trim());

            return (
              <div
                key={`${comp.rank}-${comp.placeId || comp.title}`}
                className={`rounded-lg border p-2.5 text-xs transition-all ${
                  isTarget
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                    : "border-base-200 bg-base-100 hover:border-base-300"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`size-6 rounded-md flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                      comp.rank <= 3
                        ? "bg-emerald-500 text-white"
                        : comp.rank <= 10
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold"
                          : "bg-base-200 text-base-content/70"
                    }`}
                  >
                    {comp.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm truncate text-base-content">
                        {comp.title}
                      </span>
                      {isTarget && (
                        <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase tracking-wide">
                          Your Business
                        </span>
                      )}
                      {comp.url && (
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:opacity-80 inline-flex items-center"
                          title="Open in Google Maps"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-base-content/70">
                      {comp.rating?.value != null && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span>{comp.rating.value.toFixed(1)}</span>
                          {comp.rating.votes_count != null && (
                            <span className="text-base-content/50 font-normal">
                              ({comp.rating.votes_count})
                            </span>
                          )}
                        </span>
                      )}
                      {comp.category && (
                        <span className="inline-flex items-center gap-1 text-base-content/60">
                          <Building2 className="size-2.5 text-base-content/40" />
                          <span className="truncate max-w-[140px]">
                            {comp.category}
                          </span>
                        </span>
                      )}
                    </div>

                    {comp.address && (
                      <p className="mt-1 text-[11px] text-base-content/50 truncate">
                        {comp.address}
                      </p>
                    )}

                    {comp.phone && (
                      <p className="mt-0.5 text-[10px] text-base-content/50 inline-flex items-center gap-1">
                        <Phone className="size-2.5 text-base-content/40" />
                        {comp.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-base-content/50 border border-dashed border-base-300 rounded-lg p-4">
            <p className="font-semibold">No competitor ranking data</p>
            <p className="mt-1 text-[11px] text-base-content/40">
              Live Google Maps scans capture full top 20 rankings for each pin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
