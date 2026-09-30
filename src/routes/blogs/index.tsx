import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { listPublishedPosts } from "@/serverFunctions/cms-public";
import { getPostMetadata } from "@/client/features/blog/blogMetadata";
import { BlogSidebar } from "@/client/features/blog/BlogSidebar";
import { Clock, ChevronRight } from "lucide-react";

interface PostItem {
  slug: string;
  title: string;
  description: string | null;
  publishedAt: string | null;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export const Route = createFileRoute("/blogs/")({
  loader: async () => {
    const response = await listPublishedPosts({ data: undefined });
    const posts = response as PostItem[];
    return { posts };
  },
  head: () => ({
    links: [{ rel: "canonical", href: "https://seotool.im/blogs" }],
    meta: [
      { title: "SEO Blog & Search Marketing Journal - SeoTool.im" },
      {
        name: "description",
        content:
          "Authoritative SEO teardowns, technical search playbooks, and algorithmic intelligence for founders, SEOs, and growth teams.",
      },
      {
        property: "og:title",
        content: "SEO Blog & Search Marketing Journal - SeoTool.im",
      },
      {
        property: "og:description",
        content:
          "Authoritative SEO teardowns, technical search playbooks, and algorithmic intelligence.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://seotool.im/blogs" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndexPage,
});

const CATEGORY_TABS = [
  "All Stories",
  "Google & Search",
  "Open Source SEO",
  "Startup SEO",
];

function BlogIndexPage() {
  const { signedIn } = useMarketingSession();
  const { posts }: { posts: PostItem[] } = Route.useLoaderData();
  const [selectedCategory, setSelectedCategory] = useState("All Stories");

  // Hero post is the newest / premier post (e.g. dark-queries if present, else first)
  const heroPost =
    posts.find((p) => p.slug === "dark-queries") ?? posts[0] ?? null;
  const secondaryPosts = posts.filter((p) => p.slug !== heroPost?.slug);

  const filteredSecondary =
    selectedCategory === "All Stories"
      ? secondaryPosts
      : secondaryPosts.filter((p) => {
          const meta = getPostMetadata(p.slug, p.title);
          return (
            meta.category
              .toLowerCase()
              .includes(selectedCategory.toLowerCase()) ||
            selectedCategory.toLowerCase().includes(meta.category.toLowerCase())
          );
        });

  return (
    <MarketingChrome signedIn={signedIn}>
      {/* Editorial Header Banner */}
      <section className="border-b border-base-300/80 bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              The Search Intelligence Journal
            </span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-base-content sm:text-5xl lg:text-6xl">
              SEO, shipped.
            </h1>
            <p className="mt-4 text-base font-normal leading-relaxed text-base-content/75 sm:text-lg">
              Authoritative teardowns, search console reverse-engineering, open
              source tools, and repeatable organic growth playbooks from the
              SeoTool.im team.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORY_TABS.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all ${
                    active
                      ? "bg-primary text-primary-content shadow-sm"
                      : "border border-base-300 bg-base-100 text-base-content/70 hover:border-primary/40 hover:text-base-content"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Magazine Layout */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          {/* Main Content Column */}
          <div className="min-w-0 flex-1 space-y-12">
            {/* Featured Hero Story */}
            {heroPost && selectedCategory === "All Stories" ? (
              <FeaturedHeroCard post={heroPost} />
            ) : null}

            {/* Stories Grid */}
            <div>
              <div className="flex items-center justify-between border-b border-base-300/80 pb-4">
                <h2 className="text-xl font-extrabold tracking-tight text-base-content sm:text-2xl">
                  {selectedCategory === "All Stories"
                    ? "Latest Articles"
                    : selectedCategory}
                </h2>
                <span className="text-xs font-medium text-base-content/50">
                  {filteredSecondary.length}{" "}
                  {filteredSecondary.length === 1 ? "article" : "articles"}
                </span>
              </div>

              {filteredSecondary.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-base-300 p-12 text-center text-sm text-base-content/60">
                  No articles found under this category. Check back soon.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {filteredSecondary.map((post) => (
                    <StandardPostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Newsletter & Free Audit Widget */}
          <BlogSidebar />
        </div>
      </div>
    </MarketingChrome>
  );
}

function FeaturedHeroCard({ post }: { post: PostItem }) {
  const meta = getPostMetadata(post.slug, post.title);
  const featuredImage = post.featuredImage || meta.heroImage;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
      {featuredImage ? (
        <div className="overflow-hidden border-b border-base-300/80 bg-base-200/50 max-h-80 flex items-center justify-center">
          <img
            src={featuredImage}
            alt={post.title}
            className="w-full max-h-80 object-cover"
          />
        </div>
      ) : null}
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Featured • {meta.category}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl lg:text-4xl lg:leading-tight">
          <Link
            to="/blogs/$slug"
            params={{ slug: post.slug }}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>

        {post.description ? (
          <p className="mt-4 text-base font-normal leading-relaxed text-base-content/75 sm:text-lg">
            {post.description}
          </p>
        ) : null}

        {/* Byline & Read CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-base-200 pt-6">
          <div className="flex items-center gap-3">
            {meta.author.avatarUrl ? (
              <img
                src={meta.author.avatarUrl}
                alt={meta.author.name}
                className="size-10 rounded-full border border-base-300 object-cover"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                {meta.author.initials}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-base-content">
                {meta.author.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-base-content/50">
                {formattedDate ? <span>{formattedDate}</span> : null}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />4 min read
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/blogs/$slug"
            params={{ slug: post.slug }}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Read full story</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function StandardPostCard({ post }: { post: PostItem }) {
  const meta = getPostMetadata(post.slug, post.title);
  const cardImage = post.featuredImage || meta.heroImage;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {cardImage ? (
        <div className="mb-4 -mx-6 -mt-6 overflow-hidden border-b border-base-200 bg-base-200/40">
          <img
            src={cardImage}
            alt={post.title}
            className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : null}
      <div>
        <span className="inline-block rounded-full bg-base-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
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
}
