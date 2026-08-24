import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CircleCheck, KeyRound, Pencil, RefreshCw, Trash2 } from "lucide-react";
import {
  getAdminSettings,
  removeAdminSetting,
  saveAdminSetting,
  testPaypalConfiguration,
} from "@/serverFunctions/admin-settings";
import type { AdminSettingStatus } from "@/server/features/admin/services/AdminSettingsService";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

interface EditState {
  envKey: string;
  label: string;
  secret: boolean;
}

export function AdminApiKeysPage() {
  const getSettings = useServerFn(getAdminSettings);
  const save = useServerFn(saveAdminSetting);
  const remove = useServerFn(removeAdminSetting);
  const testPaypal = useServerFn(testPaypalConfiguration);
  const queryClient = useQueryClient();
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editValue, setEditValue] = useState("");
  const [paypalTestResult, setPaypalTestResult] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getSettings(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-settings"] });

  const saveMutation = useMutation({
    mutationFn: (input: { envKey: string; value: string }) =>
      save({ data: input }),
    onSuccess: () => {
      toast.success("Setting saved. It applies within a minute.");
      setEditState(null);
      void invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not save setting."));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (envKey: string) => remove({ data: { envKey } }),
    onSuccess: () => {
      toast.success("Override removed. Falls back to the deploy value.");
      void invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not remove override."));
    },
  });

  const paypalTestMutation = useMutation({
    mutationFn: () => testPaypal(),
    onSuccess: (result) => {
      const message = `${result.mode.toUpperCase()} connection verified; ${result.plans.length} active plan${result.plans.length === 1 ? "" : "s"} match.`;
      setPaypalTestResult(message);
      toast.success(message);
    },
    onError: (error) => {
      setPaypalTestResult(null);
      toast.error(
        getStandardErrorMessage(error, "PayPal configuration test failed."),
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-dashed border-base-300 p-8 text-center text-sm text-base-content/60">
        Unable to load settings.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/70">
        Editable values are stored in the database and take precedence over
        deploy environment variables. Secret values are write-only and never
        displayed after saving.
      </p>
      {data.groups.map((group) => (
        <div
          key={group.provider}
          className="card bg-base-100 border border-base-300"
        >
          <div className="card-body p-4 gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="size-4 text-base-content/50" />
              {group.provider}
            </h2>
            <div className="divide-y divide-base-300">
              {group.settings.map((setting) => (
                <SettingRow
                  key={setting.envKey}
                  setting={setting}
                  onEdit={() => {
                    setEditState({
                      envKey: setting.envKey,
                      label: setting.label,
                      secret: setting.secret,
                    });
                    setEditValue("");
                  }}
                  onRemove={() => removeMutation.mutate(setting.envKey)}
                  removing={removeMutation.isPending}
                />
              ))}
            </div>
            {group.provider === "PayPal" ? (
              <div className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-3">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={paypalTestMutation.isPending}
                  onClick={() => paypalTestMutation.mutate()}
                >
                  <RefreshCw
                    className={`size-3.5 ${paypalTestMutation.isPending ? "animate-spin" : ""}`}
                  />
                  Test PayPal configuration
                </button>
                {paypalTestResult ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-success">
                    <CircleCheck className="size-3.5" />
                    {paypalTestResult}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {editState ? (
        <Modal
          maxWidth="max-w-lg"
          labelledBy="admin-setting-edit-title"
          onClose={() => setEditState(null)}
        >
          <h3 id="admin-setting-edit-title" className="font-semibold text-base">
            Edit {editState.label}
          </h3>
          <p className="text-xs text-base-content/60 font-mono break-all">
            {editState.envKey}
          </p>
          {editState.secret ? (
            <p className="text-xs text-base-content/60">
              Secret value: leave blank to keep the stored one, or enter a new
              value to replace it.
            </p>
          ) : null}
          <input
            type={editState.secret ? "password" : "text"}
            className="input input-bordered w-full font-mono text-sm"
            value={editValue}
            autoComplete="off"
            placeholder={editState.secret ? "New value" : "Value"}
            onChange={(event) => setEditValue(event.target.value)}
          />
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setEditState(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={editState.secret && editValue === ""}
              onClick={() =>
                saveMutation.mutate({
                  envKey: editState.envKey,
                  value: editValue,
                })
              }
            >
              Save
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function SettingRow({
  setting,
  onEdit,
  onRemove,
  removing,
}: {
  setting: AdminSettingStatus;
  onEdit: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{setting.label}</span>
          {setting.configured ? (
            <span className="badge badge-sm badge-success">
              {setting.source === "db" ? "DB override" : "Configured"}
            </span>
          ) : (
            <span className="badge badge-sm badge-error">Missing</span>
          )}
          {!setting.editable ? (
            <span className="badge badge-sm badge-ghost">env only</span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate font-mono text-xs text-base-content/50">
          {setting.envKey}
          {setting.value
            ? ` = ${setting.value}`
            : setting.secret && setting.configured
              ? " = ••••••"
              : ""}
        </p>
        {setting.hint ? (
          <p className="mt-0.5 text-xs text-base-content/40">{setting.hint}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {setting.editable ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            aria-label={`Edit ${setting.label}`}
            onClick={onEdit}
          >
            <Pencil className="size-3.5" />
          </button>
        ) : null}
        {setting.source === "db" ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square text-error"
            aria-label={`Remove override for ${setting.label}`}
            disabled={removing}
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
