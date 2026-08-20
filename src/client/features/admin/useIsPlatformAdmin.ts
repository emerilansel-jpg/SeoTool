import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkIsPlatformAdmin } from "@/serverFunctions/analytics";

/** Client check for gating admin UI (sidebar link). The server remains the
 *  authority: every admin server function re-checks requirePlatformAdmin. */
export function useIsPlatformAdmin(): boolean {
  const check = useServerFn(checkIsPlatformAdmin);

  const { data } = useQuery({
    queryKey: ["platform-admin-check"],
    queryFn: () => check(),
    staleTime: Infinity,
    retry: false,
  });

  return data ?? false;
}
