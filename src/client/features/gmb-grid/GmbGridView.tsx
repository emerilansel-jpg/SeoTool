// oxlint-disable max-lines, max-lines-per-function
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Loader2, MapPinned, Play, Zap } from "lucide-react";
import { Modal } from "@/client/components/Modal";
import {
  createGmbGridRun,
  getGmbGridConfigs,
  getGmbGridRun,
} from "@/serverFunctions/gmb-grid";
import type { CreateGmbGridInput } from "@/server/features/gmb-grid/gmb-grid.schema";
import { estimateGmbGridCost } from "@/server/features/gmb-grid/gmb-grid";
import {
  GmbProfileSearch,
  type GmbProfileSelection,
} from "./components/GmbProfileSearch";
import { GmbScanPipeline } from "./components/GmbScanPipeline";
import { GmbMap, type GmbSnapshotMarker } from "./components/GmbMap";
import { PinCompetitorsModal } from "./components/GmbPinModal";

type PendingScan = Omit<CreateGmbGridInput, "costConfirmed">;

export function GmbGridView({ projectId }: { projectId: string }) {
  const getConfigs = useServerFn(getGmbGridConfigs);
  const getRun = useServerFn(getGmbGridRun);
  const createRun = useServerFn(createGmbGridRun);
  const queryClient = useQueryClient();

  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<GmbProfileSelection | null>(null);
  const [keyword, setKeyword] = useState("");
  const [gridSize, setGridSize] = useState(7);
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  const [scheduleInterval, setScheduleInterval] = useState<
    "weekly" | "monthly" | "manual"
  >("manual");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("mi");
  const [selectedPin, setSelectedPin] = useState<GmbSnapshotMarker | null>(
    null,
  );
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const { data: configs } = useQuery({
    queryKey: ["gmb-configs", projectId],
    queryFn: () => getConfigs({ data: { projectId } }),
  });

  const { data: runData } = useQuery({
    queryKey: ["gmb-run", projectId, activeRunId],
    queryFn: () => getRun({ data: { projectId, runId: activeRunId! } }),
    enabled: activeRunId != null,
    refetchInterval: (query) =>
      query.state.data?.run.status === "pending" ||
      query.state.data?.run.status === "running"
        ? 3000
        : false,
  });

  const createRunMutation = useMutation({
    mutationFn: (data: PendingScan) =>
      createRun({ data: { ...data, costConfirmed: true } }),
    onSuccess: (result) => {
      setPendingScan(null);
      if (result.runId) setActiveRunId(result.runId);
      void queryClient.invalidateQueries({
        queryKey: ["gmb-configs", projectId],
      });
    },
    onError: (error: Error) => {
      setPendingScan(null);
      setScanError(error.message || "Could not start the grid scan.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScanError(null);
    if (!selectedProfile) {
      setScanError("Select the exact Google Business Profile before scanning.");
      return;
    }
    setPendingScan({
      projectId,
      businessName: selectedProfile.businessName,
      placeId: selectedProfile.placeId,
      cid: selectedProfile.cid ?? undefined,
      address: selectedProfile.address ?? undefined,
      keyword,
      centerLat: selectedProfile.lat,
      centerLng: selectedProfile.lng,
      gridSize,
      radiusMeters,
      languageCode: "en",
      device,
      mapZoom: 15,
      scheduleInterval,
    });
  };

  const centerSource =
    runData?.config ?? selectedProfile ?? configs?.[0] ?? null;
  const mapCenterLat = centerSource
    ? "centerLat" in centerSource
      ? centerSource.centerLat
      : centerSource.lat
    : 0;
  const mapCenterLng = centerSource
    ? "centerLng" in centerSource
      ? centerSource.centerLng
      : centerSource.lng
    : 0;
  const mapRadius = runData?.config.radiusMeters ?? radiusMeters;
  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <aside className="rounded-xl border border-base-300 bg-base-100 p-5 xl:max-h-[820px] xl:overflow-y-auto">
          <div className="mb-5 flex items-center gap-2">
            <MapPinned className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Scan settings</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <GmbProfileSearch
              projectId={projectId}
              selected={selectedProfile}
              onSelect={(profile) => {
                setSelectedProfile(profile);
                if (!keyword && profile.category) setKeyword(profile.category);
              }}
            />

            {selectedProfile && (
              <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
                <p className="font-semibold">{selectedProfile.businessName}</p>
                <p className="text-xs text-base-content/60">
                  {selectedProfile.address || "Verified Google Maps listing"}
                </p>
              </div>
            )}

            <label className="form-control gap-1">
              <span className="text-sm font-medium">Search keyword</span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="input input-bordered w-full"
                placeholder="e.g. dentist near me"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="form-control gap-1">
                <span className="text-sm font-medium">Grid Matrix</span>
                <select
                  className="select select-bordered w-full"
                  value={gridSize}
                  onChange={(event) => setGridSize(Number(event.target.value))}
                >
                  {[3, 5, 7, 9, 11, 13, 15].map((size) => (
                    <option key={size} value={size}>
                      {size} × {size} ({size * size} pins)
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-control gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Radius</span>
                  <div className="join border border-base-300 rounded-md p-0.5 scale-90 origin-right">
                    <button
                      type="button"
                      className={`join-item btn btn-xs px-2 ${distanceUnit === "mi" ? "btn-primary font-bold" : "btn-ghost text-base-content/60"}`}
                      onClick={() => setDistanceUnit("mi")}
                    >
                      mi
                    </button>
                    <button
                      type="button"
                      className={`join-item btn btn-xs px-2 ${distanceUnit === "km" ? "btn-primary font-bold" : "btn-ghost text-base-content/60"}`}
                      onClick={() => setDistanceUnit("km")}
                    >
                      km
                    </button>
                  </div>
                </div>
                <select
                  className="select select-bordered w-full"
                  value={radiusMeters}
                  onChange={(event) =>
                    setRadiusMeters(Number(event.target.value))
                  }
                >
                  {distanceUnit === "mi" ? (
                    <>
                      <option value={805}>0.5 mi</option>
                      <option value={1609}>1.0 mi</option>
                      <option value={3219}>2.0 mi</option>
                      <option value={4828}>3.0 mi</option>
                      <option value={8047}>5.0 mi</option>
                      <option value={16093}>10.0 mi</option>
                      <option value={32187}>20.0 mi</option>
                      <option value={48280}>30.0 mi</option>
                    </>
                  ) : (
                    <>
                      <option value={500}>500 m</option>
                      <option value={1000}>1 km</option>
                      <option value={2500}>2.5 km</option>
                      <option value={5000}>5 km</option>
                      <option value={10000}>10 km</option>
                      <option value={20000}>20 km</option>
                      <option value={50000}>50 km</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="form-control gap-1">
                <span className="text-sm font-medium">Device</span>
                <select
                  className="select select-bordered w-full"
                  value={device}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (value === "desktop" || value === "mobile") {
                      setDevice(value);
                    }
                  }}
                >
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                </select>
              </label>
              <label className="form-control gap-1">
                <span className="text-sm font-medium">Repeat</span>
                <select
                  className="select select-bordered w-full"
                  value={scheduleInterval}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (
                      value === "weekly" ||
                      value === "monthly" ||
                      value === "manual"
                    ) {
                      setScheduleInterval(value);
                    }
                  }}
                >
                  <option value="manual">Manual</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>

            {scanError && (
              <p
                className="rounded-lg bg-error/10 p-3 text-sm text-error"
                role="alert"
              >
                {scanError}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={createRunMutation.isPending}
            >
              {createRunMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )}
              Preview & start scan
            </button>
          </form>

          {configs && configs.length > 0 && (
            <div className="mt-8 border-t border-base-300 pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="size-4" /> Recent scans
              </h3>
              <div className="space-y-2">
                {configs.slice(0, 8).map((config) => (
                  <button
                    type="button"
                    key={config.id}
                    disabled={!config.latestRun}
                    onClick={() =>
                      config.latestRun && setActiveRunId(config.latestRun.id)
                    }
                    className="flex w-full items-center justify-between rounded-lg border border-base-300 p-3 text-left hover:bg-base-200 disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {config.keyword}
                      </span>
                      <span className="block truncate text-xs text-base-content/60">
                        {config.businessName} · {config.gridSize}×
                        {config.gridSize}
                      </span>
                    </span>
                    {config.latestRun && (
                      <span className="badge badge-ghost badge-sm">
                        {config.latestRun.status}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="flex min-h-[560px] flex-col gap-4 xl:col-span-2 xl:h-[820px] relative">
          {runData && (
            <GmbScanPipeline run={runData.run} snapshots={runData.snapshots} />
          )}
          <GmbMap
            centerLat={mapCenterLat}
            centerLng={mapCenterLng}
            radiusMeters={mapRadius}
            snapshots={runData?.snapshots}
            onSelectSnapshot={(pin) => setSelectedPin(pin)}
          />
          {!centerSource && (
            <p className="text-center text-sm text-base-content/60">
              Find and select a business to center the map.
            </p>
          )}

          {/* Local Falcon Interactive Pin Inspector Modal */}
          {selectedPin && (
            <PinCompetitorsModal
              pin={selectedPin}
              onClose={() => setSelectedPin(null)}
            />
          )}
        </section>
      </div>

      {pendingScan && (
        <GmbScanConfirmModal
          scan={pendingScan}
          isPending={createRunMutation.isPending}
          onCancel={() => setPendingScan(null)}
          onConfirm={() => createRunMutation.mutate(pendingScan)}
        />
      )}
    </>
  );
}

function GmbScanConfirmModal({
  scan,
  isPending,
  onCancel,
  onConfirm,
}: {
  scan: PendingScan;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const estimate = estimateGmbGridCost(scan.gridSize);
  return (
    <Modal
      maxWidth="max-w-md"
      onClose={onCancel}
      labelledBy="gmb-grid-confirm-title"
    >
      <div>
        <h3 id="gmb-grid-confirm-title" className="text-lg font-semibold">
          Confirm local map scan
        </h3>
        <p className="mt-1 text-sm text-base-content/60">
          {scan.businessName} · “{scan.keyword}”
        </p>
      </div>
      <div className="rounded-xl border border-base-300 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {scan.gridSize} × {scan.gridSize} grid
            </p>
            <p className="text-xs text-base-content/60">
              {estimate.points} queued Google Maps checks
            </p>
          </div>
          <p className="font-mono font-semibold">
            ~${estimate.estimatedCostUsd.toFixed(4)}
          </p>
        </div>
      </div>
      <p className="text-xs text-base-content/60">
        The estimate uses DataForSEO standard queue pricing. Actual billed
        provider cost is recorded on the completed run.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Confirm & start
        </button>
      </div>
    </Modal>
  );
}
