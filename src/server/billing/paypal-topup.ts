export function createTopupMarker(
  organizationId: string,
  timestamp = Date.now(),
): string {
  return `topup:${organizationId}:${timestamp}`;
}

export function parseTopupMarker(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("topup:")) return null;
  const separator = value.lastIndexOf(":");
  if (separator <= "topup:".length) return null;
  const organizationId = value.slice("topup:".length, separator);
  const timestamp = value.slice(separator + 1);
  if (!organizationId || !/^\d+$/.test(timestamp)) return null;
  return organizationId;
}
