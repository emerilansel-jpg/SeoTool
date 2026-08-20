import { Clock, History, X } from "lucide-react";
import { Globe } from "lucide-react";
import type { DomainHistoryItem } from "@/client/features/domain/types";

type Props = {
  history: DomainHistoryItem[];
  historyLoaded: boolean;
  onRemoveHistoryItem: (timestamp: number) => void;
  onSelectHistoryItem: (item: DomainHistoryItem) => void;
};

export function DomainHistorySection({
  history,
  historyLoaded,
  onRemoveHistoryItem,
  onSelectHistoryItem,
}: Props) {
  if (!historyLoaded) {
    return null;
  }

  if (history.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60 space-y-5">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
          <Globe className="size-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <p className="text-lg font-bold text-base-content">
            Enter a domain to get started
          </p>
          <p className="text-sm text-base-content/70 leading-relaxed">
            Analyze any competitor or target domain to inspect organic search
            traffic, top ranking keywords, and high-performing pages.
          </p>
        </div>

        <div className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">
            Popular domains to inspect
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
            {[
              "github.com",
              "stripe.com",
              "vercel.com",
              "notion.so",
              "linear.app",
            ].map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() =>
                  onSelectHistoryItem({
                    domain: dom,
                    subdomains: true,
                    sort: "traffic",
                    tab: "keywords",
                    timestamp: Date.now(),
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-200/60 px-3.5 py-1.5 text-xs font-medium text-base-content/80 transition-all duration-150 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
              >
                <Globe className="size-3 text-primary/70" />
                {dom}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-base-content/45" />
          <span className="text-sm text-base-content/60">
            {history.length} recent search{history.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {history.map((item) => (
          <div
            key={item.timestamp}
            className="group flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-2"
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-base-200"
              onClick={() => onSelectHistoryItem(item)}
            >
              <Clock className="size-4 text-base-content/40 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-base-content truncate">
                  {item.domain}
                </p>
                <p className="text-sm text-base-content/60 truncate">
                  {item.subdomains ? "Include subdomains" : "Root domain only"}
                </p>
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-base-content/40">
                {new Date(item.timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 p-1"
                onClick={() => onRemoveHistoryItem(item.timestamp)}
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
