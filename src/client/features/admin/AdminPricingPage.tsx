import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import {
  getAdminPlanConfigs,
  retryAdminPlanSync,
  saveAdminPlanConfig,
} from "@/serverFunctions/admin-pricing";
import type { EffectivePlanConfig } from "@/server/billing/plan-config";
import { PLAN_TIER_LABELS } from "@/shared/plans";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  getAdminKeywordProCohorts,
  initializeAdminKeywordProPaypalPlans,
  saveAdminKeywordProCohort,
} from "@/serverFunctions/admin-keyword-pro";
import type { EffectiveKeywordProCohort } from "@/server/features/keywords/services/KeywordProConfigService";

export function AdminPricingPage() {
  const getConfigs = useServerFn(getAdminPlanConfigs);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plan-configs"],
    queryFn: () => getConfigs(),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-plan-configs"] });

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-dashed border-base-300 p-8 text-center text-sm text-base-content/60">
        Unable to load plan configuration.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/70">
        Prices and monthly credit grants apply immediately to checkout displays,
        credit grants, and MRR. Changing a price also updates the PayPal plan so
        the charged amount matches. The marketing site&apos;s static pricing
        page shows these values only after its next rebuild.
      </p>
      {data.map((config) => (
        <TierCard key={config.tier} config={config} onSaved={invalidate} />
      ))}
      <KeywordProPricingSection />
    </div>
  );
}

function KeywordProPricingSection() {
  const getCohorts = useServerFn(getAdminKeywordProCohorts);
  const initializePlans = useServerFn(initializeAdminKeywordProPaypalPlans);
  const queryClient = useQueryClient();
  const cohorts = useQuery({
    queryKey: ["admin-keyword-pro-cohorts"],
    queryFn: () => getCohorts(),
  });
  const initialize = useMutation({
    mutationFn: () => initializePlans({ data: { confirmed: true } }),
    onSuccess: (result) => {
      toast.success(
        result.created > 0
          ? `${result.created} Keyword Research Pro PayPal plans created.`
          : "All Keyword Research Pro PayPal plans are already configured.",
      );
      void queryClient.invalidateQueries({
        queryKey: ["admin-keyword-pro-cohorts"],
      });
    },
    onError: (error) =>
      toast.error(
        getStandardErrorMessage(error, "Could not create PayPal plans."),
      ),
  });
  const invalidate = () =>
    void queryClient.invalidateQueries({
      queryKey: ["admin-keyword-pro-cohorts"],
    });

  return (
    <section className="space-y-4 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-t border-base-300 pt-6">
        <div>
          <h2 className="text-lg font-semibold">
            Keyword Research Pro cohorts
          </h2>
          <p className="max-w-3xl text-sm text-base-content/70">
            Prices are locked per member. Changing a cohort price creates a new
            PayPal plan for future buyers; existing subscriptions stay on their
            original plan and price.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          disabled={initialize.isPending}
          onClick={() => initialize.mutate()}
        >
          {initialize.isPending ? "Creating plans…" : "Set up PayPal plans"}
        </button>
      </div>
      {cohorts.isLoading ? (
        <div className="skeleton h-40 rounded-lg" />
      ) : (
        cohorts.data?.map((cohort) => (
          <KeywordProCohortCard
            key={`${cohort.key}-${cohort.priceUsdCents}-${cohort.paypalPlanId}`}
            cohort={cohort}
            onSaved={invalidate}
          />
        ))
      )}
    </section>
  );
}

