export function QuotaBar({
  label,
  used,
  limit,
  resetAt,
}: {
  label: string;
  used: number;
  limit: number;
  resetAt: string | null;
}) {
  const isUnlimited = limit === Number.POSITIVE_INFINITY;
  // Cap at 100% just for rendering the bar width
  const percent = isUnlimited
    ? 0
    : Math.min(100, Math.max(0, (used / limit) * 100));

  let colorClass = "bg-primary";
  if (!isUnlimited) {
    if (percent >= 100) {
      colorClass = "bg-error";
    } else if (percent >= 80) {
      colorClass = "bg-warning";
    }
  }

  // Format the date if provided
  const resetText = resetAt
    ? `Resets ${new Date(resetAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`
    : "Live count";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-base-content">{label}</span>
        <span className="tabular-nums text-base-content/80">
          {used.toLocaleString()}{" "}
          <span className="text-base-content/50">
            / {isUnlimited ? "Unlimited" : limit.toLocaleString()}
          </span>
        </span>
      </div>

      {!isUnlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-base-content/50">
        <span>{isUnlimited ? "No limit" : resetText}</span>
        {percent >= 100 && !isUnlimited && (
          <span className="font-medium text-error">Limit reached</span>
        )}
      </div>
    </div>
  );
}
