import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { getJetAccessSetupStatus } from "@/serverFunctions/jetAccess";

export type JetAccess = {
  showSetupGate: boolean;
  errorMessage: string | null;
  isRefetching: boolean;
  onRetry: () => void;
};

export type SamAccess = JetAccess;

export function useJetAccess(projectId: string): JetAccess {
  const isHosted = isHostedClientAuthMode();

  const { data, error, isRefetching, refetch } = useQuery({
    queryKey: ["jetAccessStatus", projectId],
    queryFn: () => getJetAccessSetupStatus({ data: { projectId } }),
    enabled: !isHosted,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isHosted) {
    return {
      showSetupGate: false,
      errorMessage: null,
      isRefetching: false,
      onRetry,
    };
  }

  const resolved = data !== undefined || error != null;
  return {
    showSetupGate: resolved && !(data?.enabled ?? false),
    errorMessage:
      data?.errorMessage ??
      (error != null
        ? getStandardErrorMessage(
            error,
            "Could not check Jet AI setup. Retry to check again.",
          )
        : null),
    isRefetching,
    onRetry,
  };
}

export const useSamAccess = useJetAccess;
