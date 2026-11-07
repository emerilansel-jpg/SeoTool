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
import { isGoogleMapsUrl } from "@/shared/google-maps-url";
import { GmbManualEntryForm } from "./GmbManualEntryForm";

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
  const [internalLocationCode, setInternalLocationCode] =
    useState(defaultLocation);

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
  const [pendingUrl, setPendingUrl] = useState("");

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

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (isGoogleMapsUrl(val)) {
      setPendingUrl(val.trim());
      setShowManual(true);
    }
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
          className="text-xs text-primary hover:underline font-medium"
        >
          {showManual ? "Search by Name" : "Manual / URL entry"}
        </button>
      </div>

      {showManual ? (
        <GmbManualEntryForm
          initialUrl={pendingUrl}
          onSelect={(profile) => {
            onSelect(profile);
          }}
        />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/60 shrink-0">
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
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (isGoogleMapsUrl(query)) {
                      setPendingUrl(query.trim());
                      setShowManual(true);
                    } else if (query.trim().length >= 3) {
                      search.mutate();
                    }
                  }
                }}
                placeholder="Business name, city, or Google Maps URL"
                className="min-w-0 grow"
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="btn btn-primary join-item"
              disabled={query.trim().length < 3 || search.isPending}
              onClick={() => {
                if (isGoogleMapsUrl(query)) {
                  setPendingUrl(query.trim());
                  setShowManual(true);
                } else {
                  search.mutate();
                }
              }}
            >
              {search.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Find"
              )}
            </button>
          </div>
          <p className="text-xs text-base-content/60">
            Select the exact listing or paste a Google Maps URL. Ranking is
            matched by Google Place ID and CID.
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
                Make sure the Target Country matches where the business is
                located, or switch to{" "}
                <button
                  type="button"
                  onClick={() => setShowManual(true)}
                  className="text-primary underline font-medium"
                >
                  Manual / URL entry
                </button>{" "}
                to paste the direct Google Maps link.
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
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{profile.businessName}</p>
                      {profile.address && (
                        <p className="truncate text-xs text-base-content/70">
                          {profile.address}
                        </p>
                      )}
                      {profile.category && (
                        <span className="badge badge-xs badge-ghost mt-1 font-normal text-base-content/70">
                          {profile.category}
                        </span>
                      )}
                    </div>
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
