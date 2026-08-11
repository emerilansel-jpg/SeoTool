import type { ReactNode } from "react";
import { useCustomer } from "autumn-js/react";
import { useSession } from "@/lib/auth-client";
import {
  getCustomerPlanTier,
  getCustomerPlanStatus,
} from "@/client/features/billing/plan-detection";
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
  const { data: session, isPending: isSessionPending } = useSession();
  const hasSession = Boolean(session?.user?.id);
  const customerQuery = useCustomer({
    queryOptions: { enabled: hasSession },
  });

  return children({
    isLoading: isSessionPending || !hasSession || customerQuery.isLoading,
    isFreePlan:
      !!customerQuery.data &&
      getCustomerPlanStatus(customerQuery.data) === "free",
    planTier: customerQuery.data
      ? getCustomerPlanTier(customerQuery.data)
      : "free",
  });
}
