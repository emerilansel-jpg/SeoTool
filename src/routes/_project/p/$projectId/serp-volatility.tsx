import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_project/p/$projectId/serp-volatility")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/p/$projectId/rank-tracking",
      params: { projectId: params.projectId },
    });
  },
  component: () => null,
});
