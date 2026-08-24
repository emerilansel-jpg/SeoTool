import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MapPin, Search } from "lucide-react";
import { searchGmbProfiles } from "@/serverFunctions/gmb-grid";

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
  selected,
  onSelect,
}: {
  projectId: string;
  selected: GmbProfileSelection | null;
  onSelect: (profile: GmbProfileSelection) => void;
}) {
  const searchProfiles = useServerFn(searchGmbProfiles);
  const [query, setQuery] = useState("");
  const search = useMutation({
    mutationFn: () => searchProfiles({ data: { projectId, query } }),
  });

  return (
    <div className="space-y-2">
      <label htmlFor="gmb-profile-query" className="text-sm font-medium">
        Google Business Profile
      </label>
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
        <p className="rounded-lg border border-base-300 bg-base-200/50 p-3 text-sm">
          No matching listings found. Add the city or neighborhood and try
          again.
        </p>
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
    </div>
  );
}
