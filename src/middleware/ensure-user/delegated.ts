// This file previously resolved local_noauth / Cloudflare Access delegated
// users. The app is hosted-only now (Better Auth email/password + Google
// OAuth), so the local_noauth auth mode has been removed. This stub keeps the
// module loadable for any stray import and fails loudly if ever called.
import { AppError } from "@/server/lib/errors";
import type { EnsuredUserContext } from "./types";

export async function resolveLocalNoAuthContext(): Promise<EnsuredUserContext> {
  throw new AppError(
    "AUTH_CONFIG_MISSING",
    "local_noauth auth mode is no longer supported. The app is hosted-only now.",
  );
}

export async function resolveDelegatedContext(
  _userId: string,
  _userEmail: string,
): Promise<EnsuredUserContext> {
  throw new AppError(
    "AUTH_CONFIG_MISSING",
    "Delegated auth mode is no longer supported. The app is hosted-only now.",
  );
}
