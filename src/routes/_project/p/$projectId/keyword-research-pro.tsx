import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  checkout: z.enum(["success", "cancelled"]).optional().catch(undefined),
  subscription_id: z.string().max(128).optional().catch(undefined),
  ref: z.string().max(32).optional().catch(undefined),
});

export const Route = createFileRoute(
  "/_project/p/$projectId/keyword-research-pro",
)({
  validateSearch: searchSchema,
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/p/$projectId/keywords",
      params: { projectId: params.projectId },
      search: {
        view: "pro",
        checkout: search.checkout,
        subscription_id: search.subscription_id,
        ref: search.ref,
      },
      replace: true,
    });
  },
});
