import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  checkGbpReviewsTask,
  fetchGbpProfile,
  fetchGbpReviews,
  getGbpProfile,
  listGbpReviews,
} from "@/serverFunctions/nap";
import {
  GbpProfileCard,
  parseSnapshot,
  ReviewCard,
} from "./components/GbpReviewCards";

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="form-control gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input className="input input-bordered w-full" {...props} />
    </label>
  );
}

type ProfileFetchInput = {
  keyword: string;
  locationCode?: number;
  languageCode?: string;
};

export function GoogleReviewsView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["gbp-profile", projectId],
    queryFn: () => getGbpProfile({ data: { projectId } }),
  });

  const reviewsQuery = useQuery({
    queryKey: ["gbp-reviews", projectId],
    queryFn: () => listGbpReviews({ data: { projectId } }),
  });

  const profileRow = profileQuery.data ?? null;
  const snapshot = profileRow ? parseSnapshot(profileRow) : null;

  const fetchProfile = useMutation({
    mutationFn: (input: ProfileFetchInput) =>
      fetchGbpProfile({ data: { projectId, ...input } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["gbp-profile", projectId],
      });
      toast.success("Google Business Profile fetched.");
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to fetch profile"));
    },
  });

  const fetchReviews = useMutation({
    mutationFn: (input: ProfileFetchInput) =>
      fetchGbpReviews({ data: { projectId, ...input } }),
    onSuccess: (result) => {
      if (result.status === "done") {
        void queryClient.invalidateQueries({
          queryKey: ["gbp-reviews", projectId],
        });
        toast.success(`Fetched ${result.fetched} reviews.`);
      } else {
        setPendingTaskId(result.taskId);
        toast.info("Task queued, click Check status.");
      }
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to fetch reviews"));
    },
  });

  const checkTask = useMutation({
    mutationFn: (taskId: string) =>
      checkGbpReviewsTask({ data: { projectId, taskId } }),
    onSuccess: (result) => {
      if (result.status === "done") {
        setPendingTaskId(null);
        void queryClient.invalidateQueries({
          queryKey: ["gbp-reviews", projectId],
        });
        toast.success(`Fetched ${result.fetched} reviews.`);
      } else {
        toast.info("Still processing. Click Check status again in a moment.");
      }
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to check task status"),
      );
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    const parsedLocation = locationCode.trim()
      ? Number(locationCode.trim())
      : undefined;
    if (locationCode.trim() && !Number.isFinite(parsedLocation)) {
      toast.error("Location code must be a number.");
      return;
    }
    fetchProfile.mutate({
      keyword: keyword.trim(),
      locationCode: parsedLocation,
      languageCode: languageCode.trim() || undefined,
    });
  };

  // Refresh profile and fetch reviews reuse the stored keyword and locale.
  const storedProfileInput = profileRow
    ? {
        keyword: profileRow.keyword,
        locationCode: profileRow.locationCode,
        languageCode: profileRow.languageCode,
      }
    : null;

  if (profileQuery.isPending) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {snapshot && profileRow ? (
        <GbpProfileCard
          snapshot={snapshot}
          keyword={profileRow.keyword}
          fetchedAt={profileRow.fetchedAt}
          refreshing={fetchProfile.isPending}
          onRefresh={() => {
            if (storedProfileInput) fetchProfile.mutate(storedProfileInput);
          }}
        />
      ) : (
        <form
          onSubmit={handleProfileSubmit}
          className="card bg-base-100 border border-base-300"
        >
          <div className="card-body gap-3">
            <h3 className="font-medium">Google Business Profile</h3>
            <Field
              label="Business keyword *"
              placeholder="e.g. Ace Dental Studio Austin"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Location code"
                placeholder="2840 (United States)"
                inputMode="numeric"
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
              />
              <Field
                label="Language code"
                placeholder="en"
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className={`btn btn-primary gap-2 ${fetchProfile.isPending ? "loading" : ""}`}
                disabled={fetchProfile.isPending}
              >
                <Star className="size-4" />
                Fetch profile
              </button>
              <span className="text-xs text-base-content/50">
                Looks up the Google Business Profile for this keyword.
              </span>
            </div>
          </div>
        </form>
      )}

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-b border-base-300 flex items-center gap-3 flex-wrap">
            <h3 className="font-medium">Latest reviews</h3>
            {reviewsQuery.data ? (
              <span className="badge badge-ghost badge-sm">
                {reviewsQuery.data.length}
              </span>
            ) : null}
            <button
              type="button"
              className={`btn btn-outline btn-sm gap-2 ${fetchReviews.isPending ? "loading" : ""} md:ml-auto`}
              onClick={() => {
                if (storedProfileInput) fetchReviews.mutate(storedProfileInput);
              }}
              disabled={fetchReviews.isPending || !storedProfileInput}
              title={
                storedProfileInput
                  ? "Fetch latest reviews from Google"
                  : "Fetch the profile first to set the search keyword"
              }
            >
              Fetch latest reviews
            </button>
          </div>

          <div className="px-4 py-3 space-y-3">
            {pendingTaskId ? (
              <div className="alert alert-info">
                <span>Task queued, click Check status.</span>
                <button
                  type="button"
                  className={`btn btn-sm ${checkTask.isPending ? "loading" : ""}`}
                  onClick={() => checkTask.mutate(pendingTaskId)}
                  disabled={checkTask.isPending}
                >
                  Check status
                </button>
              </div>
            ) : null}
            {reviewsQuery.isPending ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : (reviewsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-base-content/50">
                No reviews fetched yet. Fetch the profile, then fetch the latest
                reviews.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {reviewsQuery.data?.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
