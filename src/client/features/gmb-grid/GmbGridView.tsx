// oxlint-disable
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Clock3,
  Loader2,
  MapPinned,
  Play,
  Zap,
  Sparkles,
  Map as MapIcon,
  Trophy,
  MousePointerClick,
} from "lucide-react";
import { Modal } from "@/client/components/Modal";
import {
  createGmbGridRun,
  getGmbGridConfigs,
  getGmbGridRun,
  retryGmbGridFailedPins,
} from "@/serverFunctions/gmb-grid";
import type { CreateGmbGridInput } from "@/server/features/gmb-grid/gmb-grid.schema";
import {
  calculateGmbMetrics,
  estimateGmbGridCost,
} from "@/server/features/gmb-grid/gmb-grid";
import {
  DEFAULT_LOCATION_CODE,
  getDefaultLocationCoordinates,
  getLanguageCode,
} from "@/shared/keyword-locations";
import { useProjectMarket } from "@/client/features/projects/useProjectMarket";
import {
  GmbProfileSearch,
  type GmbProfileSelection,
} from "./components/GmbProfileSearch";
import { GmbScanPipeline } from "./components/GmbScanPipeline";
import {
  GmbMap,
  type GmbPinFilter,
  type GmbSnapshotMarker,
} from "./components/GmbMap";
import { GmbPinInspector } from "./components/GmbPinInspector";
import { GmbCompetitorLeaderboard } from "./components/GmbCompetitorLeaderboard";
import { GmbGridReportSection } from "./components/GmbGridReportSection";
import { generateSampleDemoSnapshots } from "./gmbDemoData";

type PendingScan = Omit<CreateGmbGridInput, "costConfirmed">;

