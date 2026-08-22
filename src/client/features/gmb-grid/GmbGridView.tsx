import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getGmbGridConfigs,
  getGmbGridSnapshots,
  createGmbGridRun,
  scanGmbKeywords,
} from "@/serverFunctions/gmb-grid";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GmbAutocomplete } from "./components/GmbAutocomplete";
import { Loader2, Sparkles } from "lucide-react";

import L from "leaflet";
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

export function GmbGridView({ projectId }: { projectId: string }) {
  const getConfigs = useServerFn(getGmbGridConfigs);
  const getSnapshots = useServerFn(getGmbGridSnapshots);
  const createRun = useServerFn(createGmbGridRun);
  const scanKeywordsFn = useServerFn(scanGmbKeywords);

  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string | undefined>();
  const [scannedKeywords, setScannedKeywords] = useState<Array<{
    keyword: string;
    rank: number;
  }> | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const { data: configs } = useQuery({
    queryKey: ["gmb-configs", projectId],
    queryFn: () => getConfigs({ data: projectId }),
  });

  const { data: snapshots } = useQuery({
    queryKey: ["gmb-snapshots", activeRunId],
    queryFn: () => getSnapshots({ data: activeRunId! }),
    enabled: !!activeRunId,
    refetchInterval: 5000,
  });

  const createRunMutation = useMutation({
    mutationFn: async (data: any) => await createRun({ data }),
    onSuccess: (res) => setActiveRunId(res.runId),
  });

  const scanKeywordsMutation = useMutation({
    mutationFn: async (data: any) => await scanKeywordsFn({ data }),
    onSuccess: (data) => setScannedKeywords(data),
  });

  const handleProfileSelect = (
    placeId: string,
    name: string,
    lat: number,
    lng: number,
    website?: string,
  ) => {
    setSelectedPlaceId(placeId);
    setSelectedWebsite(website);

    if (formRef.current) {
      const inputs = formRef.current.elements as any;
      if (inputs.businessName) inputs.businessName.value = name;
      if (inputs.centerLat) inputs.centerLat.value = lat;
      if (inputs.centerLng) inputs.centerLng.value = lng;
    }
  };

  const onAutoScanKeywords = () => {
    if (!formRef.current || !selectedPlaceId) return;
    const inputs = formRef.current.elements as any;

    scanKeywordsMutation.mutate({
      placeId: selectedPlaceId,
      businessName: inputs.businessName.value,
      website: selectedWebsite,
      lat: parseFloat(inputs.centerLat.value),
      lng: parseFloat(inputs.centerLng.value),
    });
  };

  const useScannedKeyword = (kw: string) => {
    if (formRef.current) {
      const inputs = formRef.current.elements as any;
      if (inputs.keyword) inputs.keyword.value = kw;
    }
    setScannedKeywords(null);
  };

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createRunMutation.mutate({
      projectId,
      businessName: formData.get("businessName") as string,
      keyword: formData.get("keyword") as string,
      centerLat: parseFloat(formData.get("centerLat") as string),
      centerLng: parseFloat(formData.get("centerLng") as string),
      gridSize: parseInt(formData.get("gridSize") as string, 10),
      radiusMeters: parseInt(formData.get("radiusMeters") as string, 10),
    });
  };

  const activeConfig = configs?.[0];
  const mapCenterLat = activeConfig?.centerLat || 32.7157;
  const mapCenterLng = activeConfig?.centerLng || -117.1611;
  const mapRadius = activeConfig?.radiusMeters || 1000;

  const getRankColor = (rank: number | null) => {
    if (rank === null) return "#9ca3af";
    if (rank <= 3) return "#22c55e";
    if (rank <= 10) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
      <div className="md:col-span-1 bg-base-100 p-6 rounded-2xl border border-base-300 relative z-10 shadow-xs">
        <h2 className="text-lg font-semibold mb-4 text-base-content">
          Scan Settings
        </h2>

        <form
          ref={formRef}
          onSubmit={handleStartScan}
          className="flex flex-col gap-4"
        >
          <GmbAutocomplete onSelectProfile={handleProfileSelect} />

          <div className="relative z-0">
            <label className="text-sm font-medium flex justify-between text-base-content">
              Search Query / Keyword
              {selectedWebsite && (
                <button
                  type="button"
                  onClick={onAutoScanKeywords}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  {scanKeywordsMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Auto-detect rankings
                </button>
              )}
            </label>
            <input
              name="keyword"
              className="input input-bordered w-full mt-1"
              required
            />
          </div>

          <input type="hidden" name="businessName" />

          <div className="grid grid-cols-2 gap-4 relative z-0">
            <div>
              <label className="text-sm font-medium text-base-content">
                Center Lat
              </label>
              <input
                name="centerLat"
                type="number"
                step="any"
                defaultValue="32.7157"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-base-content">
                Center Lng
              </label>
              <input
                name="centerLng"
                type="number"
                step="any"
                defaultValue="-117.1611"
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-0">
            <div>
              <label className="text-sm font-medium text-base-content">
                Grid Size
              </label>
              <select
                name="gridSize"
                className="select select-bordered w-full"
                defaultValue="3"
              >
                <option value="3">3 x 3</option>
                <option value="5">5 x 5</option>
                <option value="7">7 x 7</option>
                <option value="9">9 x 9</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content">
                Radius (Meters)
              </label>
              <input
                name="radiusMeters"
                type="number"
                defaultValue="1000"
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full mt-2 shadow-xs"
            disabled={createRunMutation.isPending}
          >
            {createRunMutation.isPending ? "Scanning..." : "Scan Now"}
          </button>
        </form>

        {configs && configs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2">Recent Scans</h3>
            <ul className="text-sm flex flex-col gap-2">
              {configs.slice(0, 5).map((c) => (
                <li
                  key={c.id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                >
                  {c.keyword} - {c.gridSize}x{c.gridSize}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="md:col-span-2 relative rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[mapCenterLat, mapCenterLng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapBoundsUpdater
            centerLat={mapCenterLat}
            centerLng={mapCenterLng}
            radiusMeters={mapRadius}
          />

          {snapshots?.map((snap) => (
            <CircleMarker
              key={snap.id}
              center={[snap.lat, snap.lng]}
              radius={16}
              pathOptions={{
                color: "white",
                weight: 2,
                fillColor: getRankColor(snap.rank),
                fillOpacity: 0.9,
              }}
            >
              <Tooltip
                direction="center"
                permanent
                className="bg-transparent border-none shadow-none text-white font-bold text-center"
              >
                {snap.rank === null ? "-" : snap.rank}
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {scannedKeywords && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Detected Rankings</h3>
            <p className="text-sm text-gray-500 mb-4">
              {scannedKeywords.length === 0
                ? "Could not find any top 20 rankings for extracted seeds."
                : "We found this profile ranking for these keywords. Click one to track its heatmap grid."}
            </p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {scannedKeywords.map((sk) => (
                <button
                  key={sk.keyword}
                  onClick={() => useScannedKeyword(sk.keyword)}
                  className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="font-medium text-sm">{sk.keyword}</span>
                  <span className="badge badge-sm badge-success font-bold text-white px-2">
                    Rank #{sk.rank}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setScannedKeywords(null)}
              className="btn btn-ghost w-full mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
