import { createFileRoute, notFound } from "@tanstack/react-router";
import { checkIsPlatformAdmin } from "@/serverFunctions/analytics";
import { AdminLayout } from "@/client/features/admin/AdminLayout";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: async () => {
    const isE2EServer =
      import.meta.env.BYPASS_AUTH === "true" ||
      import.meta.env.VITE_E2E_BYPASS_AUTH === "true";
    const isE2EClient =
      typeof window !== "undefined" &&
      Boolean(Reflect.get(window, "__E2E_BYPASS_AUTH"));
    if (isE2EServer || isE2EClient) return;

    const isAdmin = await checkIsPlatformAdmin();
    if (!isAdmin) throw notFound();
  },
  component: AdminLayout,
});
