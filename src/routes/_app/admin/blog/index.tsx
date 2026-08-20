import { createFileRoute } from "@tanstack/react-router";
import { AdminBlogListPage } from "@/client/features/admin/AdminBlogListPage";

export const Route = createFileRoute("/_app/admin/blog/")({
  component: AdminBlogListPage,
});
