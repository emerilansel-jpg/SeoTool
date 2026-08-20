import { createFileRoute } from "@tanstack/react-router";
import { AdminApiKeysPage } from "@/client/features/admin/AdminApiKeysPage";

export const Route = createFileRoute("/_app/admin/api-keys/")({
  component: AdminApiKeysPage,
});
