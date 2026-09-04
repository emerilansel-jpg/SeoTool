import { createFileRoute } from "@tanstack/react-router";
import { Markdown } from "@/client/components/Markdown";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";

export type ChangelogItem = {
  version: string;
  raw: string;
};

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

      logs.push({ version, raw: content });
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
                <div className="prose prose-neutral max-w-none text-base-content/80 prose-headings:text-base-content prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                  <Markdown>{log.raw}</Markdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MarketingChrome>
  );
}
