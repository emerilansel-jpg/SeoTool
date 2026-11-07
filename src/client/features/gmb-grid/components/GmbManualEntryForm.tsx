import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link2, Loader2, Sparkles } from "lucide-react";
import { resolveGoogleMapsUrl } from "@/serverFunctions/gmb-grid";
import {
  isGoogleMapsUrl,
  isShortGoogleMapsUrl,
  parseGoogleMapsUrl,
  type ParsedGoogleMapsInfo,
} from "@/shared/google-maps-url";
import type { GmbProfileSelection } from "./GmbProfileSearch";

export function GmbManualEntryForm({
  initialUrl = "",
  onSelect,
}: {
  initialUrl?: string;
  onSelect: (profile: GmbProfileSelection) => void;
}) {
  const resolveUrl = useServerFn(resolveGoogleMapsUrl);
  const [manualUrl, setManualUrl] = useState(initialUrl);
  const [manualName, setManualName] = useState("");
  const [manualPlaceId, setManualPlaceId] = useState("");
  const [manualCid, setManualCid] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  const applyParsedData = (parsed: ParsedGoogleMapsInfo) => {
    if (parsed.businessName) setManualName(parsed.businessName);
    if (parsed.lat != null) setManualLat(String(parsed.lat));
    if (parsed.lng != null) setManualLng(String(parsed.lng));
    if (parsed.placeId) setManualPlaceId(parsed.placeId);
    if (parsed.cid) setManualCid(parsed.cid);
    if (parsed.address) setManualAddress(parsed.address);

    const parts: string[] = [];
    if (parsed.businessName) parts.push(`"${parsed.businessName}"`);
    if (parsed.lat != null && parsed.lng != null) {
      parts.push(`coords: ${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`);
    }
    if (parsed.cid) parts.push(`CID: ${parsed.cid}`);

    setUrlMessage(
      parts.length > 0
        ? `✓ Auto-filled: ${parts.join(" · ")}`
        : "✓ Coordinates detected",
    );

    if (
      parsed.businessName &&
      parsed.placeId &&
      parsed.lat != null &&
      parsed.lng != null
    ) {
      onSelect({
        businessName: parsed.businessName.trim(),
        placeId: parsed.placeId.trim(),
        cid: parsed.cid || null,
        address: parsed.address || null,
        category: null,
        domain: null,
        url: parsed.rawUrl || null,
        lat: parsed.lat,
        lng: parsed.lng,
      });
    }
  };

  const handleUrlChange = async (val: string) => {
    setManualUrl(val);
    setUrlMessage(null);
    const trimmed = val.trim();
    if (!trimmed) return;

    if (isGoogleMapsUrl(trimmed)) {
      if (isShortGoogleMapsUrl(trimmed)) {
        setIsResolvingUrl(true);
        try {
          const res = await resolveUrl({ data: { url: trimmed } });
          if (res) {
            applyParsedData(res);
          } else {
            setUrlMessage("Could not resolve details from short link.");
          }
        } catch {
          setUrlMessage("Error resolving short link.");
        } finally {
          setIsResolvingUrl(false);
        }
      } else {
        const parsed = parseGoogleMapsUrl(trimmed);
        if (parsed) {
          applyParsedData(parsed);
        } else {
          setUrlMessage("Could not parse coordinates from this URL.");
        }
      }
    }
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (
      !manualName.trim() ||
      !manualPlaceId.trim() ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return;
    }
    onSelect({
      businessName: manualName.trim(),
      placeId: manualPlaceId.trim(),
      cid: manualCid || null,
      address: manualAddress.trim() || null,
      category: null,
      domain: null,
      url: manualUrl.trim() || null,
      lat,
      lng,
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-base-content/70">
          Paste a Google Maps URL to auto-fill all coordinates & business info.
        </p>
        <span className="badge badge-xs badge-primary font-mono text-[10px]">
          URL Auto-Fill
        </span>
      </div>

      <label className="form-control gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <Link2 className="size-3.5" /> Google Maps URL
          </span>
          {isResolvingUrl && (
            <span className="flex items-center gap-1 text-[11px] text-primary">
              <Loader2 className="size-3 animate-spin" /> Resolving URL...
            </span>
          )}
        </div>
        <input
          value={manualUrl}
          onChange={(e) => void handleUrlChange(e.target.value)}
          placeholder="https://www.google.com/maps/place/... or maps.app.goo.gl/..."
          className="input input-sm input-bordered w-full font-mono text-xs focus:input-primary"
        />
        {urlMessage && (
          <p
            className={`text-[11px] mt-1 font-medium ${
              urlMessage.startsWith("✓")
                ? "text-success bg-success/10 border border-success/20 rounded p-1.5"
                : "text-warning"
            }`}
          >
            {urlMessage}
          </p>
        )}
      </label>

      <div className="divider my-0 text-[10px] text-base-content/40 uppercase">
        Business Details
      </div>

      <label className="form-control gap-1">
        <span className="text-xs font-medium">Business Name</span>
        <input
          value={manualName}
          onChange={(e) => setManualName(e.target.value)}
          placeholder="e.g. Lapis Patios & Hardscapes"
          className="input input-sm input-bordered w-full"
        />
      </label>

      <label className="form-control gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Google Place ID / CID</span>
          {manualCid && (
            <span className="text-[10px] font-mono text-base-content/50">
              CID: {manualCid}
            </span>
          )}
        </div>
        <input
          value={manualPlaceId}
          onChange={(e) => setManualPlaceId(e.target.value)}
          placeholder="e.g. 0x88569f73...:0xfb53b... or ChIJ..."
          className="input input-sm input-bordered w-full font-mono text-xs"
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
            placeholder="35.288245"
            className="input input-sm input-bordered w-full font-mono text-xs"
          />
        </label>
        <label className="form-control gap-1">
          <span className="text-xs font-medium">Longitude</span>
          <input
            type="number"
            step="any"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            placeholder="-80.870224"
            className="input input-sm input-bordered w-full font-mono text-xs"
          />
        </label>
      </div>

      <label className="form-control gap-1">
        <span className="text-xs font-medium">Address (optional)</span>
        <input
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          placeholder="e.g. Charlotte, NC"
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
        className="btn btn-sm btn-primary w-full gap-1.5"
      >
        <Sparkles className="size-3.5" />
        Apply Target Listing
      </button>
    </div>
  );
}
