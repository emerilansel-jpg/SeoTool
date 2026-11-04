import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
// oxlint-disable-next-line import/no-unassigned-import
import "leaflet/dist/leaflet.css";

import L from "leaflet";
// oxlint-disable-next-line typescript-eslint/no-explicit-any, typescript-eslint/no-unsafe-type-assertion, typescript-eslint/no-unsafe-member-access
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapBoundsUpdater({
  centerLat,
  centerLng,
  radiusMeters,
  hasSelection,
  defaultZoom = 11,
}: {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  hasSelection: boolean;
  defaultZoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!hasSelection) {
      if (centerLat !== 0 || centerLng !== 0) {
        map.setView([centerLat, centerLng], defaultZoom);
      }
      return;
    }
    const latDelta = radiusMeters / 111320;
    const lngDelta =
      radiusMeters / ((40075000 * Math.cos((centerLat * Math.PI) / 180)) / 360);

    map.fitBounds(
      [
        [centerLat - latDelta, centerLng - lngDelta],
        [centerLat + latDelta, centerLng + lngDelta],
      ],
      { padding: [35, 35] },
    );
  }, [map, centerLat, centerLng, radiusMeters, hasSelection, defaultZoom]);

  return null;
}

export const getRankColor = (rank: number | null, status?: string) => {
  if (status === "failed") return "#334155";
  if (rank === null) return "#64748b";
  if (rank <= 3) return "#10b981";
  if (rank <= 10) return "#f59e0b";
  return "#ef4444";
};

export interface GmbPinCompetitor {
  rank: number;
  title: string;
  placeId?: string | null;
  cid?: string | null;
  address?: string | null;
  category?: string | null;
  domain?: string | null;
  url?: string | null;
  phone?: string | null;
  rating?: {
    value?: number | null;
    votes_count?: number | null;
  } | null;
}

