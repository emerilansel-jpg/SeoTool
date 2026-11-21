import { ExternalLink, MapPin, RefreshCw } from "lucide-react";

export interface GbpSnapshot {
  title: string | null;
  address: string | null;
  phone: string | null;
  url: string | null;
  category: string | null;
  ratingValue: number | null;
  ratingCount: number | null;
  latitude: number | null;
  longitude: number | null;
}

// The gbp_profiles row stores the GBP info snapshot as a JSON string.
export function parseSnapshot(row: {
  profileJson: string | null;
}): GbpSnapshot | null {
  if (!row.profileJson) return null;
  try {
    const parsed = JSON.parse(row.profileJson) as Partial<GbpSnapshot> | null;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      title: parsed.title ?? null,
      address: parsed.address ?? null,
      phone: parsed.phone ?? null,
      url: parsed.url ?? null,
      category: parsed.category ?? null,
      ratingValue: parsed.ratingValue ?? null,
      ratingCount: parsed.ratingCount ?? null,
      latitude: parsed.latitude ?? null,
      longitude: parsed.longitude ?? null,
    };
  } catch {
    return null;
  }
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  const filled = Math.max(1, Math.min(5, Math.round(rating)));
  return (
    <span className="text-warning whitespace-nowrap">{"★".repeat(filled)}</span>
  );
}

function fmtDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(
    value.includes("T") ? value : `${value.replace(" ", "T")}Z`,
  );
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function GbpProfileCard({
  snapshot,
  keyword,
  fetchedAt,
  refreshing,
  onRefresh,
}: {
  snapshot: GbpSnapshot;
  keyword: string;
  fetchedAt: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const mapUrl =
    snapshot.latitude != null && snapshot.longitude != null
      ? `https://www.google.com/maps?q=${snapshot.latitude},${snapshot.longitude}`
      : null;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg">
              {snapshot.title ?? keyword}
            </h3>
            {snapshot.category ? (
              <span className="badge badge-ghost badge-sm mt-1">
                {snapshot.category}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className={`btn btn-outline btn-sm gap-2 ${refreshing ? "loading" : ""}`}
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className="size-4" />
            Refresh profile
          </button>
        </div>
        {snapshot.ratingValue != null ? (
          <p className="flex items-center gap-2 text-sm">
            <Stars rating={snapshot.ratingValue} />
            <span className="font-medium">
              {snapshot.ratingValue.toFixed(1)}
            </span>
            <span className="text-base-content/60">
              ({snapshot.ratingCount ?? 0} reviews)
            </span>
          </p>
        ) : null}
        {snapshot.address ? (
          <p className="flex items-center gap-2 text-sm text-base-content/70">
            <MapPin className="size-4 shrink-0" />
            {snapshot.address}
          </p>
        ) : null}
        {snapshot.phone ? (
          <p className="text-sm text-base-content/70">
            Phone: {snapshot.phone}
          </p>
        ) : null}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="link link-primary inline-flex items-center gap-1"
            >
              Open in Google Maps
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
          {snapshot.url ? (
            <a
              href={snapshot.url}
              target="_blank"
              rel="noreferrer"
              className="link link-primary inline-flex items-center gap-1"
            >
              Profile link
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
          {fetchedAt ? (
            <span className="text-xs text-base-content/40">
              Fetched {fmtDate(fetchedAt)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ReviewCard({
  review,
}: {
  review: {
    id: string;
    author: string | null;
    rating: number | null;
    text: string | null;
    ownerAnswer: string | null;
    reviewedAt: string | null;
    fetchedAt: string;
  };
}) {
  const date = fmtDate(review.reviewedAt ?? review.fetchedAt);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {review.author ?? "Google user"}
            </span>
            <Stars rating={review.rating} />
          </div>
          {date ? (
            <span className="text-xs text-base-content/50">{date}</span>
          ) : null}
        </div>
        {review.text ? (
          <p className="text-sm whitespace-pre-line">{review.text}</p>
        ) : null}
        {review.ownerAnswer ? (
          <div className="mt-1 border-l-4 border-base-300 pl-3 text-sm text-base-content/70">
            <p className="text-xs font-medium text-base-content/50">
              Response from the owner
            </p>
            <p className="whitespace-pre-line">{review.ownerAnswer}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
