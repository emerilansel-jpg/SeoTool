import { createFileRoute } from "@tanstack/react-router";
import { AdminPageEditorPage } from "@/client/features/admin/AdminPageEditorPage";

export const Route = createFileRoute("/_app/admin/pages/$postId")({
  component: AdminPageEditorPage,
});
