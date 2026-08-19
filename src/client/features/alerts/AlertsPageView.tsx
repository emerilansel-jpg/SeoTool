// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- form values narrowed to DB enum types
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Plus, Trash2, Power } from "lucide-react";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  listAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
} from "@/serverFunctions/alerts";
import type {
  ALERT_METRIC_TYPES,
  ALERT_FREQUENCIES,
} from "@/types/schemas/alerts";

export function AlertsPageView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<null | {
    id: string;
    name: string;
    metricType: string;
    threshold: number;
    keyword: string;
    frequency: string;
    recipients: string;
    enabled: boolean;
  }>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["alert_rules", projectId],
    queryFn: () => listAlertRules({ data: { projectId } }),
  });

  const toggleMutation = useMutation({
    mutationFn: (rule: (typeof rules)[0]) =>
      updateAlertRule({
        data: {
          id: rule.id,
          projectId,
          data: { enabled: !rule.enabled },
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["alert_rules", projectId],
      });
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to update alert rule"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAlertRule({ data: { id, projectId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["alert_rules", projectId],
      });
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to delete alert rule"),
      );
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6" aria-busy="true">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-40" />
            <div className="skeleton h-4 w-80" />
          </div>
          <div className="skeleton h-10 w-28" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card border border-base-300 bg-base-100">
              <div className="card-body p-4">
                <div className="skeleton h-5 w-64" />
                <div className="skeleton h-3.5 w-96" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Alerts</h1>
          <p className="text-sm text-base-content/70">
            Get notified when rankings drop or audit issues are found.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingRule(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="size-4" /> New Alert
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-base-300 rounded-box">
          <Bell className="w-12 h-12 text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold">No Alerts Configured</h3>
          <p className="text-base-content/70 max-w-md mt-2 mb-6">
            Create alert rules to monitor your rankings and audit health. You'll
            receive email notifications when conditions are met.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="size-4" /> Create Alert Rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="card bg-base-100 border border-base-300"
            >
              <div className="card-body p-4 flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${rule.enabled ? "bg-success" : "bg-base-300"}`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{rule.name}</span>
                      <span className="badge badge-sm badge-outline">
                        {rule.metricType === "rank_drop"
                          ? "Rank Drop"
                          : "Audit Critical"}
                      </span>
                      <span className="badge badge-sm badge-ghost">
                        {rule.frequency}
                      </span>
                    </div>
                    <div className="text-xs text-base-content/60 mt-1">
                      Recipients: {rule.recipients}
                      {rule.lastTriggeredAt && (
                        <span className="ml-3">
                          Last triggered:{" "}
                          {new Date(rule.lastTriggeredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    title={rule.enabled ? "Disable" : "Enable"}
                    onClick={() => toggleMutation.mutate(rule)}
                  >
                    <Power className="size-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error"
                    title="Delete"
                    onClick={() => deleteMutation.mutate(rule.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AlertRuleModal
          projectId={projectId}
          editingRule={editingRule}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function AlertRuleModal({
  projectId,
  editingRule,
  onClose,
}: {
  projectId: string;
  editingRule: null | {
    id: string;
    name: string;
    metricType: string;
    threshold: number;
    keyword: string;
    frequency: string;
    recipients: string;
    enabled: boolean;
  };
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!editingRule;

  const [name, setName] = useState(editingRule?.name ?? "");
  const [metricType, setMetricType] = useState(
    editingRule?.metricType ?? "rank_drop",
  );
  const [threshold, setThreshold] = useState(
    editingRule?.threshold?.toString() ?? "10",
  );
  const [keyword, setKeyword] = useState(editingRule?.keyword ?? "");
  const [frequency, setFrequency] = useState(editingRule?.frequency ?? "daily");
  const [recipients, setRecipients] = useState(editingRule?.recipients ?? "");

  const mutation = useMutation({
    mutationFn: async () => {
      const condition = {
        threshold: parseInt(threshold),
        ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
      };

      const payload = {
        projectId,
        name,
        metricType: metricType as (typeof ALERT_METRIC_TYPES)[number],
        condition,
        frequency: frequency as (typeof ALERT_FREQUENCIES)[number],
        recipients,
      };

      if (isEditing && editingRule) {
        return updateAlertRule({
          data: { id: editingRule.id, projectId, data: payload },
        });
      }
      return createAlertRule({ data: payload });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["alert_rules", projectId],
      });
      onClose();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to save alert rule"));
    },
  });

  return (
    <Modal maxWidth="max-w-lg" onClose={onClose} labelledBy="alert-rule-title">
      <h3 id="alert-rule-title" className="text-lg font-semibold">
        {isEditing ? "Edit Alert Rule" : "Create Alert Rule"}
      </h3>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm">Alert Name</span>
          <input
            className="input input-bordered"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Keyword ranking drop alert"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">Alert Type</span>
          <select
            className="select select-bordered"
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
          >
            <option value="rank_drop">
              Rank Drop (keywords losing positions)
            </option>
            <option value="audit_critical">
              Audit Critical Issues (new critical issues found)
            </option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm">
              {metricType === "rank_drop"
                ? "Position Drop Threshold"
                : "Critical Issue Threshold"}
            </span>
            <input
              type="number"
              min={1}
              className="input input-bordered"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Frequency</span>
            <select
              className="select select-bordered"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
        </div>

        {metricType === "rank_drop" && (
          <label className="block">
            <span className="mb-1 block text-sm">
              Specific Keyword (optional, leave empty for all tracked keywords)
            </span>
            <input
              className="input input-bordered"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., best seo tools"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm">
            Recipient Emails (comma-separated)
          </span>
          <input
            className="input input-bordered"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="user@example.com, team@example.com"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          disabled={mutation.isPending || !name || !recipients}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
        </button>
      </div>
    </Modal>
  );
}
