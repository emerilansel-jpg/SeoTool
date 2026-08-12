import { createFileRoute } from "@tanstack/react-router";
import { getChangelogs, type ChangelogEntry } from "@/lib/changelog.functions";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/_marketing/changelog")({
  head: () =>
    buildPageSeo({
      title: "Changelog",
      description: "Latest updates, improvements, and fixes for SeoTool.im.",
      path: "/changelog",
    }),
  component: ChangelogPage,
  loader: async () => await getChangelogs(),
});

function ChangelogPage() {
  const logs = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-4xl pt-12 pb-24 md:pt-20">
      <div className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
          Changelog
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          New updates and improvements to SeoTool.im.
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="text-neutral-500">No release notes found.</p>
      ) : (
        <div className="space-y-16">
          {logs.map((log: ChangelogEntry) => (
            <div key={log.version} className="relative pl-4 md:pl-0">
              <div className="md:grid md:grid-cols-[1fr_3fr] md:gap-8">
                <div className="mb-4 md:mb-0">
                  <h2 className="sticky top-24 text-xl font-bold text-neutral-950">
                    {log.version}
                  </h2>
                </div>
                <div className="prose prose-neutral max-w-none prose-a:text-[var(--color-brand-accent)] prose-a:no-underline hover:prose-a:underline prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
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
