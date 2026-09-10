import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Compass,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  discoverAiPrompts,
  getDiscoveredPrompts,
  promoteDiscoveredPrompt,
} from "@/serverFunctions/ai-tracking";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

interface Props {
  projectId: string;
  domain: string;
}

export function AiDiscoveredPromptsTab({ projectId, domain }: Props) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<
    "all" | "mentioned" | "cited" | "untracked"
  >("all");
  const [platform, setPlatform] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const getDiscoveredFn = useServerFn(getDiscoveredPrompts);
  const discoverFn = useServerFn(discoverAiPrompts);
  const promoteFn = useServerFn(promoteDiscoveredPrompt);

  const { data, isLoading } = useQuery({
    queryKey: [
      "ai-discovered-prompts",
      projectId,
      filter,
      platform,
      search,
      page,
    ],
    queryFn: () =>
      getDiscoveredFn({
        data: { projectId, filter, platform, search, page, pageSize: 20 },
      }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["ai-discovered-prompts", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["ai-tracking-dashboard", projectId],
    });
  };

  const discoverMutation = useMutation({
    mutationFn: () => discoverFn({ data: { projectId } }),
    onSuccess: (res) => {
      toast.success(
        `Discovery complete! Found ${res.discoveredCount} AI prompts for ${domain}.`,
      );
      invalidate();
    },
    onError: (err) => {
      toast.error(getStandardErrorMessage(err, "Prompt discovery failed."));
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (promptId: string) =>
      promoteFn({ data: { projectId, promptId } }),
    onSuccess: () => {
      toast.success("Prompt added to tracking list.");
      invalidate();
    },
    onError: (err) => {
      toast.error(getStandardErrorMessage(err, "Could not track prompt."));
    },
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {/* Top action / info bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Compass className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-base-content">
              AI Organic Prompts Discovery
            </h3>
            <p className="text-xs text-base-content/60">
              Discovered search questions and prompts from ChatGPT and Google AI
              Overview that mention or cite {domain}.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-primary gap-1.5 shrink-0"
          disabled={discoverMutation.isPending}
          onClick={() => discoverMutation.mutate()}
        >
          <RefreshCw
            className={`size-3.5 ${discoverMutation.isPending ? "animate-spin" : ""}`}
          />
          {discoverMutation.isPending
            ? "Discovering Prompts…"
            : "Auto-Discover Prompts"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="join">
          {(["all", "mentioned", "cited", "untracked"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`join-item btn btn-xs capitalize ${filter === f ? "btn-active btn-neutral" : "btn-outline"}`}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            className="select select-xs select-bordered"
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Platforms</option>
            <option value="chat_gpt">ChatGPT</option>
            <option value="google">Google AI</option>
          </select>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 size-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search prompts…"
              className="input input-xs input-bordered pl-8 w-48"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Prompts Table */}
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-sm">
          <thead>
            <tr className="bg-base-200/50 text-xs font-semibold text-base-content/70">
              <th>Prompt / Question</th>
              <th>Platform</th>
              <th>AI Mention</th>
              <th>AI Citation</th>
              <th className="text-right">AI Search Volume</th>
              <th>Sources / Entity</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-xs text-base-content/50"
                >
                  <span className="loading loading-spinner loading-sm text-primary mr-2" />
                  Loading discovered prompts…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-xs text-base-content/60"
                >
                  No discovered prompts found. Click &quot;Auto-Discover
                  Prompts&quot; to scan leading AI engines.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover">
                  <td className="font-medium text-base-content max-w-xs">
                    <span className="line-clamp-2">{item.prompt}</span>
                  </td>
                  <td>
                    <span className="badge badge-xs font-medium uppercase">
                      {item.platform === "chat_gpt"
                        ? "ChatGPT"
                        : item.platform === "google"
                          ? "Google AI"
                          : item.platform}
                    </span>
                  </td>
                  <td>
                    {item.hasMention ? (
                      <span className="badge badge-xs badge-success gap-1">
                        YES
                      </span>
                    ) : (
                      <span className="badge badge-xs badge-ghost">NO</span>
                    )}
                  </td>
                  <td>
                    {item.hasCitation ? (
                      <span className="badge badge-xs badge-info gap-1">
                        YES
                      </span>
                    ) : (
                      <span className="badge badge-xs badge-ghost">NO</span>
                    )}
                  </td>
                  <td className="text-right font-mono text-xs">
                    {item.aiSearchVolume > 0
                      ? item.aiSearchVolume.toLocaleString()
                      : "—"}
                  </td>
                  <td className="text-xs text-base-content/70 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {item.sources.slice(0, 2).map((s, idx) => (
                        <span
                          key={idx}
                          className="badge badge-ghost badge-xs truncate max-w-[140px]"
                        >
                          {s.domain || s.title || "source"}
                        </span>
                      ))}
                      {item.sources.length > 2 && (
                        <span className="text-[10px] text-base-content/40">
                          +{item.sources.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right">
                    {item.isTracked ? (
                      <span className="badge badge-outline badge-xs text-success">
                        Tracked
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline btn-primary gap-1"
                        disabled={promoteMutation.isPending}
                        onClick={() => promoteMutation.mutate(item.id)}
                      >
                        <Plus className="size-3" />
                        Track
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between text-xs text-base-content/60 px-1">
          <span>Page {page}</span>
          <div className="join">
            <button
              type="button"
              className="join-item btn btn-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="join-item btn btn-xs"
              disabled={!data.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
