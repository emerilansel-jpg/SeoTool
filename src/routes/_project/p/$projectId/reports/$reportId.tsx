import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { ReportSnapshotView } from "@/client/features/reports/ReportSnapshotView";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  generateReportSnapshot,
  listReportSnapshots,
} from "@/serverFunctions/reports";

function ReportDetailRoute() {
  const queryClient = useQueryClient();
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId, reportId } = Route.useParams();

  const snapshotsQuery = useQuery({
    queryKey: ["reportSnapshots", projectId, reportId],
    queryFn: () =>
      // oxlint-disable-next-line typescript-eslint/no-unsafe-call,typescript-eslint/no-unsafe-return,typescript-eslint/no-unsafe-assignment
      listReportSnapshots({ data: { projectId, reportId, limit: 1 } }),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateReportSnapshot({ data: { projectId, reportId } }),
    onSuccess: (result) => {
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Snapshot generated");
      void queryClient.invalidateQueries({
        queryKey: ["reportSnapshots", projectId, reportId],
      });
    },
    onError: (error: unknown) =>
      toast.error(getStandardErrorMessage(error, "Snapshot generation failed")),
  });

  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment,typescript-eslint/no-unsafe-member-access
  const latestSnapshot = snapshotsQuery.data?.snapshots?.[0];

  if (snapshotsQuery.isPending) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-base-content/60">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Loading
        snapshots…
      </div>
    );
  }

  if (!latestSnapshot) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h2 className="text-lg font-semibold">No snapshots yet</h2>
        <p className="mt-2 text-sm text-base-content/60">
          Generate the first snapshot to compile every configured report section
          into a shareable view with a PDF export.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm mt-6 gap-1"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-3.5" aria-hidden />
          )}
          {generateMutation.isPending ? "Generating..." : "Generate snapshot"}
        </button>
        {generateMutation.isError ? (
          <p className="mt-4 text-sm text-error" role="alert">
            Snapshot generation failed. Please try again.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <ReportSnapshotView
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
      projectId={projectId}
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
      reportId={reportId}
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment,typescript-eslint/no-unsafe-member-access
      snapshotId={latestSnapshot.id}
    />
  );
}

export const Route = createFileRoute(
  "/_project/p/$projectId/reports/$reportId",
)({
  component: ReportDetailRoute,
});
