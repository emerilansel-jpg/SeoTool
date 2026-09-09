import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { JetChat } from "@/client/features/jet/JetChat";

const jetSearchSchema = z.object({
  // Active session id. Omitted until a session is selected/created.
  s: z.string().optional(),
});

type Search = z.infer<typeof jetSearchSchema>;

export const Route = createFileRoute("/_project/p/$projectId/jet")({
  validateSearch: jetSearchSchema,
  component: JetRoute,
});

function JetRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  const { s }: Search = Route.useSearch();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <JetChat projectId={projectId} activeSessionId={s} />
  );
}