function KeywordProCohortCard({
  cohort,
  onSaved,
}: {
  cohort: EffectiveKeywordProCohort;
  onSaved: () => void;
}) {
  const saveCohort = useServerFn(saveAdminKeywordProCohort);
  const [price, setPrice] = useState((cohort.priceUsdCents / 100).toString());
  const [active, setActive] = useState(cohort.active);
  const save = useMutation({
    mutationFn: () =>
      saveCohort({
        data: {
          key: cohort.key,
          priceUsdCents: Math.round((Number.parseFloat(price) || 0) * 100),
          active,
        },
      }),
    onSuccess: () => {
      toast.success("Cohort pricing saved.");
      onSaved();
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Could not save cohort.")),
  });
  return (
    <div className="card border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{cohort.label}</h3>
              <span
                className={`badge badge-sm ${cohort.configured ? "badge-success" : "badge-warning"}`}
              >
                {cohort.configured ? "PayPal ready" : "Not configured"}
              </span>
            </div>
            <p className="text-xs text-base-content/60">
              {cohort.occupied} member{cohort.occupied === 1 ? "" : "s"}
              {cohort.capacity == null
                ? " · unlimited"
                : ` / ${cohort.capacity}`}
            </p>
          </div>
          <label className="label cursor-pointer gap-2 text-xs">
            Active
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text text-xs font-medium">
              Price (USD/month)
            </span>
            <input
              type="number"
              min="1"
              step="0.01"
              className="input input-bordered input-sm"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs font-medium">
              PayPal plan ID
            </span>
            <input
              readOnly
              className="input input-bordered input-sm font-mono text-xs"
              value={cohort.paypalPlanId ?? ""}
              placeholder="Created by Set up PayPal plans"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            className="btn btn-primary btn-sm"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save cohort"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TierCard({
  config,
  onSaved,
}: {
  config: EffectivePlanConfig;
  onSaved: () => void;
}) {
  const save = useServerFn(saveAdminPlanConfig);
  const retry = useServerFn(retryAdminPlanSync);

  const [priceUsd, setPriceUsd] = useState(
    (config.priceUsdCents / 100).toString(),
  );
  const [monthlyCredits, setMonthlyCredits] = useState(
    config.monthlyCredits.toString(),
  );
  const [paypalPlanId, setPaypalPlanId] = useState(config.paypalPlanId ?? "");
  const [active, setActive] = useState(config.active);

  const saveMutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          tier: config.tier,
          priceUsd: Number.parseFloat(priceUsd) || 0,
          monthlyCredits: Number.parseInt(monthlyCredits, 10) || 0,
          paypalPlanId: paypalPlanId || undefined,
          active,
        },
      }),
    onSuccess: (result) => {
      if (result.syncStatus === "pending") {
        toast.warning(
          "Saved, but the PayPal price sync failed. Retry below or update the plan in the PayPal dashboard.",
        );
      } else {
        toast.success("Plan configuration saved.");
      }
      onSaved();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not save plan."));
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => retry({ data: { tier: config.tier } }),
    onSuccess: (result) => {
      if (result.syncStatus === "pending") {
        toast.error("PayPal sync failed again. Check the PayPal dashboard.");
      } else {
        toast.success("PayPal plan price synced.");
      }
      onSaved();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Retry failed."));
    },
  });

  const isFree = config.tier === "free";

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{PLAN_TIER_LABELS[config.tier]}</h2>
            <span
              className={`badge badge-sm ${
                config.priceSource === "db" ? "badge-info" : "badge-ghost"
              }`}
            >
              {config.priceSource === "db" ? "customized" : "defaults"}
            </span>
            {!active ? (
              <span className="badge badge-sm badge-error">Hidden</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {config.syncStatus === "pending" && !isFree ? (
              <>
                <span className="badge badge-sm badge-warning">
                  PayPal sync pending
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label="Retry PayPal sync"
                  disabled={retryMutation.isPending}
                  onClick={() => retryMutation.mutate()}
                >
                  <RefreshCw
                    className={`size-3.5 ${retryMutation.isPending ? "animate-spin" : ""}`}
                  />
                </button>
              </>
            ) : null}
            <label className="label cursor-pointer gap-2 text-xs">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-xs"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="form-control">
            <span className="label-text text-xs font-medium">
              Price (USD/month)
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input input-bordered input-sm w-full font-mono tabular-nums"
              value={priceUsd}
              disabled={saveMutation.isPending}
              onChange={(event) => setPriceUsd(event.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs font-medium">
              Monthly credit grant
            </span>
            <input
              type="number"
              min={0}
              step="1"
              className="input input-bordered input-sm w-full font-mono tabular-nums"
              value={monthlyCredits}
              disabled={saveMutation.isPending}
              onChange={(event) => setMonthlyCredits(event.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs font-medium">
              PayPal plan ID
            </span>
            <input
              type="text"
              className="input input-bordered input-sm w-full font-mono"
              placeholder={isFree ? "(no plan for free)" : "PayPal plan id"}
              value={paypalPlanId}
              disabled={isFree || saveMutation.isPending}
              onChange={(event) => setPaypalPlanId(event.target.value)}
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