export interface GmbSnapshotMarker {
  id: string;
  lat: number;
  lng: number;
  rank: number | null;
  status: string;
  gridRow?: number;
  gridCol?: number;
  itemsJson?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export type GmbPinFilter =
  | "all"
  | "top3"
  | "top10"
  | "rank11Plus"
  | "notFound"
  | "failed";

function createPinDivIcon(
  rank: number | null,
  status: string,
  isSelected: boolean,
  isDimmed: boolean,
) {
  const bg = getRankColor(rank, status);
  const label = status === "failed" ? "!" : rank === null ? "-" : String(rank);

  const selectedBorder = isSelected
    ? "box-shadow: 0 0 0 4px #3b82f6, 0 8px 20px rgba(0,0,0,0.5); transform: scale(1.22); z-index: 1000;"
    : "box-shadow: 0 2px 6px rgba(0,0,0,0.3);";

  const opacity = isDimmed ? "0.2" : "1";

  return L.divIcon({
    className: "gmb-custom-pin-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `
      <div style="background-color: ${bg}; width: 30px; height: 30px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 13px; font-family: ui-monospace, SFMono-Regular, monospace; border: 2px solid white; cursor: pointer; opacity: ${opacity}; transition: transform 0.15s ease, opacity 0.2s ease; ${selectedBorder}">
        ${label}
      </div>
    `,
  });
}

function createCenterBusinessIcon(businessName: string) {
  return L.divIcon({
    className: "gmb-center-business-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 14px rgba(37,99,235,0.6); cursor: pointer;"
           title="${businessName}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
  });
}

/**
 * The Leaflet heatmap. react-leaflet cannot be server-rendered: SSR output
 * mismatches the client map init, hydration fails, and every event handler
 * on the page silently dies. The map therefore renders only after mount.
 */
export function GmbMap({
  centerLat,
  centerLng,
  radiusMeters,
  hasSelection = false,
  defaultZoom = 11,
  businessName,
  snapshots,
  selectedPinId,
  activeFilter = "all",
  onSelectSnapshot,
}: {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  hasSelection?: boolean;
  defaultZoom?: number;
  businessName?: string;
  snapshots?: GmbSnapshotMarker[];
  selectedPinId?: string | null;
  activeFilter?: GmbPinFilter;
  onSelectSnapshot?: (snapshot: GmbSnapshotMarker) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative flex-1 min-h-[440px] rounded-xl overflow-hidden border border-base-300 z-0 shadow-sm bg-base-200">
      {mounted ? (
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapBoundsUpdater
            centerLat={centerLat}
            centerLng={centerLng}
            radiusMeters={radiusMeters}
            hasSelection={hasSelection}
            defaultZoom={defaultZoom}
          />

          {hasSelection && (
            <>
              <Circle
                center={[centerLat, centerLng]}
                radius={radiusMeters}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: "5 5",
                }}
              />
              <Marker
                position={[centerLat, centerLng]}
                icon={createCenterBusinessIcon(businessName || "Your Business")}
              >
                <Tooltip direction="top" offset={[0, -20]} permanent={false}>
                  <div className="font-semibold text-xs">
                    📍 {businessName || "Your Business Location"}
                  </div>
                </Tooltip>
              </Marker>
            </>
          )}

          {snapshots?.map((snap) => {
            const isSelected = selectedPinId === snap.id;
            let isDimmed = false;
            if (activeFilter === "top3") {
              isDimmed = snap.rank == null || snap.rank > 3;
            } else if (activeFilter === "top10") {
              isDimmed = snap.rank == null || snap.rank > 10;
            } else if (activeFilter === "rank11Plus") {
              isDimmed = snap.rank == null || snap.rank <= 10;
            } else if (activeFilter === "notFound") {
              isDimmed = snap.rank != null || snap.status === "failed";
            } else if (activeFilter === "failed") {
              isDimmed = snap.status !== "failed";
            }

            return (
              <Marker
                key={snap.id}
                position={[snap.lat, snap.lng]}
                icon={createPinDivIcon(
                  snap.rank,
                  snap.status,
                  isSelected,
                  isDimmed,
                )}
                eventHandlers={{
                  click: () => {
                    if (onSelectSnapshot) onSelectSnapshot(snap);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -16]}>
                  <div className="text-xs font-medium space-y-0.5">
                    <div className="font-bold flex items-center gap-1">
                      {snap.rank != null ? (
                        <span
                          className={
                            snap.rank <= 3
                              ? "text-success font-bold"
                              : snap.rank <= 10
                                ? "text-warning font-bold"
                                : "text-error font-bold"
                          }
                        >
                          Rank #{snap.rank}
                        </span>
                      ) : (
                        <span className="text-base-content/60">
                          {snap.status === "failed" ? "Failed" : "Unranked"}
                        </span>
                      )}
                      {snap.gridRow != null && snap.gridCol != null ? (
                        <span className="text-base-content/40 text-[10px]">
                          (R{snap.gridRow + 1}, C{snap.gridCol + 1})
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-base-content/60">
                      Click to inspect competitors at this point
                    </p>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-base-content/60">
          Loading map…
        </div>
      )}

      {!hasSelection && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-base-100/90 backdrop-blur-xs border border-base-300 rounded-full px-4 py-1.5 shadow-sm text-xs font-medium text-base-content/80 pointer-events-none">
          Search or enter your Google Business Profile to view grid ranking
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-[1000] bg-base-100/95 backdrop-blur-xs rounded-xl shadow-lg border border-base-300 p-2.5 text-xs">
        <p className="font-bold text-[11px] mb-1.5 text-base-content/70 uppercase tracking-wider">
          Local Rank
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 font-medium">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-xs border border-white"
              style={{ background: "#10b981" }}
            />
            Top 3 (Pack)
          </span>
          <span className="flex items-center gap-2 font-medium">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-xs border border-white"
              style={{ background: "#f59e0b" }}
            />
            4 - 10
          </span>
          <span className="flex items-center gap-2 font-medium">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-xs border border-white"
              style={{ background: "#ef4444" }}
            />
            11+
          </span>
          <span className="flex items-center gap-2 font-medium">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-xs border border-white"
              style={{ background: "#64748b" }}
            />
            Unranked / &gt;20
          </span>
        </div>
      </div>
    </div>
  );
}
