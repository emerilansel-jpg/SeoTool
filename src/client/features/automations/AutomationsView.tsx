/* oxlint-disable max-lines -- create + manage + delivery history in one view */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Plus, Trash2, Webhook, X, Zap } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  createWebhook,
  deleteWebhook,
  listWebhooks,
  sendWebhookTestPing,
  updateWebhook,
} from "@/serverFunctions/growth-tools";

type ListResult = Awaited<ReturnType<typeof listWebhooks>>;
type WebhookRow = ListResult["webhooks"][number];
type DeliveryRow = ListResult["deliveries"][number];
type CreateWebhookData = Parameters<typeof createWebhook>[0] extends {
  data: infer D;
}
  ? D
  : never;
type WebhookEventName = CreateWebhookData["events"][number];

const PAYLOAD_EXAMPLE = `{
  "event": "audit.completed",
  "timestamp": "2026-11-21T10:00:00.000Z",
  "projectId": "proj_123",
  "data": { "auditId": "aud_456" }
}`;

export function AutomationsView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<WebhookEventName>>(
    new Set(),
  );
  const [scopeToProject, setScopeToProject] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const webhooksQuery = useQuery({
    queryKey: ["webhooks"],
    queryFn: () => listWebhooks(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateWebhookData) => createWebhook({ data: input }),
    onSuccess: (result) => {
      setCreatedSecret(result.secret);
      setUrl("");
      setSelectedEvents(new Set());
      setScopeToProject(false);
      toast.success("Webhook created");
      void queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to create webhook"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { webhookId: string; active: boolean }) =>
      updateWebhook({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to update webhook"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (webhookId: string) => deleteWebhook({ data: { webhookId } }),
    onSuccess: () => {
      toast.success("Webhook deleted");
      void queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to delete webhook"));
    },
  });

  const testPingMutation = useMutation({
    mutationFn: (webhookId: string) =>
      sendWebhookTestPing({ data: { webhookId } }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      if (result.ok) {
        toast.success(`Ping delivered: ${result.detail}`);
      } else {
        toast.error(`Ping failed: ${result.detail}`);
      }
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Test ping failed"));
    },
  });

  const toggleEvent = (event: WebhookEventName, checked: boolean) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(event);
      } else {
        next.delete(event);
      }
      return next;
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || selectedEvents.size === 0) return;
    if (!/^https:\/\//i.test(trimmed)) {
      toast.error("URL must start with https://");
      return;
    }
    createMutation.mutate({
      url: trimmed,
      events: [...selectedEvents],
      projectId: scopeToProject ? projectId : null,
    });
  };

  const handleDelete = (webhook: WebhookRow) => {
    if (
      !window.confirm(`Delete webhook ${webhook.url}? This cannot be undone.`)
    )
      return;
    deleteMutation.mutate(webhook.id);
  };

  const webhooks = webhooksQuery.data?.webhooks ?? [];
  const deliveries = webhooksQuery.data?.deliveries ?? [];
  const availableEvents = webhooksQuery.data?.availableEvents ?? [];
  const busy =
    createMutation.isPending ||
    deleteMutation.isPending ||
    testPingMutation.isPending;

  return (
    <div className="space-y-6">
      <CreateCard
        url={url}
        setUrl={setUrl}
        availableEvents={availableEvents}
        selectedEvents={selectedEvents}
        toggleEvent={toggleEvent}
        scopeToProject={scopeToProject}
        setScopeToProject={setScopeToProject}
        onSubmit={handleCreate}
        pending={createMutation.isPending}
      />

      {createdSecret ? (
        <SecretReveal
          secret={createdSecret}
          onDismiss={() => setCreatedSecret(null)}
        />
      ) : null}

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-b border-base-300 flex items-center gap-2">
            <Webhook className="size-4 text-primary" />
            <h3 className="font-medium">Webhooks</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Events</th>
                  <th>Scope</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {webhooks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-base-content/50 py-6"
                    >
                      No webhooks yet. Create one above to receive event
                      notifications.
                    </td>
                  </tr>
                ) : (
                  webhooks.map((webhook) => (
                    <tr key={webhook.id} className="hover">
                      <td
                        className="max-w-xs truncate font-medium"
                        title={webhook.url}
                      >
                        {webhook.url}
                      </td>
                      <td>
                        <EventBadges events={webhook.events} />
                      </td>
                      <td className="text-xs">
                        <ScopeLabel
                          webhookProjectId={webhook.projectId}
                          projectId={projectId}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={webhook.active}
                          disabled={updateMutation.isPending}
                          onChange={(e) =>
                            updateMutation.mutate({
                              webhookId: webhook.id,
                              active: e.target.checked,
                            })
                          }
                        />
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs gap-1"
                          disabled={busy}
                          onClick={() => testPingMutation.mutate(webhook.id)}
                        >
                          <Zap className="size-3.5" />
                          Test ping
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error gap-1"
                          disabled={busy}
                          onClick={() => handleDelete(webhook)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-b border-base-300">
            <h3 className="font-medium">Delivery history (last 30)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>HTTP</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-base-content/50 py-6"
                    >
                      No deliveries yet.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((delivery) => (
                    <DeliveryRowView key={delivery.id} delivery={delivery} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-b border-base-300">
            <h3 className="font-medium">Payload shape</h3>
          </div>
          <div className="px-4 py-3 space-y-2">
            <p className="text-sm text-base-content/60">
              Every delivery posts a JSON body with this shape to your endpoint:
            </p>
            <pre className="bg-base-200 rounded-lg p-3 text-xs overflow-x-auto">
              {PAYLOAD_EXAMPLE}
            </pre>
            <p className="text-xs text-base-content/50">
              Verify authenticity with the <code>x-seotool-signature</code>{" "}
              header using your signing secret.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateCard({
  url,
  setUrl,
  availableEvents,
  selectedEvents,
  toggleEvent,
  scopeToProject,
  setScopeToProject,
  onSubmit,
  pending,
}: {
  url: string;
  setUrl: (value: string) => void;
  availableEvents: readonly WebhookEventName[];
  selectedEvents: Set<string>;
  toggleEvent: (event: WebhookEventName, checked: boolean) => void;
  scopeToProject: boolean;
  setScopeToProject: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="card bg-base-100 border border-base-300"
    >
      <div className="card-body gap-4">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            Create webhook
          </h3>
          <p className="text-sm text-base-content/60 mt-1">
            We POST event payloads to your HTTPS endpoint.
          </p>
        </div>
        <label className="form-control">
          <div className="label py-1">
            <span className="label-text">Endpoint URL (https required)</span>
          </div>
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder="https://example.com/hooks/seotool"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <div>
          <p className="text-sm mb-2">Events</p>
          <div className="flex flex-wrap gap-4">
            {availableEvents.map((event) => (
              <label key={event} className="label cursor-pointer gap-2 py-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={selectedEvents.has(event)}
                  onChange={(e) => toggleEvent(event, e.target.checked)}
                />
                <span className="label-text font-mono text-xs">{event}</span>
              </label>
            ))}
          </div>
        </div>
        <label className="label cursor-pointer gap-2 py-1 w-fit">
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-primary"
            checked={scopeToProject}
            onChange={(e) => setScopeToProject(e.target.checked)}
          />
          <span className="label-text">Scope to this project</span>
        </label>
        <div className="card-actions">
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={pending || !url.trim() || selectedEvents.size === 0}
          >
            {pending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Plus className="size-4" />
            )}
            Create webhook
          </button>
        </div>
      </div>
    </form>
  );
}

function SecretReveal({
  secret,
  onDismiss,
}: {
  secret: string;
  onDismiss: () => void;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast.success("Secret copied to clipboard");
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  return (
    <div className="alert alert-warning items-start">
      <div className="flex-1 space-y-2">
        <p className="font-medium">
          Copy this secret now, it will not be shown again
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="bg-base-100 border border-warning/40 rounded px-2 py-1 text-xs break-all">
            {secret}
          </code>
          <button
            type="button"
            className="btn btn-sm gap-1"
            onClick={() => void handleCopy()}
          >
            <Copy className="size-3.5" />
            Copy
          </button>
        </div>
        <p className="text-xs">
          Verify deliveries by checking the header{" "}
          <code className="bg-base-100 rounded px-1">x-seotool-signature</code>:{" "}
          <code className="bg-base-100 rounded px-1">
            sha256=&lt;hmac_sha256(secret, body)&gt;
          </code>
        </p>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        onClick={onDismiss}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function EventBadges({ events }: { events: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {events.map((event) => (
        <span key={event} className="badge badge-ghost badge-sm font-mono">
          {event}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`badge badge-sm ${status === "delivered" ? "badge-success" : "badge-error"}`}
    >
      {status}
    </span>
  );
}

function ScopeLabel({
  webhookProjectId,
  projectId,
}: {
  webhookProjectId: string | null;
  projectId: string;
}) {
  if (!webhookProjectId) return <span>Org-wide</span>;
  if (webhookProjectId === projectId) return <span>This project</span>;
  return (
    <span title={webhookProjectId} className="font-mono">
      Project ...{webhookProjectId.slice(-8)}
    </span>
  );
}

function DeliveryRowView({ delivery }: { delivery: DeliveryRow }) {
  return (
    <tr className="hover">
      <td className="text-xs whitespace-nowrap">
        {new Date(delivery.createdAt).toLocaleString()}
      </td>
      <td className="font-mono text-xs">{delivery.event}</td>
      <td>
        <StatusBadge status={delivery.status} />
      </td>
      <td>{delivery.attempts}</td>
      <td className="text-xs">{delivery.responseStatus ?? "-"}</td>
      <td
        className="text-xs text-error max-w-xs truncate"
        title={delivery.lastError ?? undefined}
      >
        {delivery.lastError ?? "-"}
      </td>
    </tr>
  );
}
