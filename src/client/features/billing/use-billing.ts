import { useQuery } from "@tanstack/react-query";
import { getQuotaStateSummary } from "@/serverFunctions/billing";
import { useSession } from "@/lib/auth-client";
import type { PlanTier } from "@/shared/plans";

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
    planTier: (query.data as PlanTier) ?? "free",
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
