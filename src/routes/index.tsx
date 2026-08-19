import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/client/features/marketing/LandingPage";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
