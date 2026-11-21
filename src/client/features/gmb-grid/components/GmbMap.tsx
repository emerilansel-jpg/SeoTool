import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Polygon,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
// oxlint-disable-next-line import/no-unassigned-import
import "leaflet/dist/leaflet.css";

import type { GeoPoint, GmbGridShape } from "@/shared/geo-shape";

import L from "leaflet";
// oxlint-disable-next-line typescript-eslint/no-explicit-any, typescript-eslint/no-unsafe-type-assertion, typescript-eslint/no-unsafe-member-access
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/** react-leaflet v5: map-level clicks are captured by a child using
 *  useMapEvents (MapContainer itself takes no eventHandlers prop). */
function MapClickHandler({
  drawMode,
  onMapClick,
}: {
  drawMode: boolean;
  onMapClick?: (point: GeoPoint) => void;
}) {
  useMapEvents({
    click: (event) => {
      if (drawMode && onMapClick) {
        onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
      }
    },
  });
  return null;
}

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
      { padding: [25, 25] },
    );
  }, [map, centerLat, centerLng, radiusMeters, hasSelection, defaultZoom]);

  return null;
}

export const getRankColor = (rank: number | null, status?: string) => {
  if (status === "failed") return "#374151";
  if (rank === null) return "#9ca3af";
  if (rank <= 3) return "#22c55e";
  if (rank <= 10) return "#eab308";
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
  onSelectSnapshot,
  shape = "square",
  polygonVertices,
  drawMode = false,
  onMapClick,
}: {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  hasSelection?: boolean;
  defaultZoom?: number;
  businessName?: string;
  snapshots?: GmbSnapshotMarker[];
  onSelectSnapshot?: (snapshot: GmbSnapshotMarker) => void;
  /** Active scan shape: draws the corresponding area overlay. */
  shape?: GmbGridShape;
  /** Polygon vertices for shape === "polygon" (already placed ones). */
  polygonVertices?: GeoPoint[];
  /** When true, map clicks are forwarded so the user can place vertices. */
  drawMode?: boolean;
  onMapClick?: (point: GeoPoint) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative flex-1 min-h-[400px] rounded-lg overflow-hidden border border-base-300 z-0">
      {drawMode ? (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-primary/90 text-primary-content backdrop-blur-xs rounded-full px-4 py-1.5 shadow-sm text-xs font-medium pointer-events-none">
          Click the map to add polygon vertices
        </div>
      ) : null}
      {mounted ? (
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <MapClickHandler drawMode={drawMode} onMapClick={onMapClick} />
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
              {shape !== "polygon" ? (
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
              ) : null}
              {shape === "polygon" &&
              polygonVertices &&
              polygonVertices.length >= 3 ? (
                <Polygon
                  positions={polygonVertices.map((vertex) => [
                    vertex.lat,
                    vertex.lng,
                  ])}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: "5 5",
                  }}
                />
              ) : null}
              {shape === "polygon"
                ? polygonVertices?.map((vertex, index) => (
                    <CircleMarker
                      key={`vertex-${index}`}
                      center={[vertex.lat, vertex.lng]}
                      radius={5}
                      pathOptions={{
                        color: "#ffffff",
                        fillColor: "#3b82f6",
                        fillOpacity: 1,
                        weight: 1.5,
                      }}
                    />
                  ))
                : null}
              <CircleMarker
                center={[centerLat, centerLng]}
                radius={7}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                  weight: 2.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} permanent={false}>
                  <span className="font-semibold text-xs">
                    {businessName || "Target Business"}
                  </span>
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {snapshots?.map((snap) => (
            <CircleMarker
              key={snap.id}
              center={[snap.lat, snap.lng]}
              radius={16}
              eventHandlers={{
                click: () => {
                  if (onSelectSnapshot) onSelectSnapshot(snap);
                },
              }}
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
                className="bg-transparent border-none shadow-none text-white font-bold text-center cursor-pointer"
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

      {!hasSelection && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-base-100/90 backdrop-blur-xs border border-base-300 rounded-full px-4 py-1.5 shadow-sm text-xs font-medium text-base-content/80 pointer-events-none">
          Search or enter your Google Business Profile to view grid ranking
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
