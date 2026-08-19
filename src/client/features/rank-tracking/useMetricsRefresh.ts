import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshTrackingKeywordMetrics } from "@/serverFunctions/rank-tracking";

export function useMetricsRefresh(projectId: string, configId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      refreshTrackingKeywordMetrics({
        data: { projectId, configId },
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: ["rankTrackingResults", projectId, configId],
      });
      toast.success(`Metrics updated for ${result.updated} keywords`);
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to refresh keyword metrics"),
      );
    },
  });
  return { refresh: mutation.mutate, isRefreshing: mutation.isPending };
}
