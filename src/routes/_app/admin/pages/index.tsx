import { createFileRoute } from "@tanstack/react-router";
import { AdminPagesListPage } from "@/client/features/admin/AdminPagesListPage";

export const Route = createFileRoute("/_app/admin/pages/")({
  component: AdminPagesListPage,
});
