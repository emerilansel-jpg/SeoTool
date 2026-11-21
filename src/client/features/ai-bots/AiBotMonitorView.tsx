import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  connectAiBotSite,
  disconnectAiBotSite,
  getAiBotDashboard,
  importAiBotAccessLog,
  rotateAiBotToken,
  runAiBotRobotsCheck,
} from "@/serverFunctions/ai-bots";
import {
  AI_BOT_CATEGORY_LABELS,
  isSearchBaselineBot,
  type AiBotCategory,
} from "@/shared/ai-bots";
import type {
  AiBotDashboard,
  RobotsCompliance,
} from "@/server/features/ai-bots/services/AiBotService";

const MAX_LOG_FILE_MB = 50;
const INGEST_PATH = "/api/ingest/ai-bots";

const DIRECTIVES = {
  allowed: { label: "Allowed", badge: "badge-success" },
  disallowed: { label: "Blocked", badge: "badge-error" },
  not_mentioned: { label: "Not mentioned", badge: "badge-ghost" },
} as const;

const fmt = (n: number) => new Intl.NumberFormat().format(n);

function fail(error: unknown, fallback: string) {
  toast.error(getStandardErrorMessage(error, fallback));
}

function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function truncateMiddle(value: string, max = 64): string {
  if (value.length <= max) return value;
  const half = Math.floor(max / 2);
  return `${value.slice(0, half)}…${value.slice(value.length - half)}`;
}

function maskToken(token: string): string {
  return token.length > 8
    ? `${token.slice(0, 4)}${"•".repeat(16)}`
    : "•".repeat(16);
}

export function AiBotMonitorView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  // Evaluated lazily: "" during SSR, the real origin on every client render.
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const dashboardQuery = useQuery({
    queryKey: ["ai-bots", projectId, "dashboard"],
    queryFn: async () => {
      try {
        return await getAiBotDashboard({ data: { projectId } });
      } catch (error) {
        fail(error, "Failed to load AI bot dashboard");
        throw error;
      }
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["ai-bots", projectId] });
  };

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectAiBotSite({ data: { projectId } }),
    onSuccess: () => {
      toast.success("Site disconnected.");
      invalidate();
    },
    onError: (error) => fail(error, "Failed to disconnect site"),
  });

  if (dashboardQuery.isPending) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="alert alert-error">
        <span>
          {getStandardErrorMessage(
            dashboardQuery.error,
            "Failed to load AI bot dashboard",
          )}
        </span>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const site = dashboard.site;
  const windowLabel = `${dashboard.windowDays}d`;

  if (!site)
    return <ConnectCard projectId={projectId} onConnected={invalidate} />;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg border border-base-300 bg-base-300/70 overflow-hidden">
        <StatCell
          label={`AI Hits (${windowLabel})`}
          value={fmt(dashboard.aiHits)}
        />
        <StatCell
          label={`Search Hits (${windowLabel})`}
          value={fmt(dashboard.searchHits)}
        />
        <StatCell
          label="AI:Search Ratio"
          value={`${dashboard.searchHits > 0 ? Math.round((dashboard.aiHits / dashboard.searchHits) * 100) : 0}%`}
        />
        <StatCell label="Last AI Hit" value={relativeTime(site.lastHitAt)} />
      </div>

      <IngestCard
        projectId={projectId}
        site={site}
        origin={origin}
        onInvalidated={invalidate}
      />

      <TrendCard series={dashboard.series} windowDays={dashboard.windowDays} />

      <BotBreakdownCard perBot={dashboard.perBot} />

      <TopPagesCard topUrls={dashboard.topUrls} />

      <RobotsCard
        projectId={projectId}
        compliance={site.robotsCompliance}
        onInvalidated={invalidate}
      />

      <StalePagesCard
        stalePages={dashboard.stalePages}
        windowDays={dashboard.windowDays}
      />

      <div className="flex justify-end">
        <button
          type="button"
          className={`btn btn-ghost btn-sm gap-2 text-error ${disconnectMutation.isPending ? "loading" : ""}`}
          onClick={() => {
            if (
              window.confirm(
                "Disconnect this site? The ingest token stops working immediately.",
              )
            ) {
              disconnectMutation.mutate();
            }
          }}
          disabled={disconnectMutation.isPending}
        >
          Disconnect site
        </button>
      </div>
    </div>
  );
}

