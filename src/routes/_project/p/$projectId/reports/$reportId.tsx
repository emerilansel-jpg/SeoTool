import { createFileRoute } from "@tanstack/react-router";
import { ReportSnapshotView } from "@/client/features/reports/ReportSnapshotView";
import { useQuery } from "@tanstack/react-query";
import { listReportSnapshots } from "@/serverFunctions/reports";

function ReportDetailRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId, reportId } = Route.useParams();
  const snapshotsQuery = useQuery({
    queryKey: ["reportSnapshots", projectId, reportId],
    queryFn: () =>
      // oxlint-disable-next-line typescript-eslint/no-unsafe-call,typescript-eslint/no-unsafe-return,typescript-eslint/no-unsafe-assignment
      listReportSnapshots({ data: { projectId, reportId, limit: 1 } }),
  });
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment,typescript-eslint/no-unsafe-member-access
  const latestSnapshot = snapshotsQuery.data?.snapshots?.[0];
  if (snapshotsQuery.isPending) {
    return (
      <div className="p-8 text-sm text-base-content/60">Loading snapshots…</div>
    );
  }
  if (!latestSnapshot) {
    return (
      <div className="p-8 text-sm text-base-content/60">
        No snapshots yet. Generate one from the report settings.
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
