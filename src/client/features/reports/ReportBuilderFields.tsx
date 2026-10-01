const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export { DAYS, MONTHS };

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? (
        <span className="text-xs text-base-content/50">{hint}</span>
      ) : null}
    </label>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value || "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="input input-bordered h-10 w-16 cursor-pointer p-1"
        />
        <span className="font-mono text-xs text-base-content/60">
          {value || "Default"}
        </span>
        {value ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs ml-auto"
            onClick={() => onChange("")}
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
