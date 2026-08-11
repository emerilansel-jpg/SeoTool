import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LighthouseIssuesScreen } from "@/client/features/lighthouse/issues/LighthouseIssuesScreen";
import { lighthouseIssuesSearchSchema } from "@/types/schemas/lighthouse";
import type { z } from "zod";

type Search = z.infer<typeof lighthouseIssuesSearchSchema>;

export const Route = createFileRoute(
  "/_project/p/$projectId/audit/issues/$resultId",
)({
  validateSearch: lighthouseIssuesSearchSchema,
  component: AuditIssuesPage,
});

function AuditIssuesPage() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId, resultId } = Route.useParams();
  const { auditId, category }: Search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <LighthouseIssuesScreen
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
      projectId={projectId}
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
      resultId={resultId}
      category={category}
      backLabel="Site Audit"
      onBack={() =>
        void navigate({
          to: "/p/$projectId/audit",
          // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
          params: { projectId },
          search: auditId ? { auditId } : undefined,
        })
      }
      onCategoryChange={(next) =>
        void navigate({
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            category: next,
          }),
          replace: true,
        })
      }
    />
  );
}
