import { createFileRoute } from "@tanstack/react-router";
import { AdminBlogEditorPage } from "@/client/features/admin/AdminBlogEditorPage";

export const Route = createFileRoute("/_app/admin/blog/new")({
  component: AdminBlogEditorPage,
});
