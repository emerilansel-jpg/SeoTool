import { createFileRoute } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";

export type ChangelogItem = {
  version: string;
  html: string;
};

/**
 * Minimal markdown-to-HTML for release notes. Avoids importing the heavy
 * react-markdown + remark-gfm bundle on every changelog page load.
 */
function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-base-200 px-1 py-0.5 text-xs font-mono">$1</code>',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="link link-primary">$1</a>',
    )
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      return `<ul class="my-2 ml-5 list-disc space-y-1">${match}</ul>`;
    })
    .replace(
      /^(?!<[hulo]|<\/|$)(.+)$/gm,
      '<p class="my-2 leading-relaxed">$1</p>',
    )
    .replace(/\n{2,}/g, "\n");
}

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog - SeoTool.im" },
      {
        name: "description",
        content: "Latest updates, improvements, and fixes for SeoTool.im.",
      },
    ],
  }),
  loader: async (): Promise<{ logs: ChangelogItem[] }> => {
    // Statically import release notes at build time
    const files: Record<string, string> = import.meta.glob(
      "../../release-notes/*.md",
      {
        query: "raw",
        import: "default",
        eager: true,
      },
    );

    const logs: ChangelogItem[] = [];

    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.includes("README.md")) continue;

      const fileName = filePath.split("/").pop() ?? "";
      const version = fileName.replace(".md", "");

      logs.push({ version, html: mdToHtml(content) });
    }

    logs.sort((a, b) => {
      const aParts = a.version.replace("v", "").split(".").map(Number);
      const bParts = b.version.replace("v", "").split(".").map(Number);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] ?? 0;
        const bVal = bParts[i] ?? 0;
        if (aVal !== bVal) return bVal - aVal;
      }
      return 0;
    });

    return { logs };
  },
  component: ChangelogPage,
});

function ChangelogPage() {
  const { signedIn } = useMarketingSession();
  const { logs } = Route.useLoaderData();

  return (
    <MarketingChrome signedIn={signedIn}>
      <div className="mx-auto w-full max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Updates
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Changelog
          </h1>
          <p className="mt-4 text-base text-base-content/70">
            New updates, improvements, and fixes to SeoTool.im.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="mt-12 border border-dashed border-base-300 rounded-lg p-8 text-center text-sm text-base-content/50">
            No release notes found.
          </div>
        ) : (
          <div className="mt-16 space-y-12">
            {logs.map((log) => (
              <div
                key={log.version}
                className="rounded-xl border border-base-300 bg-base-100 p-6 md:p-8 transition-all hover:border-primary/30"
              >
                <div className="flex items-center justify-between border-b border-base-200 pb-4 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                    {log.version}
                  </span>
                </div>
                <div
                  className="changelog-content text-base-content/80 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:leading-relaxed [&_p]:my-2 [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: log.html }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </MarketingChrome>
  );
}
