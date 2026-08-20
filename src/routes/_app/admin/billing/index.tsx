import { createFileRoute } from "@tanstack/react-router";
import { AdminBillingPage } from "@/client/features/admin/AdminBillingPage";

interface AdminBillingSearch {
  q?: string;
  page?: number;
}

export const Route = createFileRoute("/_app/admin/billing/")({
  validateSearch: (search: Record<string, unknown>): AdminBillingSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    page: typeof search.page === "number" ? search.page : undefined,
  }),
  component: AdminBillingPage,
});
