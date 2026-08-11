import { z } from "zod";

/**
 * Org member roles, ordered highest-privilege first.
 *
 * `owner` and `member` are better-auth organization-plugin defaults (the org
 * creator is `owner`; everyone else invited without a role lands on `member`).
 * `manager` and `viewer` are OpenSEO additions: `manager` can create/edit
 * shared resources (reports); `viewer` is the client-viewer read-only role for
 * agency clients. Keeping better-auth's `member` in the ladder means existing
 * workspaces keep working — `member` sits between manager and viewer and can
 * view reports but not manage them.
 */
export const ROLE_ORDER = [
  "owner",
  "admin",
  "manager",
  "member",
  "viewer",
] as const;

export type Role = (typeof ROLE_ORDER)[number];

const _ROLE_ZOD = z.enum(ROLE_ORDER);

/** Privilege rank: 0 = most privileged. Unknown roles fall back to the lowest. */
function roleRank(role: string): number {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- runtime string narrowed to Role union
  const idx = ROLE_ORDER.indexOf(role as Role);
  return idx === -1 ? ROLE_ORDER.length : idx;
}

/** True when `role` is at least as privileged as `min`. */
export function roleAtLeast(role: string, min: Role): boolean {
  return roleRank(role) <= roleRank(min);
}

/** Can create/edit/delete shared resources (reports, etc.). */
export function canManageReports(role: string): boolean {
  return roleAtLeast(role, "manager");
}

/** Can view reports. Every project member can — `viewer` included. */
export function canViewReports(role: string): boolean {
  return roleAtLeast(role, "viewer");
}
