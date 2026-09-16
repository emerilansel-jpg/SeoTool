import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogLayout } from "@/components/blog-layout";
import { SiteFooter } from "@/components/site-footer";
import { getBlogPosts } from "@/lib/content.functions";
import { buildPageSeo } from "@/lib/seo";

const blogIndexDescription = "SEO articles and guides from SeoTool.im.";

export const Route = createFileRoute("/blogs/")({
  head: () =>
    buildPageSeo({
      title: "SeoTool.im Blog",
      description: blogIndexDescription,
      path: "/blogs",
    }),
  component: BlogIndex,
  loader: async () => await getBlogPosts(),
});

function BlogIndex() {
  const posts = Route.useLoaderData();

  return (
    <BlogLayout>
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-20 text-[var(--color-brand)]">
        <p className="text-sm font-semibold tracking-wide text-[var(--color-brand-accent)]">
          Resources
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--color-brand)] md:text-6xl">
          Blog
        </h1>

        {posts.length === 0 ? (
          <p className="mt-8 text-[var(--color-brand-muted)]">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.url}>
                <Link
                  to="/blogs/$"
                  params={{ _splat: post.slugs.join("/") }}
                  className="group block h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-7 transition-all hover:border-[var(--color-brand-accent)]/50"
                >
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand)] transition-colors group-hover:text-[var(--color-brand-accent)]">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-brand-muted)]">
                      {post.description}
                    </p>
                  )}
                  <p className="mt-6 text-sm font-semibold text-[var(--color-brand-accent)]">
                    Read post <span aria-hidden="true">&rarr;</span>
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-16 border-t border-[var(--color-border-subtle)] pt-8">
          <SiteFooter className="text-xs text-[var(--color-brand-muted)] [&_a]:transition-colors [&_a]:hover:text-white" />
        </div>
      </div>
    </BlogLayout>
  );
}
