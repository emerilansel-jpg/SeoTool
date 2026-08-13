import type { ReactNode } from "react";
import { usePlanTier } from "@/client/features/billing/use-billing";
import type { PlanTier } from "@/shared/plans";

export type HostedPlanGateState = {
  isLoading: boolean;
  isFreePlan: boolean;
  planTier: PlanTier;
};

export function HostedPlanGate({
  children,
}: {
  children: (state: HostedPlanGateState) => ReactNode;
}) {
  const { planTier, isLoading } = usePlanTier();

  return children({
    isLoading,
    isFreePlan: planTier === "free",
    planTier,
  });
}
