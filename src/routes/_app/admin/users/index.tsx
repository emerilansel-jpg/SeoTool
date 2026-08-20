import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/client/features/admin/AdminUsersPage";

interface AdminUsersSearch {
  q?: string;
  page?: number;
}

export const Route = createFileRoute("/_app/admin/users/")({
  validateSearch: (search: Record<string, unknown>): AdminUsersSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    page: typeof search.page === "number" ? search.page : undefined,
  }),
  component: AdminUsersPage,
});
