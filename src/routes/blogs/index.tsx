import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { listPublishedPosts } from "@/serverFunctions/cms-public";

export const Route = createFileRoute("/blogs/")({
  // Public read path via server fn (keeps cloudflare:workers out of the
  // client bundle).
  loader: async () => {
    // Explicit type cast to work around TanStack Start's generic inference
    // dropping the return type when no validator is used.
    const response = await listPublishedPosts({ data: undefined });
    const posts = response as Array<{
      slug: string;
      title: string;
      description: string | null;
      publishedAt: string | null;
    }>;
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "Blog - SeoTool.im" },
      {
        name: "description",
        content:
          "SEO guides, product updates, and technical write-ups from the SeoTool.im team.",
      },
    ],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { signedIn } = useMarketingSession();
  const { posts } = Route.useLoaderData();

  return (
    <MarketingChrome signedIn={signedIn}>
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Blog
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            SEO, shipped
          </h1>
          <p className="mt-4 text-base text-base-content/70">
            Guides and notes from building SeoTool.im.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {posts.length === 0 ? (
            <div className="border border-dashed border-base-300 rounded-lg p-8 text-center text-sm text-base-content/50">
              No posts published yet. Check back soon.
            </div>
          ) : (
            posts.map(
              (post: {
                slug: string;
                title: string;
                description: string | null;
                publishedAt: string | null;
              }) => (
                <Link
                  key={post.slug}
                to="/blogs/$slug"
                params={{ slug: post.slug }}
                className="block rounded-xl border border-base-300 bg-base-100 p-5 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-base-content">
                  {post.title}
                </h2>
                {post.description ? (
                  <p className="mt-1.5 text-sm text-base-content/70">
                    {post.description}
                  </p>
                ) : null}
                {post.publishedAt ? (
                  <p className="mt-3 text-xs text-base-content/50">
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                ) : null}
              </Link>
            ))
          )}
        </div>
      </div>
    </MarketingChrome>
  );
}
