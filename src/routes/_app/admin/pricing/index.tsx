import { createFileRoute } from "@tanstack/react-router";
import { AdminPricingPage } from "@/client/features/admin/AdminPricingPage";

export const Route = createFileRoute("/_app/admin/pricing/")({
  component: AdminPricingPage,
});
