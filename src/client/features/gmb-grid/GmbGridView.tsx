import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGmbGridConfigs,
  getGmbGridSnapshots,
  createGmbGridRun,
  scanGmbKeywords,
} from "@/serverFunctions/gmb-grid";
import type { CreateGmbGridInput } from "@/server/features/gmb-grid/gmb-grid.schema";
import { GmbAutocomplete } from "./components/GmbAutocomplete";
import { GmbScanPipeline } from "./components/GmbScanPipeline";
import { GmbMap } from "./components/GmbMap";
import { Loader2, Sparkles } from "lucide-react";

type FormInputs = HTMLFormControlsCollection & Record<string, HTMLInputElement>;

// DOM form collections are loosely typed; index them by field name.
const getFormInputs = (form: HTMLFormElement): FormInputs =>
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
  form.elements as FormInputs;

export function GmbGridView({ projectId }: { projectId: string }) {
  const getConfigs = useServerFn(getGmbGridConfigs);
  const getSnapshots = useServerFn(getGmbGridSnapshots);
  const createRun = useServerFn(createGmbGridRun);
  const scanKeywordsFn = useServerFn(scanGmbKeywords);
  const queryClient = useQueryClient();

  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string | undefined>();
  const [scannedKeywords, setScannedKeywords] = useState<Array<{
    keyword: string;
    rank: number;
  }> | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const { data: configs } = useQuery({
    queryKey: ["gmb-configs", projectId],
    queryFn: () => getConfigs({ data: projectId }),
  });

  const { data: runData } = useQuery({
    queryKey: ["gmb-snapshots", activeRunId],
    queryFn: () => getSnapshots({ data: activeRunId! }),
    enabled: !!activeRunId,
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? 3000 : false,
  });
  const snapshots = runData?.snapshots;

  const createRunMutation = useMutation({
    mutationFn: async (data: CreateGmbGridInput) => await createRun({ data }),
  });

  const scanKeywordsMutation = useMutation({
    mutationFn: async (data: {
      placeId: string;
      businessName: string;
      website?: string;
      lat: number;
      lng: number;
    }) => await scanKeywordsFn({ data }),
    onSuccess: (data) => setScannedKeywords(data),
  });

  const handleProfileSelect = (
    placeId: string,
    name: string,
    lat: number,
    lng: number,
    website?: string,
  ) => {
    if (formRef.current) {
      const inputs = getFormInputs(formRef.current);
      if (inputs.businessName) inputs.businessName.value = name;
      // Manual typing (no placeId) must not clobber the user's coordinates.
      if (placeId) {
        if (inputs.centerLat) inputs.centerLat.value = String(lat);
        if (inputs.centerLng) inputs.centerLng.value = String(lng);
      }
    }

    if (placeId) {
      setSelectedPlaceId(placeId);
      setSelectedWebsite(website);
    }
  };

  const onAutoScanKeywords = () => {
    if (!formRef.current) return;
    const inputs = getFormInputs(formRef.current);
    if (!selectedPlaceId || !inputs.businessName?.value) return;

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
      const inputs = getFormInputs(formRef.current);
      if (inputs.keyword) inputs.keyword.value = kw;
    }
    setScannedKeywords(null);
  };

  const handleStartScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const field = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };
    const runId = crypto.randomUUID();
    setScanError(null);
    // Poll immediately so the pipeline panel tracks progress while the
    // server runs the synchronous live scan.
    setActiveRunId(runId);
    createRunMutation.mutate(
      {
        projectId,
        runId,
        businessName: field("businessName"),
        keyword: field("keyword"),
        centerLat: parseFloat(field("centerLat")),
        centerLng: parseFloat(field("centerLng")),
        gridSize: parseInt(field("gridSize"), 10),
        radiusMeters: parseInt(field("radiusMeters"), 10),
      },
      {
        onSuccess: () => {
          // Nudge the poll query so final results appear without waiting
          // for the next interval tick.
          void queryClient.invalidateQueries({
            queryKey: ["gmb-snapshots", runId],
          });
        },
        onError: (err: Error) => {
          setScanError(
            err?.message ||
              "Could not reach the scan service. Please try again.",
          );
        },
      },
    );
  };

  const activeConfig = configs?.[0];
  const mapCenterLat = activeConfig?.centerLat || 32.7157;
  const mapCenterLng = activeConfig?.centerLng || -117.1611;
  const mapRadius = activeConfig?.radiusMeters || 1000;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-base-100 p-6 rounded-lg border border-base-300 md:max-h-[800px] md:overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Scan Settings</h2>

        <form
          ref={formRef}
          onSubmit={handleStartScan}
          className="flex flex-col gap-4 relative z-10"
        >
          <GmbAutocomplete onSelectProfile={handleProfileSelect} />

          <div>
            <label className="text-sm font-medium flex justify-between">
              Search Query / Keyword
              {selectedPlaceId && (
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
                  onClick={() => c.lastRunId && setActiveRunId(c.lastRunId)}
                  className={`p-2 border rounded cursor-pointer hover:bg-base-200 ${c.lastRunId ? "" : "opacity-50 cursor-default"}`}
                >
                  {c.keyword} - {c.gridSize}x{c.gridSize}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="md:col-span-2 flex flex-col gap-4 min-h-[500px] md:h-[800px]">
        {activeRunId && (
          <GmbScanPipeline
            isScanning={createRunMutation.isPending}
            runStatus={runData?.status}
            snapshots={snapshots}
            error={scanError}
          />
        )}

        <GmbMap
          centerLat={mapCenterLat}
          centerLng={mapCenterLng}
          radiusMeters={mapRadius}
          snapshots={snapshots}
        />
      </div>

      {scannedKeywords && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 text-base-content rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Detected Rankings</h3>
            <p className="text-sm text-base-content/70 mb-4">
              {scannedKeywords.length === 0
                ? "Could not find any top 20 rankings for extracted seeds."
                : "We found this profile ranking for these keywords. Click one to track its heatmap grid."}
            </p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {scannedKeywords.map((sk) => (
                <button
                  key={sk.keyword}
                  onClick={() => useScannedKeyword(sk.keyword)}
                  className="flex justify-between items-center p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-primary/5 transition-colors"
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
