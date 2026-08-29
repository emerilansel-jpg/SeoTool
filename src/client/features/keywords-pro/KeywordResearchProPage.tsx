import { type FormEvent, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyRound, Search } from "lucide-react";
import { toast } from "sonner";
import { ResearchResults } from "./KeywordResearchProResults";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { researchKeywordsPro } from "@/serverFunctions/keyword-research-pro";
import {
  estimateKeywordResearchProCost,
  type KeywordResearchProBillingMode,
  type KeywordResearchProMode,
} from "@/shared/keyword-research-pro";
import { LOCATION_OPTIONS } from "@/shared/keyword-locations";
import { getMembershipStatus } from "@/serverFunctions/membership";
import { isHostedClientAuthMode } from "@/lib/auth-mode";

type Props = {
  projectId: string;
};

function parseKeywords(value: string, limit: number) {
  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    ),
  ].slice(0, limit);
}

function money(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

export function KeywordResearchProPage({ projectId }: Props) {
  const hosted = isHostedClientAuthMode();
  const isE2EBypass =
    import.meta.env.BYPASS_AUTH === "true" ||
    (typeof window !== "undefined" &&
      Reflect.get(window, "__E2E_BYPASS_AUTH") === true);
  const membership = useQuery({
    queryKey: ["membership-status"],
    queryFn: () => getMembershipStatus(),
    enabled: hosted && !isE2EBypass,
  });

  const [keywordText, setKeywordText] = useState("");
  const [mode, setMode] = useState<KeywordResearchProMode>("basic");
  const [billingMode, setBillingMode] =
    useState<KeywordResearchProBillingMode>("standard");
  const [credential, setCredential] = useState("");
  const [locationCode, setLocationCode] = useState<number | undefined>();
  const keywordLimit = mode === "basic" ? 25 : 10;
  const keywords = useMemo(
    () => parseKeywords(keywordText, keywordLimit),
    [keywordLimit, keywordText],
  );
  const estimate = estimateKeywordResearchProCost(
    Math.max(1, keywords.length),
    mode,
    billingMode,
  );
  const mutation = useMutation({
    mutationFn: () =>
      researchKeywordsPro({
        data: {
          projectId,
          keywords,
          mode,
          billingMode,
          locationCode,
          byokCredential:
            billingMode === "byok" ? credential.trim() : undefined,
        },
      }),
    onError: (error) =>
      toast.error(
        getStandardErrorMessage(
          error,
          "Keyword research could not be completed",
        ),
      ),
  });

  if (hosted && !isE2EBypass && membership.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (hosted && !isE2EBypass && !membership.data?.hasFeatureAccess) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-base-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Pro Analysis is part of All Access
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-base-content/70">
          Upgrade once to unlock this pipeline and every other paid SeoTool.im
          feature. Your cohort price stays locked while the membership remains
          uninterrupted.
        </p>
        <Link
          to="/subscribe"
          search={{
            upgrade: true,
            redirect: `/p/${projectId}/keywords?view=pro`,
          }}
          className="btn btn-primary mt-5"
        >
          View All Access
        </Link>
      </div>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (keywords.length === 0) return;
    if (billingMode === "byok" && credential.trim().length < 8) {
      toast.error("Enter your DataForSEO login:password or Base64 credential");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm md:p-6"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="krp-keywords">
              Keywords{" "}
              <span className="font-normal text-base-content/50">
                (up to {keywordLimit})
              </span>
            </label>
            <textarea
              id="krp-keywords"
              value={keywordText}
              onChange={(event) => setKeywordText(event.target.value)}
              className="textarea textarea-bordered min-h-40 w-full"
              placeholder={
                "best seo tools for agencies\nlocal rank tracker\nkeyword research software"
              }
            />
            <p className="text-xs text-base-content/50">
              One keyword per line. Duplicate keywords are removed
              automatically.
            </p>
          </div>

          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Research depth</legend>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-base-300 p-3 has-checked:border-primary has-checked:bg-primary/5">
                <input
                  type="radio"
                  className="radio radio-primary radio-sm mt-0.5"
                  checked={mode === "basic"}
                  onChange={() => setMode("basic")}
                />
                <span>
                  <span className="block text-sm font-medium">Basic</span>
                  <span className="text-xs text-base-content/60">
                    KGR, title gaps, volume, intent and content competition.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-base-300 p-3 has-checked:border-primary has-checked:bg-primary/5">
                <input
                  type="radio"
                  className="radio radio-primary radio-sm mt-0.5"
                  checked={mode === "full"}
                  onChange={() => setMode("full")}
                />
                <span>
                  <span className="block text-sm font-medium">
                    Full + backlinks
                  </span>
                  <span className="text-xs text-base-content/60">
                    Adds page/domain rank, links, referring domains and spam.
                  </span>
                </span>
              </label>
            </fieldset>

            <label className="form-control gap-1">
              <span className="text-sm font-semibold">Market</span>
              <select
                className="select select-bordered w-full"
                value={locationCode ?? ""}
                onChange={(event) =>
                  setLocationCode(
                    event.target.value ? Number(event.target.value) : undefined,
                  )
                }
              >
                <option value="">Project default</option>
                {LOCATION_OPTIONS.map((location) => (
                  <option key={location.code} value={location.code}>
                    {location.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-base-300 pt-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm ${billingMode === "standard" ? "btn-primary" : "btn-ghost border-base-300"}`}
                onClick={() => setBillingMode("standard")}
              >
                Standard · provider +30%
              </button>
              <button
                type="button"
                className={`btn btn-sm ${billingMode === "byok" ? "btn-primary" : "btn-ghost border-base-300"}`}
                onClick={() => setBillingMode("byok")}
              >
                <KeyRound className="size-4" /> BYOK · service fee 10%
              </button>
            </div>
            {billingMode === "byok" ? (
              <div className="max-w-xl">
                <input
                  type="password"
                  autoComplete="off"
                  className="input input-bordered w-full"
                  value={credential}
                  onChange={(event) => setCredential(event.target.value)}
                  placeholder="DataForSEO login:password or Base64 credential"
                />
                <p className="mt-1 text-xs text-base-content/50">
                  Used for this run only. SeoTool does not save this credential.
                </p>
              </div>
            ) : null}
            <p className="text-xs text-base-content/60">
              Estimated total: <strong>{money(estimate.totalOutlay)}</strong>
              {billingMode === "byok"
                ? ` (${money(estimate.raw)} paid on your DataForSEO account + ${money(estimate.seoToolCharge)} SeoTool fee)`
                : " from SeoTool credits"}
              . Actual billing follows the provider's task cost.
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-primary min-w-40"
            disabled={
              mutation.isPending ||
              keywords.length === 0 ||
              (billingMode === "byok" && credential.trim().length < 8)
            }
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Search className="size-4" />
            )}
            {mutation.isPending ? "Researching…" : "Run research"}
          </button>
        </div>
      </form>

      {mutation.data ? <ResearchResults result={mutation.data} /> : null}
    </div>
  );
}