export function GmbGridView({ projectId }: { projectId: string }) {
  const projectMarket = useProjectMarket(projectId);
  const getConfigs = useServerFn(getGmbGridConfigs);
  const getRun = useServerFn(getGmbGridRun);
  const createRun = useServerFn(createGmbGridRun);
  const retryFailed = useServerFn(retryGmbGridFailedPins);
  const queryClient = useQueryClient();

  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [locationCode, setLocationCode] = useState<number | undefined>(
    undefined,
  );
  const [selectedProfile, setSelectedProfile] =
    useState<GmbProfileSelection | null>(null);
  const [keyword, setKeyword] = useState("");
  const [gridSize, setGridSize] = useState(7);
  const [radiusMeters, setRadiusMeters] = useState(4828);
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  const [scheduleInterval, setScheduleInterval] = useState<
    "weekly" | "monthly" | "manual"
  >("manual");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("mi");
  const [selectedPin, setSelectedPin] = useState<GmbSnapshotMarker | null>(
    null,
  );
  const [activeFilter, setActiveFilter] = useState<GmbPinFilter>("all");
  const [viewTab, setViewTab] = useState<"map" | "competitors">("map");
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const { data: configs } = useQuery({
    queryKey: ["gmb-configs", projectId],
    queryFn: () => getConfigs({ data: { projectId } }),
  });

  // Auto select latest run if none is active
  useEffect(() => {
    if (!activeRunId && configs?.[0]?.latestRun?.id) {
      setActiveRunId(configs[0].latestRun.id);
    }
  }, [activeRunId, configs]);

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

  const runStatus = runData?.run.status;
  useEffect(() => {
    if (
      runStatus === "completed" ||
      runStatus === "failed" ||
      runStatus === "partial"
    ) {
      void queryClient.invalidateQueries({
        queryKey: ["gmb-configs", projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["gmb-grid-report", projectId],
      });
    }
  }, [runStatus, projectId, queryClient]);

  const createRunMutation = useMutation({
    mutationFn: (data: PendingScan) =>
      createRun({ data: { ...data, costConfirmed: true } }),
    onSuccess: (result) => {
      setPendingScan(null);
      if (result.runId) setActiveRunId(result.runId);
      if (!result.ok && result.reason === "already_running") {
        toast.info(
          "A scan is already in progress for this configuration. Viewing active scan.",
        );
      } else {
        toast.success("Local map scan started.");
      }
      void queryClient.invalidateQueries({
        queryKey: ["gmb-configs", projectId],
      });
    },
    onError: (error: Error) => {
      setPendingScan(null);
      setScanError(error.message || "Could not start the grid scan.");
    },
  });

  const retryMutation = useMutation({
    mutationFn: (runId: string) => retryFailed({ data: { projectId, runId } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(`Retrying ${result.retriedCount} failed pins.`);
        void queryClient.invalidateQueries({
          queryKey: ["gmb-run", projectId, activeRunId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["gmb-configs", projectId],
        });
      } else if (result.reason === "already_running") {
        toast.info("A scan or retry is already in progress.");
      } else {
        toast.info("No failed pins to retry.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to retry pins.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScanError(null);
    if (!selectedProfile) {
      setScanError("Select the exact Google Business Profile before scanning.");
      return;
    }
    const activeLocation = locationCode ?? projectMarket?.locationCode ?? 2840;
    const activeLanguage =
      getLanguageCode(activeLocation) || projectMarket?.languageCode || "en";

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
      languageCode: activeLanguage,
      device,
      mapZoom: 15,
      scheduleInterval,
    });
  };

  const activeLocation =
    locationCode ?? projectMarket?.locationCode ?? DEFAULT_LOCATION_CODE;
  const defaultCoords = getDefaultLocationCoordinates(activeLocation);

  const centerSource =
    runData?.config ?? selectedProfile ?? configs?.[0] ?? null;
  const hasSelection = Boolean(centerSource);

  const isDemo = !runData && (!configs || configs.length === 0);

  const demoSnapshots = useMemo(() => {
    if (!isDemo) return [];
    return generateSampleDemoSnapshots(
      defaultCoords.lat,
      defaultCoords.lng,
      7,
      4828,
    );
  }, [isDemo, defaultCoords.lat, defaultCoords.lng]);

  const demoRun = useMemo(() => {
    if (!isDemo) return null;
    const metrics = calculateGmbMetrics(demoSnapshots);
    return {
      status: "completed" as const,
      totalPoints: demoSnapshots.length,
      completedPoints: demoSnapshots.length,
      failedPoints: 0,
      foundPoints: demoSnapshots.filter((s) => s.rank != null).length,
      solv: metrics.solv,
      averageRank: metrics.averageRank,
      costUsd: 0.0294,
      errorMessage: null,
    };
  }, [isDemo, demoSnapshots]);

  const activeSnapshots = runData?.snapshots ?? (isDemo ? demoSnapshots : []);
  const activeRun = runData?.run ?? (isDemo ? demoRun : null);

  const mapCenterLat = centerSource
    ? "centerLat" in centerSource
      ? centerSource.centerLat
      : centerSource.lat
    : defaultCoords.lat;
  const mapCenterLng = centerSource
    ? "centerLng" in centerSource
      ? centerSource.centerLng
      : centerSource.lng
    : defaultCoords.lng;
  const mapRadius = runData?.config.radiusMeters ?? radiusMeters;

  const businessName = centerSource
    ? "businessName" in centerSource
      ? centerSource.businessName
      : ""
    : isDemo
      ? "Smile Bright Dental (Demo)"
      : "";

  // Filter counts
  const ranks = activeSnapshots
    .map((s) => s.rank)
    .filter((r): r is number => r != null);
  const top3Count = ranks.filter((r) => r <= 3).length;
  const top10Count = ranks.filter((r) => r <= 10).length;
  const rank11PlusCount = ranks.filter((r) => r > 10).length;
  const notFoundCount = activeSnapshots.filter(
    (s) => s.status === "completed" && s.rank === null,
  ).length;

  // Pin navigation
  const currentPinIndex = selectedPin
    ? activeSnapshots.findIndex((s) => s.id === selectedPin.id)
    : -1;

  const handlePrevPin = () => {
    if (currentPinIndex > 0) {
      setSelectedPin(activeSnapshots[currentPinIndex - 1]);
    } else if (activeSnapshots.length > 0) {
      setSelectedPin(activeSnapshots[activeSnapshots.length - 1]);
    }
  };

  const handleNextPin = () => {
    if (currentPinIndex >= 0 && currentPinIndex < activeSnapshots.length - 1) {
      setSelectedPin(activeSnapshots[currentPinIndex + 1]);
    } else if (activeSnapshots.length > 0) {
      setSelectedPin(activeSnapshots[0]);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT COLUMN: SCAN SETTINGS */}
        <aside className="rounded-xl border border-base-300 bg-base-100 p-5 xl:max-h-[860px] xl:overflow-y-auto">
          <div className="mb-5 flex items-center gap-2">
            <MapPinned className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Scan settings</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <GmbProfileSearch
              projectId={projectId}
              locationCode={locationCode}
              onLocationCodeChange={setLocationCode}
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
                      onClick={() => {
                        setDistanceUnit("mi");
                        setRadiusMeters(4828);
                      }}
                    >
                      mi
                    </button>
                    <button
                      type="button"
                      className={`join-item btn btn-xs px-2 ${distanceUnit === "km" ? "btn-primary font-bold" : "btn-ghost text-base-content/60"}`}
                      onClick={() => {
                        setDistanceUnit("km");
                        setRadiusMeters(5000);
                      }}
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
                {configs.map((config) => (
                  <button
                    key={config.id}
                    type="button"
                    disabled={!config.latestRun}
                    onClick={() =>
                      config.latestRun && setActiveRunId(config.latestRun.id)
                    }
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      config.latestRun?.id === activeRunId
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-base-300 hover:bg-base-200"
                    } disabled:opacity-50`}
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
                      <span
                        className={`badge badge-sm uppercase font-mono ${
                          config.latestRun.status === "completed"
                            ? "badge-success"
                            : config.latestRun.status === "running"
                              ? "badge-primary"
                              : "badge-ghost"
                        }`}
                      >
                        {config.latestRun.status}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: REAL MAP & PIN INSPECTOR & LEADERBOARD */}
        <section className="flex flex-col gap-4 xl:col-span-2 xl:min-h-[860px] relative">
          {isDemo && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 shrink-0" />
                <span className="font-semibold">
                  Interactive Demo Preview · Click any pin on the map to inspect
                  real-time rankings & local competitors.
                </span>
              </div>
              <span className="badge badge-sm badge-primary font-bold">
                SAMPLE DATA
              </span>
            </div>
          )}

          {activeRun && (
            <GmbScanPipeline
              run={activeRun}
              snapshots={activeSnapshots}
              onRetryFailed={() =>
                runData ? retryMutation.mutate(runData.run.id) : undefined
              }
              isRetrying={retryMutation.isPending}
            />
          )}

          {/* Filter Bar & View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-base-100 p-2.5 rounded-xl border border-base-300 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className={`btn btn-xs rounded-lg font-bold ${
                  activeFilter === "all"
                    ? "btn-neutral"
                    : "btn-ghost border border-base-300"
                }`}
                onClick={() => setActiveFilter("all")}
              >
                All ({activeSnapshots.length})
              </button>
              <button
                type="button"
                className={`btn btn-xs rounded-lg font-bold gap-1 ${
                  activeFilter === "top3"
                    ? "btn-success text-white"
                    : "btn-ghost border border-base-300 text-success"
                }`}
                onClick={() => setActiveFilter("top3")}
              >
                <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                Top 3 ({top3Count})
              </button>
              <button
                type="button"
                className={`btn btn-xs rounded-lg font-bold gap-1 ${
                  activeFilter === "top10"
                    ? "btn-warning text-white"
                    : "btn-ghost border border-base-300 text-warning"
                }`}
                onClick={() => setActiveFilter("top10")}
              >
                <span className="size-2 rounded-full bg-amber-500 inline-block" />
                4 - 10 ({top10Count})
              </button>
              <button
                type="button"
                className={`btn btn-xs rounded-lg font-bold gap-1 ${
                  activeFilter === "rank11Plus"
                    ? "btn-error text-white"
                    : "btn-ghost border border-base-300 text-error"
                }`}
                onClick={() => setActiveFilter("rank11Plus")}
              >
                <span className="size-2 rounded-full bg-rose-500 inline-block" />
                11+ ({rank11PlusCount})
              </button>
              <button
                type="button"
                className={`btn btn-xs rounded-lg font-bold gap-1 ${
                  activeFilter === "notFound"
                    ? "btn-neutral"
                    : "btn-ghost border border-base-300 text-base-content/60"
                }`}
                onClick={() => setActiveFilter("notFound")}
              >
                <span className="size-2 rounded-full bg-slate-400 inline-block" />
                Unranked ({notFoundCount})
              </button>
            </div>

            <div className="join border border-base-300 rounded-lg">
              <button
                type="button"
                className={`join-item btn btn-xs gap-1.5 ${
                  viewTab === "map" ? "btn-primary font-bold" : "btn-ghost"
                }`}
                onClick={() => setViewTab("map")}
              >
                <MapIcon className="size-3.5" />
                Map & Pins
              </button>
              <button
                type="button"
                className={`join-item btn btn-xs gap-1.5 ${
                  viewTab === "competitors"
                    ? "btn-primary font-bold"
                    : "btn-ghost"
                }`}
                onClick={() => setViewTab("competitors")}
              >
                <Trophy className="size-3.5" />
                Leaderboard
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {viewTab === "competitors" ? (
            <div className="flex-1 min-h-[580px]">
              <GmbCompetitorLeaderboard
                snapshots={activeSnapshots}
                targetBusinessName={businessName}
                targetPlaceId={
                  centerSource && "placeId" in centerSource
                    ? centerSource.placeId
                    : null
                }
              />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 h-[620px] relative">
              <div className="flex-1 h-full min-h-[440px]">
                <GmbMap
                  centerLat={mapCenterLat}
                  centerLng={mapCenterLng}
                  radiusMeters={mapRadius}
                  hasSelection={hasSelection || isDemo}
                  defaultZoom={defaultCoords.zoom}
                  businessName={businessName}
                  snapshots={activeSnapshots}
                  selectedPinId={selectedPin?.id}
                  activeFilter={activeFilter}
                  onSelectSnapshot={(pin) => setSelectedPin(pin)}
                />
              </div>

              {selectedPin ? (
                <div className="w-full lg:w-[380px] xl:w-[420px] h-full shrink-0 animate-in fade-in slide-in-from-right-4 duration-150">
                  <GmbPinInspector
                    pin={selectedPin}
                    centerLat={mapCenterLat}
                    centerLng={mapCenterLng}
                    targetBusinessName={businessName}
                    targetPlaceId={
                      centerSource && "placeId" in centerSource
                        ? centerSource.placeId
                        : null
                    }
                    unit={distanceUnit}
                    onClose={() => setSelectedPin(null)}
                    onPrevPin={handlePrevPin}
                    onNextPin={handleNextPin}
                  />
                </div>
              ) : (
                <div className="hidden lg:flex w-[260px] flex-col justify-center items-center rounded-xl border border-dashed border-base-300 p-6 text-center text-xs text-base-content/60 bg-base-100/50">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <MousePointerClick className="size-5" />
                  </div>
                  <p className="font-bold text-sm text-base-content">
                    Pin Inspector
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Click any pin on the map to inspect its real-time Google
                    Maps ranking and see all local competitors.
                  </p>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-primary mt-4 gap-1.5"
                    onClick={() => setViewTab("competitors")}
                  >
                    <Trophy className="size-3" />
                    View Leaderboard
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6">
        <GmbGridReportSection
          projectId={projectId}
          onSelectRunId={(runId) => setActiveRunId(runId)}
        />
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
              {scan.gridSize * scan.gridSize} queued Google Maps checks
            </p>
          </div>
          <p className="font-mono font-semibold">
            ${estimate.estimatedCostUsd.toFixed(4)}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Confirm & run scan
        </button>
      </div>
    </Modal>
  );
}
