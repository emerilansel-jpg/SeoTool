import { createFileRoute } from "@tanstack/react-router";
import { ProjectSettings } from "@/client/features/projects/ProjectSettings";

export const Route = createFileRoute("/_project/p/$projectId/settings")({
  component: ProjectSettingsRoute,
});

function ProjectSettingsRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="h-full overflow-auto bg-base-100">
      {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
      <ProjectSettings projectId={projectId} />
    </div>
  );
}
