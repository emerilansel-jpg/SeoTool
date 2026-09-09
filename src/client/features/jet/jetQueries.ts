import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "@/client/tanstack-db";
import { listJetSessions } from "@/serverFunctions/jet";

export const jetSessionsQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["jetSessions", projectId],
    queryFn: () => listJetSessions({ data: { projectId } }),
  });

export function invalidateJetSessions(projectId: string) {
  void queryClient.invalidateQueries({ queryKey: ["jetSessions", projectId] });
}

export const samSessionsQueryOptions = jetSessionsQueryOptions;
export const invalidateSamSessions = invalidateJetSessions;
