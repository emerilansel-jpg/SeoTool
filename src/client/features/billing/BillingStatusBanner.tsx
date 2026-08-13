import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useCustomer } from "autumn-js/react";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionProblemStatus } from "@/client/features/billing/plan-detection";

const PROBLEM_COPY: Record<string, string> = {
  past_due:
    "Your last payment failed. Update your payment method to avoid losing access.",
  unpaid:
    "Your subscription is unpaid. Update your payment method to restore access.",
};

/**
 * Dismissible-feeling, always-on warning banner shown across the app when the
 * paid subscription hits a payment problem (dunning). Stays visible until the
 * status resolves in Autumn — the fastest fix is the Manage Subscription link,
 * which opens the Stripe portal.
 */
export function BillingStatusBanner() {
  const { data: session } = useSession();
  const customerQuery = useCustomer({
    queryOptions: {
      // Only fetch customer data when there's a signed-in user.
      enabled: Boolean(session?.user?.id),
    },
  });

  const problem = getSubscriptionProblemStatus(customerQuery.data);
  if (!problem) return null;

  const message =
    PROBLEM_COPY[problem] ?? "There's an issue with your subscription.";

  return (
    <div className="flex items-center gap-3 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm">
      <AlertTriangle className="size-4 shrink-0 text-warning" />
      <span className="flex-1 text-warning-content">{message}</span>
      <Link to="/billing" className="btn btn-warning btn-xs shrink-0">
        Update payment
      </Link>
    </div>
  );
}
