import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
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
}: {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}) {
  const map = useMap();
  const latDelta = radiusMeters / 111320;
  const lngDelta =
    radiusMeters / ((40075000 * Math.cos((centerLat * Math.PI) / 180)) / 360);

  map.fitBounds([
    [centerLat - latDelta, centerLng - lngDelta],
    [centerLat + latDelta, centerLng + lngDelta],
  ]);

  return null;
}

export const getRankColor = (rank: number | null, status?: string) => {
  if (status === "failed") return "#374151";
  if (rank === null) return "#9ca3af";
  if (rank <= 3) return "#22c55e";
  if (rank <= 10) return "#eab308";
  return "#ef4444";
};

export interface GmbSnapshotMarker {
  id: string;
  lat: number;
  lng: number;
  rank: number | null;
  status: string;
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
  snapshots,
}: {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  snapshots?: GmbSnapshotMarker[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative flex-1 min-h-[400px] rounded-lg overflow-hidden border border-base-300 z-0">
      {mounted ? (
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
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
          />

          {snapshots?.map((snap) => (
            <CircleMarker
              key={snap.id}
              center={[snap.lat, snap.lng]}
              radius={16}
              pathOptions={{
                color: "white",
                weight: 2,
                fillColor: getRankColor(snap.rank, snap.status),
                fillOpacity: 0.9,
              }}
            >
              <Tooltip
                direction="center"
                permanent
                className="bg-transparent border-none shadow-none text-white font-bold text-center"
              >
                {snap.status === "failed"
                  ? "!"
                  : snap.rank === null
                    ? "-"
                    : snap.rank}
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-base-content/50 text-sm">
          Loading map…
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-[1000] bg-base-100/95 rounded-lg shadow-md border border-base-300 p-2 text-xs">
        <p className="font-semibold mb-1">Local rank</p>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "#22c55e" }}
            />{" "}
            Top 3
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "#eab308" }}
            />{" "}
            4 - 10
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "#ef4444" }}
            />{" "}
            11+
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "#9ca3af" }}
            />{" "}
            Not found
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "#374151" }}
            />{" "}
            Provider error
          </span>
        </div>
      </div>
    </div>
  );
}
