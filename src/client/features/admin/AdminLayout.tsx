import { Outlet } from "@tanstack/react-router";
import { AdminNav } from "@/client/features/admin/AdminNav";

export function AdminLayout() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 py-8 md:p-6 md:py-10">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Platform operations, billing, pricing, content, and user management.
        </p>
      </div>
      <AdminNav />
      <Outlet />
    </div>
  );
}
