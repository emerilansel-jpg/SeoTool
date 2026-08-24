import { getOptionalEnvValue } from "@/server/lib/runtime-env";

/**
 * Checks if a user is a platform administrator.
 * Platform admins have access to /admin and bypass the paywall gate.
 */
export async function isPlatformAdmin(user: {
  userId?: string | null;
  userEmail?: string | null;
}): Promise<boolean> {
  if (!user) return false;

  // Stable user IDs are the primary production authority. No account is
  // privileged merely because its email address appears in source code.
  const adminIdsRaw = await getOptionalEnvValue("PLATFORM_ADMIN_USER_IDS");
  if (adminIdsRaw && user.userId) {
    const ids = adminIdsRaw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.includes(user.userId.trim())) {
      return true;
    }
  }

  // Email allowlisting remains available for deployments that cannot pin
  // stable auth user IDs, but it must be configured explicitly at runtime.
  const normalizedEmail = user.userEmail?.trim().toLowerCase();
  const adminEmailsRaw = await getOptionalEnvValue("PLATFORM_ADMIN_EMAILS");
  if (adminEmailsRaw && normalizedEmail) {
    const emails = adminEmailsRaw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (emails.includes(normalizedEmail)) {
      return true;
    }
  }

  return false;
}

export async function isPlatformAdminEmail(
  email?: string | null,
): Promise<boolean> {
  return isPlatformAdmin({ userEmail: email });
}

export async function isPlatformAdminId(
  userId?: string | null,
): Promise<boolean> {
  return isPlatformAdmin({ userId });
}
