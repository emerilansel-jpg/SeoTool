import { Link } from "@tanstack/react-router";
import { getPostMetadata } from "./blogMetadata";

export interface RelatedPostItem {
  slug: string;
  title: string;
  description: string | null;
  publishedAt: string | null;
}

interface Props {
  posts: RelatedPostItem[];
}

export function BlogRelatedPosts({ posts }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="border-t border-base-300 bg-base-200/40 py-16">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl">
          Related Articles
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const meta = getPostMetadata(post.slug, post.title);
            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null;

            return (
              <article
                key={post.slug}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                    {meta.category}
                  </span>

                  <h3 className="mt-3 text-lg font-bold leading-snug text-base-content">
                    <Link
                      to="/blogs/$slug"
                      params={{ slug: post.slug }}
                      className="transition-colors hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {post.description ? (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-base-content/70">
                      {post.description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-base-200 pt-4 text-xs text-base-content/60">
                  <span className="font-semibold text-base-content/80">
                    {meta.author.name}
                  </span>
                  {formattedDate ? <span>{formattedDate}</span> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
