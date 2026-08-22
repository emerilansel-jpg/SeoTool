import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SamChat } from "@/client/features/sam/SamChat";

const samSearchSchema = z.object({
  // Active session id. Omitted until a session is selected/created.
  s: z.string().optional(),
});

type Search = z.infer<typeof samSearchSchema>;

export const Route = createFileRoute("/_project/p/$projectId/jet")({
  validateSearch: samSearchSchema,
  component: SamRoute,
});

function SamRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  const { s }: Search = Route.useSearch();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <SamChat projectId={projectId} activeSessionId={s} />
  );
}
