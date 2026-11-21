import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  getNapAuditResults,
  getNapHistory,
  runNapAuditFn,
} from "@/serverFunctions/nap";
import {
  computeConsistencyScore,
  NapResultsPanel,
  scoreColorClass,
  type NapResultRow,
} from "./components/NapResultsPanel";

function fmtDateTime(value: string | null): string {
  if (!value) return "-";
  const normalized = value.includes("T")
    ? value
    : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function Field({
  label,
  hint,
  ...props
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="form-control gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input className="input input-bordered w-full" {...props} />
      {hint ? (
        <span className="text-xs text-base-content/50">{hint}</span>
      ) : null}
    </label>
  );
}

export function NapFinderView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

  const audit = useMutation({
    mutationFn: (): Promise<{ score: number; results: NapResultRow[] }> =>
      runNapAuditFn({
        data: {
          projectId,
          businessName: businessName.trim(),
          city: city.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
      }),
    onSuccess: (result) => {
      setActiveAuditId(null);
      void queryClient.invalidateQueries({
        queryKey: ["nap-history", projectId],
      });
      toast.success(
        `Citation audit complete. Consistency score: ${result.score}/100.`,
      );
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to run citation audit"),
      );
    },
  });

  const history = useQuery({
    queryKey: ["nap-history", projectId],
    queryFn: () => getNapHistory({ data: { projectId } }),
  });

  const activeAuditResults = useQuery({
    queryKey: ["nap-audit-results", projectId, activeAuditId],
    queryFn: () =>
      getNapAuditResults({ data: { projectId, auditId: activeAuditId! } }),
    enabled: activeAuditId != null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !city.trim()) return;
    audit.mutate();
  };

  const historyRows = history.data ?? [];
  const activeHistoryRow =
    historyRows.find((row) => row.id === activeAuditId) ?? null;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="card bg-base-100 border border-base-300"
      >
        <div className="card-body gap-3">
          <h3 className="font-medium">Citation audit</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Business Name *"
              placeholder="e.g. Ace Dental Studio"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <Field
              label="City *"
              placeholder="e.g. Austin"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Field
              label="Phone"
              hint="Reference phone used for matching"
              placeholder="+1 512 555 0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Field
              label="Address"
              placeholder="Street, ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className={`btn btn-primary gap-2 ${audit.isPending ? "loading" : ""}`}
              disabled={audit.isPending}
            >
              Run citation audit
            </button>
            <span className="text-xs text-base-content/50">
              Uses DataForSEO credits: 1 GBP lookup + 1 SERP request per
              directory.
            </span>
          </div>
        </div>
      </form>

      {audit.data ? (
        <NapResultsPanel
          score={audit.data.score}
          results={audit.data.results}
        />
      ) : null}

      {activeAuditId && activeAuditResults.data ? (
        <NapResultsPanel
          score={
            activeHistoryRow?.consistencyScore ??
            computeConsistencyScore(activeAuditResults.data)
          }
          results={activeAuditResults.data}
        />
      ) : null}

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-b border-base-300">
            <h3 className="font-medium">Audit history</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Business</th>
                  <th>City</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover cursor-pointer ${row.id === activeAuditId ? "bg-base-200" : ""}`}
                    onClick={() => setActiveAuditId(row.id)}
                  >
                    <td className="whitespace-nowrap">
                      {fmtDateTime(row.createdAt)}
                    </td>
                    <td className="font-medium">{row.businessName}</td>
                    <td>{row.city}</td>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          row.consistencyScore == null
                            ? "badge-ghost"
                            : scoreColorClass(row.consistencyScore)
                        }`}
                      >
                        {row.consistencyScore ?? "n/a"}
                      </span>
                    </td>
                  </tr>
                ))}
                {historyRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-base-content/50"
                    >
                      No audits yet. Run your first citation audit above.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
