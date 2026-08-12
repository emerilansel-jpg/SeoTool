import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listApiKeys,
  generateApiKey,
  revokeApiKey,
} from "@/serverFunctions/api-keys";

interface ApiKeyEntry {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

interface NewKeyData {
  id: string;
  key: string;
  prefix: string;
  name: string;
}

function formatDate(date: Date | null) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApiKeySection() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyData, setNewKeyData] = useState<NewKeyData | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const result = await listApiKeys();
      setKeys(result as ApiKeyEntry[]);
    } catch {
      toast.error("Could not load API keys.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  async function handleGenerate() {
    const name = newKeyName.trim();
    if (!name) return;

    setIsGenerating(true);
    try {
      const result = await generateApiKey({ data: { name } });
      setNewKeyData(result as NewKeyData);
      setNewKeyName("");
      toast.success(
        "API key generated. Copy it now, it will not be shown again.",
      );
      void fetchKeys();
    } catch {
      toast.error("Could not generate API key.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    setRevokingId(keyId);
    try {
      await revokeApiKey({ data: { keyId } });
      toast.success("API key revoked.");
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      if (newKeyData?.id === keyId) {
        setNewKeyData(null);
      }
    } catch {
      toast.error("Could not revoke API key.");
    } finally {
      setRevokingId(null);
    }
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">API Keys</h2>

      {/* Newly generated key banner */}
      {newKeyData ? (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-2">
          <p className="text-sm font-medium text-success">
            Your new API key has been generated.
          </p>
          <p className="text-xs text-base-content/60">
            Copy this key now. It will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-base-200 px-3 py-2 text-xs break-all">
              {newKeyData.key}
            </code>
            <button
              type="button"
              className="btn btn-soft btn-sm"
              onClick={() => copyToClipboard(newKeyData.key)}
            >
              Copy
            </button>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setNewKeyData(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Generate form */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm">Key name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="e.g. CI pipeline, staging server"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            disabled={isGenerating}
            maxLength={100}
          />
        </div>
        <button
          type="button"
          className="btn btn-soft btn-sm"
          disabled={isGenerating || !newKeyName.trim()}
          onClick={() => void handleGenerate()}
        >
          {isGenerating ? "Generating..." : "Generate New Key"}
        </button>
      </div>

      {/* Key list */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-sm" />
        </div>
      ) : keys.length === 0 ? (
        <p className="text-sm text-base-content/50 py-4">
          No API keys yet. Generate one above to get started.
        </p>
      ) : (
        <div className="divide-y divide-base-200 rounded-lg border border-base-200">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between gap-4 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{key.name}</p>
                <p className="text-xs text-base-content/50">
                  <code className="bg-base-200 rounded px-1.5 py-0.5">
                    {key.prefix}...
                  </code>
                  <span className="ml-2">
                    Created {formatDate(key.createdAt)}
                  </span>
                  <span className="ml-2">
                    Last used {formatDate(key.lastUsedAt)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="btn btn-soft btn-error btn-sm shrink-0"
                disabled={revokingId === key.id}
                onClick={() => void handleRevoke(key.id)}
              >
                {revokingId === key.id ? "Revoking..." : "Revoke"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
