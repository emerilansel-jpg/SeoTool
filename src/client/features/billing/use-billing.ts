import { useQuery } from "@tanstack/react-query";
import { getQuotaStateSummary } from "@/serverFunctions/billing";
import { useSession } from "@/lib/auth-client";
import { PLAN_TIERS, type PlanTier } from "@/shared/plans";

function isPlanTier(value: unknown): value is PlanTier {
  return (
    typeof value === "string" &&
    (PLAN_TIERS as readonly string[]).includes(value)
  );
}

/** Returns the current plan tier from the local subscription table. */
export function usePlanTier(): {
  planTier: PlanTier;
  isLoading: boolean;
  isError: boolean;
} {
  const { data: session } = useSession();
  const hasSession = Boolean(session?.user?.id);

  const query = useQuery({
    queryKey: ["billing", "plan-tier"],
    queryFn: async () => {
      const state = await getQuotaStateSummary({ data: undefined });
      return state.planTier;
    },
    enabled: hasSession,
    staleTime: 30_000, // 30 seconds — plan tier changes are infrequent
  });

  return {
    planTier: isPlanTier(query.data) ? query.data : "free",
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** Returns whether the user is on a paid plan. */
export function useIsPaidPlan(): {
  isPaid: boolean;
  isLoading: boolean;
} {
  const { planTier, isLoading } = usePlanTier();
  return {
    isPaid: planTier !== "free",
    isLoading,
  };
}

/** Returns subscription problem status (past_due, unpaid, etc.). */
export function useSubscriptionProblemStatus(): {
  hasProblem: boolean;
  isLoading: boolean;
} {
  const { data: session } = useSession();
  const hasSession = Boolean(session?.user?.id);

  const query = useQuery({
    queryKey: ["billing", "problem-status"],
    queryFn: async () => {
      const state = await getQuotaStateSummary({ data: undefined });
      // Map our internal status to problem detection
      if (state.planTier === "free") return "none";
      return "none"; // PayPal handles dunning externally
    },
    enabled: hasSession,
    staleTime: 60_000,
  });

  return {
    hasProblem: query.data === "past_due" || query.data === "unpaid",
    isLoading: query.isLoading,
  };
}

/** Returns the content_intelligence quota and remaining balance. */
export function useContentIntelligenceQuota(): {
  limit: number;
  used: number;
  remaining: number;
  planTier: PlanTier;
  isLoading: boolean;
} {
  const { data: session } = useSession();
  const hasSession = Boolean(session?.user?.id);

  const query = useQuery({
    queryKey: ["billing", "quota-summary"],
    queryFn: async () => {
      const state = await getQuotaStateSummary({ data: undefined });
      return state;
    },
    enabled: hasSession,
    staleTime: 15_000,
  });

  const ciQuota = query.data?.quotas?.find(
    (q) => q.feature === "content_intelligence",
  );
  const limit = ciQuota?.limit ?? 10;
  const used = ciQuota?.used ?? 0;
  const remaining = Math.max(0, limit - used);

  return {
    limit,
    used,
    remaining,
    planTier: isPlanTier(query.data?.planTier) ? query.data.planTier : "free",
    isLoading: query.isLoading,
  };
}
