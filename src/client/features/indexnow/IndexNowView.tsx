/* oxlint-disable max-lines -- full setup + submissions + history in one view */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  Copy,
  Download,
  ExternalLink,
  KeyRound,
  RefreshCw,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  getIndexNowStatus,
  rotateIndexNowKey,
  setupIndexNowKey,
  submitIndexNowUrls,
  toggleIndexNowAutoSubmit,
  verifyIndexNowKey,
} from "@/serverFunctions/indexnow";

const fmt = (n: number) => new Intl.NumberFormat().format(n);

export function IndexNowView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [hostInput, setHostInput] = useState("");
  const [urlsInput, setUrlsInput] = useState("");
  const [showKey, setShowKey] = useState(false);

  const status = useQuery({
    queryKey: ["indexnow-status", projectId],
    queryFn: () => getIndexNowStatus({ data: { projectId } }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["indexnow-status", projectId] });

  const setupMutation = useMutation({
    mutationFn: () =>
      setupIndexNowKey({ data: { projectId, host: hostInput.trim() } }),
    onSuccess: () => {
      toast.success(
        "IndexNow key generated. Upload the key file, then verify.",
      );
      invalidate();
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Failed to generate key")),
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyIndexNowKey({ data: { projectId } }),
    onSuccess: (result) => {
      if (result.verified) {
        toast.success("Key file verified. IndexNow is live.");
      } else {
        toast.error(result.error ?? "Key file could not be verified.");
      }
      invalidate();
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Verification failed")),
  });

  const rotateMutation = useMutation({
    mutationFn: () => rotateIndexNowKey({ data: { projectId } }),
    onSuccess: () => {
      toast.success(
        "New key generated. Replace the key file on your site, then verify again.",
      );
      invalidate();
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Failed to rotate key")),
  });

  const toggleMutation = useMutation({
    mutationFn: (autoSubmit: boolean) =>
      toggleIndexNowAutoSubmit({ data: { projectId, autoSubmit } }),
    onSuccess: () => invalidate(),
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Failed to update setting")),
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const urls = urlsInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      return submitIndexNowUrls({ data: { projectId, urls } });
    },
    onSuccess: (result) => {
      if (result.status === "success") {
        toast.success(`Submitted ${fmt(result.submitted)} URL(s) to IndexNow.`);
      } else if (result.status === "skipped") {
        toast.error("Key not verified yet. Verify the key file first.");
      } else {
        toast.error(result.responseSummary ?? "Submission failed.");
      }
      if (result.rejected > 0) {
        toast.warning(
          `${result.rejected} URL(s) skipped: they must be on the configured host.`,
        );
      }
      invalidate();
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Submission failed")),
  });

  if (status.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const key = status.data?.key ?? null;
  const submissions = status.data?.submissions ?? [];

  return (
    <div className="space-y-6">
      {!key ? (
        <SetupCard
          hostInput={hostInput}
          setHostInput={setHostInput}
          pending={setupMutation.isPending}
          onSubmit={() => {
            if (hostInput.trim()) setupMutation.mutate();
          }}
        />
      ) : (
        <>
          <KeyCard
            host={key.host}
            apiKey={key.key}
            keyLocation={key.keyLocation}
            status={key.status}
            autoSubmit={key.autoSubmit}
            lastError={key.lastError}
            showKey={showKey}
            setShowKey={setShowKey}
            onVerify={() => verifyMutation.mutate()}
            verifying={verifyMutation.isPending}
            onRotate={() => rotateMutation.mutate()}
            rotating={rotateMutation.isPending}
            onToggleAutoSubmit={(value) => toggleMutation.mutate(value)}
          />
          <SubmitCard
            host={key.host}
            urlsInput={urlsInput}
            setUrlsInput={setUrlsInput}
            pending={submitMutation.isPending}
            onSubmit={() => submitMutation.mutate()}
          />
        </>
      )}

      <SubmissionsTable submissions={submissions} />
    </div>
  );
}

function SetupCard({
  hostInput,
  setHostInput,
  pending,
  onSubmit,
}: {
  hostInput: string;
  setHostInput: (value: string) => void;
  pending: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Connect your site</h2>
      </div>
      <p className="mt-2 text-sm text-base-content/60">
        Enter the site host you want to index. SeoTool.im generates an IndexNow
        key for it, you upload a small key file to the site root, and
        submissions to Bing, Yandex, Seznam, and Naver go out under your key.
      </p>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input
          type="text"
          className="input input-bordered w-full sm:max-w-md"
          placeholder="example.com"
          value={hostInput}
          onChange={(event) => setHostInput(event.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary gap-2"
          disabled={pending || !hostInput.trim()}
        >
          {pending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Zap className="size-4" />
          )}
          Generate key
        </button>
      </form>
    </div>
  );
}

function KeyCard({
  host,
  apiKey,
  keyLocation,
  status,
  autoSubmit,
  lastError,
  showKey,
  setShowKey,
  onVerify,
  verifying,
  onRotate,
  rotating,
  onToggleAutoSubmit,
}: {
  host: string;
  apiKey: string;
  keyLocation: string;
  status: "pending" | "verified";
  autoSubmit: boolean;
  lastError: string | null;
  showKey: boolean;
  setShowKey: (value: boolean) => void;
  onVerify: () => void;
  verifying: boolean;
  onRotate: () => void;
  rotating: boolean;
  onToggleAutoSubmit: (value: boolean) => void;
}) {
  const masked = `${apiKey.slice(0, 6)}${"•".repeat(16)}${apiKey.slice(-4)}`;

  const copyKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    toast.success("Key copied to clipboard.");
  };

  const downloadKeyFile = () => {
    const blob = new Blob([apiKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${apiKey}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(
      `Downloaded ${apiKey}.txt. Upload it to https://${host}/${apiKey}.txt`,
    );
  };

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">{host}</h2>
          {status === "verified" ? (
            <span className="badge badge-success gap-1">
              <BadgeCheck className="size-3" /> Verified
            </span>
          ) : (
            <span className="badge badge-warning">Key file pending</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline gap-2"
            onClick={onVerify}
            disabled={verifying}
          >
            {verifying ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            Verify key file
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost gap-2"
            onClick={onRotate}
            disabled={rotating}
          >
            <RefreshCw className="size-4" />
            Rotate key
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-base-content/50">
            Key file
          </div>
          <p className="mt-1 text-sm text-base-content/60">
            1. Download the key file.
          </p>
          <p className="text-sm text-base-content/60">
            2. Upload it so it is served at{" "}
            <a
              className="link link-primary inline-flex items-center gap-1"
              href={keyLocation}
              target="_blank"
              rel="noreferrer"
            >
              {keyLocation} <ExternalLink className="size-3" />
            </a>
          </p>
          <p className="text-sm text-base-content/60">3. Click Verify. Done.</p>
          <button
            type="button"
            className="btn btn-sm btn-outline mt-3 gap-2"
            onClick={downloadKeyFile}
          >
            <Download className="size-4" />
            Download {apiKey.slice(0, 8)}...txt
          </button>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-base-content/50">
            API key
          </div>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-base-200 px-2 py-1 font-mono text-sm">
              {showKey ? apiKey : masked}
            </code>
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="btn btn-xs btn-ghost gap-1"
              onClick={() => void copyKey()}
            >
              <Copy className="size-3" /> Copy
            </button>
          </div>
          {lastError ? (
            <p className="mt-2 text-xs text-error">{lastError}</p>
          ) : null}
        </div>
      </div>

      <div className="divider my-4" />
      <label className="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={autoSubmit}
          onChange={(event) => onToggleAutoSubmit(event.target.checked)}
        />
        <div>
          <div className="font-medium">Auto-submit from Site Audit</div>
          <div className="text-xs text-base-content/60">
            Every completed audit automatically submits new and content-changed
            URLs (up to 500 per audit).
          </div>
        </div>
      </label>
    </div>
  );
}

function SubmitCard({
  host,
  urlsInput,
  setUrlsInput,
  pending,
  onSubmit,
}: {
  host: string;
  urlsInput: string;
  setUrlsInput: (value: string) => void;
  pending: boolean;
  onSubmit: () => void;
}) {
  const urlCount = urlsInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-6">
      <h2 className="text-lg font-semibold">Submit URLs</h2>
      <p className="mt-1 text-sm text-base-content/60">
        One URL per line, on {host}. Batch limit 10,000; IndexNow accepts up to
        10,000 per call.
      </p>
      <textarea
        className="textarea textarea-bordered mt-3 w-full font-mono text-sm"
        rows={6}
        placeholder={`https://${host}/page-1\nhttps://${host}/page-2`}
        value={urlsInput}
        onChange={(event) => setUrlsInput(event.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={onSubmit}
          disabled={pending || urlCount === 0}
        >
          {pending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Send className="size-4" />
          )}
          Submit {urlCount > 0 ? `${fmt(urlCount)} URL(s)` : ""}
        </button>
        <span className="text-xs text-base-content/50">
          Engines: Bing, Yandex, Seznam, Naver, Yep (via api.indexnow.org)
        </span>
      </div>
    </div>
  );
}

const STATUS_BADGES: Record<string, string> = {
  success: "badge-success",
  partial: "badge-warning",
  failed: "badge-error",
  skipped: "badge-ghost",
};

function SubmissionsTable({
  submissions,
}: {
  submissions: Array<{
    id: string;
    urlCount: number;
    trigger: string;
    status: string;
    responseStatus: number | null;
    responseSummary: string | null;
    createdAt: string;
  }>;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-4">
      <h2 className="text-base font-semibold">Submission history</h2>
      {submissions.length === 0 ? (
        <p className="mt-3 text-sm text-base-content/50">
          No submissions yet. Submit URLs manually or enable auto-submit.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm mt-2">
            <thead>
              <tr>
                <th>When</th>
                <th>URLs</th>
                <th>Trigger</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="whitespace-nowrap text-xs text-base-content/60">
                    {new Date(submission.createdAt).toLocaleString()}
                  </td>
                  <td>{fmt(submission.urlCount)}</td>
                  <td>
                    <span className="badge badge-ghost badge-sm">
                      {submission.trigger === "auto_audit"
                        ? "Auto (audit)"
                        : "Manual"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${STATUS_BADGES[submission.status] ?? "badge-ghost"}`}
                    >
                      {submission.status}
                    </span>
                  </td>
                  <td className="max-w-72 truncate text-xs text-base-content/60">
                    {submission.responseSummary ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
