import { createFileRoute } from "@tanstack/react-router";
import { getChangelogs, type ChangelogEntry } from "@/lib/changelog.functions";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/_marketing/changelog")({
  head: () =>
    buildPageSeo({
      title: "Changelog",
      description: "New updates and improvements to SeoTool.im.",
      path: "/changelog",
      titleSuffix: "SeoTool.im",
    }),
  loader: async () => await getChangelogs(),
  component: ChangelogPage,
});

function ChangelogPage() {
  const logs = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 pb-24 text-[var(--color-brand)] md:px-6 md:pt-20">
      <div className="mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-brand)] sm:text-5xl">
          Changelog
        </h1>
        <p className="mt-4 text-lg text-[var(--color-brand-muted)]">
          New updates and improvements to SeoTool.im.
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="text-[var(--color-brand-muted)]">No release notes found.</p>
      ) : (
        <div className="space-y-16">
          {logs.map((log: ChangelogEntry) => (
            <div key={log.version} className="relative pl-4 md:pl-0">
              <div className="md:grid md:grid-cols-[1fr_3fr] md:gap-8">
                <div className="mb-4 md:mb-0">
                  <span className="sticky top-24 inline-flex items-center px-3.5 py-1 rounded-full text-sm font-bold bg-primary/15 text-primary border border-primary/20">
                    {log.version}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none text-[var(--color-brand-muted)] prose-a:text-[var(--color-brand-accent)] prose-a:no-underline hover:prose-a:underline prose-headings:font-bold prose-headings:text-[var(--color-brand)] prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                  <div dangerouslySetInnerHTML={{ __html: log.html }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
