import { createFileRoute } from "@tanstack/react-router";
import { AdminUserDetailPage } from "@/client/features/admin/AdminUserDetailPage";

export const Route = createFileRoute("/_app/admin/users/$userId")({
  component: AdminUserDetailPage,
});
