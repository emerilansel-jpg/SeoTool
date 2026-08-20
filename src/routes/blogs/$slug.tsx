import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { Markdown } from "@/client/components/Markdown";
import { CmsRepository } from "@/server/features/admin/repositories/CmsRepository";

export const Route = createFileRoute("/blogs/$slug")({
  // Public read path: loader + repository, no auth middleware involved.
  loader: async ({ params }) => {
    const post = await CmsRepository.getPublishedPostBySlug(params.slug);
    if (!post) throw notFound();
    return {
      post: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        contentMd: post.contentMd,
        publishedAt: post.publishedAt,
      },
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.post.title} - SeoTool.im Blog`
          : "Blog - SeoTool.im",
      },
      ...(loaderData?.post.description
        ? [{ name: "description", content: loaderData.post.description }]
        : []),
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { signedIn } = useMarketingSession();
  const { post } = Route.useLoaderData();

  return (
    <MarketingChrome signedIn={signedIn}>
      <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <header className="border-b border-base-300 pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {post.title}
          </h1>
          {post.publishedAt ? (
            <p className="mt-3 text-sm text-base-content/50">
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          ) : null}
        </header>
        <div className="mt-8">
          <Markdown>{post.contentMd}</Markdown>
        </div>
      </article>
    </MarketingChrome>
  );
}