function ConnectCard({
  projectId,
  onConnected,
}: {
  projectId: string;
  onConnected: () => void;
}) {
  const [domain, setDomain] = useState("");

  const mutation = useMutation({
    mutationFn: (input: string) =>
      connectAiBotSite({ data: { projectId, domain: input } }),
    onSuccess: () => {
      toast.success(
        "Site connected. Grab the ingest token and snippet to start tracking.",
      );
      onConnected();
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Failed to connect site")),
  });

  return (
    <div className="card mx-auto max-w-xl bg-base-100 border border-base-300">
      <div className="card-body gap-4">
        <div>
          <h3 className="font-medium">Connect your site</h3>
          <p className="mt-1 text-sm text-base-content/60">
            Enter your site domain to get an ingest token, then add the beacon
            snippet to your server or upload access logs to start tracking AI
            bot crawls.
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (domain.trim()) mutation.mutate(domain.trim());
          }}
        >
          <input
            type="text"
            className="input input-bordered input-sm flex-1 bg-base-100"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <button
            type="submit"
            className={`btn btn-primary btn-sm gap-2 ${mutation.isPending ? "loading" : ""}`}
            disabled={!domain.trim() || mutation.isPending}
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}

function IngestCard({
  projectId,
  site,
  origin,
  onInvalidated,
}: {
  projectId: string;
  site: NonNullable<AiBotDashboard["site"]>;
  origin: string;
  onInvalidated: () => void;
}) {
  const [showToken, setShowToken] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endpoint = `${origin}${INGEST_PATH}`;
  const snippet = buildNodeSnippet(origin, site.ingestToken);

  const rotateMutation = useMutation({
    mutationFn: () => rotateAiBotToken({ data: { projectId } }),
    onSuccess: () => {
      toast.success("Ingest token rotated. Update the snippet on your server.");
      onInvalidated();
    },
    onError: (error) => fail(error, "Failed to rotate token"),
  });

  const importMutation = useMutation({
    mutationFn: (content: string) =>
      importAiBotAccessLog({
        data: { projectId, domain: site.domain, content },
      }),
    onSuccess: ({ accepted, skipped, truncated }) => {
      toast.success(
        `Imported ${fmt(accepted)} hits, skipped ${fmt(skipped)} lines${truncated ? " (log truncated)" : ""}.`,
      );
      onInvalidated();
    },
    onError: (error) => fail(error, "Failed to import access log"),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_LOG_FILE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum ${MAX_LOG_FILE_MB}MB.`);
      return;
    }
    importMutation.mutate(await file.text());
  };

  return (
    <div className="collapse collapse-arrow bg-base-100 border border-base-300">
      <input type="checkbox" defaultChecked />
      <div className="collapse-title font-medium">Ingest Setup</div>
      <div className="collapse-content space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-base-content/60">
            POST AI-bot hits to this endpoint with the token as a Bearer
            credential:
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 rounded-md bg-base-200 px-3 py-2 text-xs break-all">
              {endpoint || INGEST_PATH}
            </code>
            <CopyButton value={endpoint} />
          </div>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 rounded-md bg-base-200 px-3 py-2 text-xs break-all">
              {showToken ? site.ingestToken : maskToken(site.ingestToken)}
            </code>
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => setShowToken((v) => !v)}
            >
              {showToken ? "Hide" : "Reveal"}
            </button>
            <CopyButton value={site.ingestToken} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm btn-outline gap-2 ${rotateMutation.isPending ? "loading" : ""}`}
            onClick={() => {
              if (
                window.confirm(
                  "Rotate the ingest token? The old token stops working immediately.",
                )
              ) {
                rotateMutation.mutate();
              }
            }}
            disabled={rotateMutation.isPending}
          >
            Rotate token
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-outline gap-2 ${importMutation.isPending ? "loading" : ""}`}
            onClick={() => fileRef.current?.click()}
            disabled={importMutation.isPending}
          >
            Upload access log
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".log,.txt"
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />
          <span className="text-xs text-base-content/50">
            Apache Combined or Nginx format (max {MAX_LOG_FILE_MB}MB)
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-base-content/60">
              Node.js/Express beacon — logs every AI-bot request to SeoTool.im:
            </p>
            <CopyButton value={snippet} />
          </div>
          <pre className="overflow-x-auto rounded-md bg-base-200 p-3 text-xs">
            <code>{snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const NODE_SNIPPET_AI_BOTS =
  '"GPTBot","OAI-SearchBot","ChatGPT-User","ClaudeBot","Claude-User","Claude-SearchBot","PerplexityBot","Perplexity-User","Google-Extended","Applebot-Extended","Bytespider","meta-externalagent","Googlebot"';

function buildNodeSnippet(origin: string, token: string): string {
  return `// Node.js/Express middleware — logs every AI-bot request to SeoTool.im
const SEOTOOL_INGEST_URL = "${origin}${INGEST_PATH}";
const SEOTOOL_INGEST_TOKEN = "${token}";
const AI_BOTS = [${NODE_SNIPPET_AI_BOTS}];
let buffer = [];
export function aiBotMonitor(req, res, next) {
  const ua = req.headers["user-agent"] || "";
  if (AI_BOTS.some(b => ua.includes(b))) {
    buffer.push({ url: req.originalUrl, userAgent: ua, statusCode: res.statusCode, at: new Date().toISOString(), ip: req.ip });
    if (buffer.length >= 10) {
      const hits = buffer.splice(0);
      fetch(SEOTOOL_INGEST_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + SEOTOOL_INGEST_TOKEN }, body: JSON.stringify({ hits }) }).catch(() => {});
    }
  }
  next();
}`;
}

function TrendCard({
  series,
  windowDays,
}: {
  series: AiBotDashboard["series"];
  windowDays: number;
}) {
  const data = buildDailyTotals(series, windowDays);
  const hasData = data.some((d) => d.ai > 0 || d.search > 0);
  const max = Math.max(1, ...data.map((d) => Math.max(d.ai, d.search)));

  return (
    <CardShell
      title="Daily Hits"
      action={
        <div className="flex items-center gap-4 text-xs text-base-content/60">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary" /> AI bots
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-base-content/40" /> Search
            engines
          </span>
        </div>
      }
    >
      {hasData ? (
        <div className="px-4 pb-3 pt-2">
          {/* Simple grouped-bar chart: 100 units tall plot area, each day gets a 10-unit column with two 4-unit bars. */}
          <svg
            viewBox="0 0 300 110"
            className="h-56 w-full"
            preserveAspectRatio="none"
          >
            {data.map((d, i) => (
              <g key={d.day} transform={`translate(${i * 10}, 0)`}>
                <title>{`${formatDayLabel(d.day)} — AI: ${fmt(d.ai)}, Search: ${fmt(d.search)}`}</title>
                <rect
                  x={1}
                  y={108 - (d.ai / max) * 104}
                  width={4}
                  height={(d.ai / max) * 104}
                  className="fill-primary"
                  rx={1}
                />
                <rect
                  x={5}
                  y={108 - (d.search / max) * 104}
                  width={4}
                  height={(d.search / max) * 104}
                  className="fill-base-content/40"
                  rx={1}
                />
              </g>
            ))}
          </svg>
          <div className="flex justify-between text-[10px] text-base-content/50">
            <span>{formatDayLabel(data[0].day)}</span>
            <span>{formatDayLabel(data[data.length - 1].day)}</span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-base-content/50">
          No hits recorded in the last {windowDays} days yet.
        </div>
      )}
    </CardShell>
  );
}

/** Roll the per-bot series up into per-day {ai, search} totals, filling every
 *  day of the window so gaps render as zero-height bars. */
function buildDailyTotals(
  series: AiBotDashboard["series"],
  windowDays: number,
): Array<{ day: string; ai: number; search: number }> {
  const perDay = new Map<string, { ai: number; search: number }>();
  for (const point of series) {
    const entry = perDay.get(point.day) ?? { ai: 0, search: 0 };
    if (isSearchBaselineBot(point.bot)) {
      entry.search += point.hits;
    } else {
      entry.ai += point.hits;
    }
    perDay.set(point.day, entry);
  }

  const days: Array<{ day: string; ai: number; search: number }> = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const day = date.toISOString().slice(0, 10);
    const entry = perDay.get(day) ?? { ai: 0, search: 0 };
    days.push({ day, ai: entry.ai, search: entry.search });
  }
  return days;
}

function formatDayLabel(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function BotBreakdownCard({ perBot }: { perBot: AiBotDashboard["perBot"] }) {
  return (
    <TableCard
      title="Bot Breakdown"
      emptyMessage="No AI bot or search engine hits recorded yet."
      isEmpty={perBot.length === 0}
      header={
        <>
          <th>Bot</th>
          <th>Operator</th>
          <th>Category</th>
          <th>Hits</th>
          <th>Unique URLs</th>
        </>
      }
      rows={perBot.map((bot) => (
        <tr key={bot.key} className="hover">
          <td className="font-medium">{bot.label}</td>
          <td>{bot.operator}</td>
          <td>
            <BadgeForCategory category={bot.category} />
          </td>
          <td>{fmt(bot.hits)}</td>
          <td>{fmt(bot.uniqueUrls)}</td>
        </tr>
      ))}
    />
  );
}

function TopPagesCard({ topUrls }: { topUrls: AiBotDashboard["topUrls"] }) {
  return (
    <TableCard
      title="Top Crawled Pages"
      emptyMessage="No pages crawled yet."
      isEmpty={topUrls.length === 0}
      header={
        <>
          <th>URL</th>
          <th>Hits</th>
          <th>Last Seen</th>
        </>
      }
      rows={topUrls.map((page) => (
        <tr key={page.url} className="hover">
          <td className="text-xs break-all max-w-md" title={page.url}>
            {truncateMiddle(page.url)}
          </td>
          <td>{fmt(page.hits)}</td>
          <td className="text-xs text-base-content/60">
            {relativeTime(page.lastSeenAt)}
          </td>
        </tr>
      ))}
    />
  );
}

function RobotsCard({
  projectId,
  compliance,
  onInvalidated,
}: {
  projectId: string;
  compliance: RobotsCompliance | null;
  onInvalidated: () => void;
}) {
  const checkMutation = useMutation({
    mutationFn: () => runAiBotRobotsCheck({ data: { projectId } }),
    onSuccess: () => {
      toast.success("robots.txt re-checked.");
      onInvalidated();
    },
    onError: (error) => fail(error, "Failed to check robots.txt"),
  });

  return (
    <CardShell
      title="robots.txt Compliance"
      subtitle={
        compliance
          ? `Checked ${relativeTime(compliance.checkedAt)}`
          : "Not checked yet"
      }
      action={
        <button
          type="button"
          className={`btn btn-sm btn-outline gap-2 ${checkMutation.isPending ? "loading" : ""}`}
          onClick={() => checkMutation.mutate()}
          disabled={checkMutation.isPending}
        >
          Re-check robots.txt
        </button>
      }
    >
      <div className="space-y-2 px-4 py-3">
        {compliance?.fetchError ? (
          <p className="text-sm text-error">
            Fetch error: {compliance.fetchError}
          </p>
        ) : null}
        {compliance && compliance.groups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {compliance.groups.map((group) => (
              <div
                key={group.bot}
                className="flex items-center gap-2 rounded-md border border-base-300 px-2 py-1"
              >
                <code className="text-xs">{group.uaToken}</code>
                <span
                  className={`badge badge-sm ${DIRECTIVES[group.directive].badge}`}
                >
                  {DIRECTIVES[group.directive].label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/60">
            Run a check to see which AI bots your robots.txt allows or blocks.
          </p>
        )}
      </div>
    </CardShell>
  );
}

function StalePagesCard({
  stalePages,
  windowDays,
}: {
  stalePages: string[];
  windowDays: number;
}) {
  return (
    <CardShell
      title="Stale Pages"
      subtitle={`Pages not crawled by AI bots in the last ${windowDays} days`}
    >
      {stalePages.length > 0 ? (
        <div className="px-4 py-3">
          <ul className="space-y-1">
            {stalePages.slice(0, 20).map((url) => (
              <li key={url} className="text-xs break-all" title={url}>
                {truncateMiddle(url, 80)}
              </li>
            ))}
          </ul>
          {stalePages.length > 20 ? (
            <p className="mt-2 text-xs text-base-content/50">
              And {stalePages.length - 20} more.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-base-content/60">
          All audited pages have been crawled by AI bots.
        </div>
      )}
    </CardShell>
  );
}

function CardShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-base-300">
          <div>
            <h3 className="font-medium">{title}</h3>
            {subtitle ? (
              <p className="text-xs text-base-content/50">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}

function TableCard({
  title,
  emptyMessage,
  isEmpty,
  header,
  rows,
}: {
  title: string;
  emptyMessage: string;
  isEmpty: boolean;
  header: React.ReactNode;
  rows: React.ReactNode;
}) {
  return (
    <CardShell title={title}>
      {isEmpty ? (
        <div className="px-4 py-6 text-center text-sm text-base-content/50">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>{header}</tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}

function BadgeForCategory({ category }: { category: AiBotCategory }) {
  const badgeClass = {
    ai_search: "badge-primary",
    ai_assistant: "badge-secondary",
    ai_training: "badge-warning",
    search: "badge-ghost",
  }[category];

  return (
    <span className={`badge badge-sm ${badgeClass}`}>
      {AI_BOT_CATEGORY_LABELS[category]}
    </span>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-base-100 p-4">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast.error("Clipboard not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="btn btn-xs btn-ghost gap-1"
    >
      {copied ? (
        <Check className="size-3 text-success" />
      ) : (
        <Copy className="size-3" />
      )}
      {label}
    </button>
  );
}
