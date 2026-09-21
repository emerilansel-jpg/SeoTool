import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MapPin, Search } from "lucide-react";
import { searchGmbProfiles } from "@/serverFunctions/gmb-grid";
import { LocationSelect } from "@/client/components/LocationSelect";
import {
  DEFAULT_LOCATION_CODE,
  LOCATION_OPTIONS,
} from "@/shared/keyword-locations";
import { useProjectMarket } from "@/client/features/projects/useProjectMarket";

export interface GmbProfileSelection {
  businessName: string;
  placeId: string;
  cid: string | null;
  address: string | null;
  category: string | null;
  domain: string | null;
  url: string | null;
  lat: number;
  lng: number;
}

export function GmbProfileSearch({
  projectId,
  locationCode: externalLocationCode,
  onLocationCodeChange,
  selected,
  onSelect,
}: {
  projectId: string;
  locationCode?: number;
  onLocationCodeChange?: (locationCode: number) => void;
  selected: GmbProfileSelection | null;
  onSelect: (profile: GmbProfileSelection) => void;
}) {
  const projectMarket = useProjectMarket(projectId);
  const defaultLocation = projectMarket?.locationCode ?? DEFAULT_LOCATION_CODE;
  const [internalLocationCode, setInternalLocationCode] = useState(defaultLocation);

  useEffect(() => {
    if (projectMarket?.locationCode && !externalLocationCode) {
      setInternalLocationCode(projectMarket.locationCode);
      onLocationCodeChange?.(projectMarket.locationCode);
    }
  }, [projectMarket?.locationCode, externalLocationCode, onLocationCodeChange]);

  const activeLocationCode = externalLocationCode ?? internalLocationCode;

  const handleLocationChange = (code: number) => {
    setInternalLocationCode(code);
    onLocationCodeChange?.(code);
  };

  const activeCountry =
    LOCATION_OPTIONS.find((option) => option.code === activeLocationCode)
      ?.label ?? "Selected Country";

  const searchProfiles = useServerFn(searchGmbProfiles);
  const [query, setQuery] = useState("");
  const [showManual, setShowManual] = useState(false);

  // Manual entry fields
  const [manualName, setManualName] = useState("");
  const [manualPlaceId, setManualPlaceId] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualAddress, setManualAddress] = useState("");

  const search = useMutation({
    mutationFn: () =>
      searchProfiles({
        data: {
          projectId,
          query,
          locationCode: activeLocationCode,
        },
      }),
  });

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!manualName.trim() || !manualPlaceId.trim() || isNaN(lat) || isNaN(lng)) {
      return;
    }
    onSelect({
      businessName: manualName.trim(),
      placeId: manualPlaceId.trim(),
      cid: null,
      address: manualAddress.trim() || null,
      category: null,
      domain: null,
      url: null,
      lat,
      lng,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="gmb-profile-query" className="text-sm font-medium">
          Google Business Profile
        </label>
        <button
          type="button"
          onClick={() => setShowManual((prev) => !prev)}
          className="text-xs text-primary hover:underline"
        >
          {showManual ? "Search Google Maps" : "Manual entry"}
        </button>
      </div>

      {showManual ? (
        <div className="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3 text-sm">
          <p className="text-xs text-base-content/70">
            Specify business details and coordinates directly if not found via search.
          </p>
          <label className="form-control gap-1">
            <span className="text-xs font-medium">Business Name</span>
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="e.g. Pakuwon Mall"
              className="input input-sm input-bordered w-full"
            />
          </label>
          <label className="form-control gap-1">
            <span className="text-xs font-medium">Google Place ID</span>
            <input
              value={manualPlaceId}
              onChange={(e) => setManualPlaceId(e.target.value)}
              placeholder="e.g. ChIJ..."
              className="input input-sm input-bordered w-full"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="form-control gap-1">
              <span className="text-xs font-medium">Latitude</span>
              <input
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="-7.289"
                className="input input-sm input-bordered w-full"
              />
            </label>
            <label className="form-control gap-1">
              <span className="text-xs font-medium">Longitude</span>
              <input
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="112.675"
                className="input input-sm input-bordered w-full"
              />
            </label>
          </div>
          <label className="form-control gap-1">
            <span className="text-xs font-medium">Address (optional)</span>
            <input
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Jl. Mayjend. Jonosewojo No.2, Surabaya"
              className="input input-sm input-bordered w-full"
            />
          </label>
          <button
            type="button"
            disabled={
              !manualName.trim() ||
              !manualPlaceId.trim() ||
              !manualLat.trim() ||
              !manualLng.trim()
            }
            onClick={handleManualSubmit}
            className="btn btn-sm btn-primary w-full"
          >
            Apply Target Listing
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <span className="text-xs font-medium text-base-content/70 sm:w-28 shrink-0">
              Target Country:
            </span>
            <div className="flex-1">
              <LocationSelect
                value={activeLocationCode}
                onChange={handleLocationChange}
              />
            </div>
          </div>

          <div className="join w-full">
            <label className="input input-bordered join-item flex flex-1 items-center gap-2">
              <Search className="size-4 text-base-content/40" />
              <input
                id="gmb-profile-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (query.trim().length >= 3) search.mutate();
                  }
                }}
                placeholder="Business name and city"
                className="min-w-0 grow"
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="btn btn-primary join-item"
              disabled={query.trim().length < 3 || search.isPending}
              onClick={() => search.mutate()}
            >
              {search.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Find"
              )}
            </button>
          </div>
          <p className="text-xs text-base-content/60">
            Select the exact listing. Ranking is matched by Google Place ID, not by
            a similar business name.
          </p>

          {search.isError && (
            <p className="text-sm text-error" role="alert">
              {search.error.message || "Could not search Google Maps listings."}
            </p>
          )}

          {search.data && search.data.length === 0 && (
            <div className="rounded-lg border border-base-300 bg-base-200/50 p-3 text-sm space-y-1">
              <p className="font-semibold">
                No matching listings found in {activeCountry}.
              </p>
              <p className="text-xs text-base-content/70">
                Make sure the Target Country above matches where the business is located,
                or append the city name (e.g. &ldquo;Pakuwon Mall Surabaya&rdquo;).
              </p>
            </div>
          )}

          {search.data && search.data.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-base-300 p-2">
              {search.data.map((profile) => {
                const isSelected = selected?.placeId === profile.placeId;
                return (
                  <button
                    key={profile.placeId}
                    type="button"
                    onClick={() => onSelect(profile)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:bg-base-200"
                    }`}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    ) : (
                      <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                    )}
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {profile.businessName}
                      </span>
                      <span className="block text-xs text-base-content/60">
                        {[profile.category, profile.address]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
