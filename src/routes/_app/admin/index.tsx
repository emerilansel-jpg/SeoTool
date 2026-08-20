import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/client/features/admin/AdminDashboard";

export const Route = createFileRoute("/_app/admin/")({
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard />;
}
