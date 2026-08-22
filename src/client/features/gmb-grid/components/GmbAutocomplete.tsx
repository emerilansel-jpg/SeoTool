import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  getDetails,
} from "use-places-autocomplete";
import { Search, MapPin } from "lucide-react";

interface GmbAutocompleteProps {
  onSelectProfile: (
    placeId: string,
    name: string,
    lat: number,
    lng: number,
    website?: string,
  ) => void;
}

export function GmbAutocomplete({ onSelectProfile }: GmbAutocompleteProps) {
  const {
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Types allows general establishments
      types: ["establishment"],
    },
    debounce: 300,
  });

  const handleSelect = async (
    suggestion: google.maps.places.AutocompletePrediction,
  ) => {
    setValue(suggestion.description, false);
    clearSuggestions();

    try {
      // Get detailed coordinates
      const results = await getGeocode({ placeId: suggestion.place_id });
      const { lat, lng } = getLatLng(results[0]);

      // Attempt to get website via places details
      let website = undefined;
      try {
        const details = (await getDetails({
          placeId: suggestion.place_id,
          fields: ["website", "name"],
          // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
        })) as google.maps.places.PlaceResult;

        if (typeof details !== "string" && details.website) {
          website = details.website;
        }
      } catch (err) {
        console.error("Failed to fetch full place details for website", err);
      }

      onSelectProfile(
        suggestion.place_id,
        suggestion.structured_formatting.main_text,
        lat,
        lng,
        website,
      );
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="relative w-full z-50">
      <label className="text-sm font-medium mb-1 block">Business Name</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            // If the user types manually, immediately report the text up as the place name
            // (but with no placeId and 0/0 coords) so the form isn't completely blocked
            // if Google Maps API fails to load.
            onSelectProfile("", e.target.value, 0, 0, undefined);
          }}
          disabled={false}
          placeholder="Type your Google Business Name..."
          className="input input-bordered w-full pl-10"
          autoComplete="off"
        />
        <Search className="absolute left-3 top-3 w-5 h-5 text-base-content/40" />
      </div>

      {status === "OK" && (
        <ul className="absolute z-50 mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {data.map((suggestion) => {
            const { place_id, structured_formatting } = suggestion;
            return (
              <li
                key={place_id}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-3 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0 flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-base-content text-sm">
                    {structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {structured_formatting.secondary_text}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
