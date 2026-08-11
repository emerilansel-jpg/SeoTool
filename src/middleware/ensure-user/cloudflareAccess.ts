// This file previously resolved Cloudflare Access JWT-authenticated users. The
// app is hosted-only now (Better Auth email/password + Google OAuth), so the
// Cloudflare Access auth mode has been removed. This stub keeps the module
// loadable for any stray import and fails loudly if ever called.
import { AppError } from "@/server/lib/errors";
import type { EnsuredUserContext } from "./types";

export async function resolveCloudflareAccessContext(
  _headers: Headers,
): Promise<EnsuredUserContext> {
  throw new AppError(
    "AUTH_CONFIG_MISSING",
    "Cloudflare Access auth mode is no longer supported. The app is hosted-only now.",
  );
}
