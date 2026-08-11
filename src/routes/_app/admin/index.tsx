import { createFileRoute, notFound } from "@tanstack/react-router";
import { checkIsPlatformAdmin } from "@/serverFunctions/analytics";
import { AdminDashboard } from "@/client/features/admin/AdminDashboard";

export const Route = createFileRoute("/_app/admin/")({
  beforeLoad: async () => {
    const isAdmin = await checkIsPlatformAdmin();
    if (!isAdmin) throw notFound();
  },
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard />;
}
