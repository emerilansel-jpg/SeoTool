import { createFileRoute, notFound } from "@tanstack/react-router";
import { checkIsPlatformAdmin } from "@/serverFunctions/analytics";
import { AdminLayout } from "@/client/features/admin/AdminLayout";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: async () => {
    const isAdmin = await checkIsPlatformAdmin();
    if (!isAdmin) throw notFound();
  },
  component: AdminLayout,
});
