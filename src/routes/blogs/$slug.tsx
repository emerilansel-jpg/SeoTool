import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import {
  getPublishedPost,
  listPublishedPosts,
} from "@/serverFunctions/cms-public";
import {
  getPostMetadata,
  calculateReadTime,
  extractHeadings,
} from "@/client/features/blog/blogMetadata";
import { BlogHeroHeader } from "@/client/features/blog/BlogHeroHeader";
import { BlogSocialRail } from "@/client/features/blog/BlogSocialRail";
import { BlogSidebar } from "@/client/features/blog/BlogSidebar";
import { EditorialMarkdown } from "@/client/features/blog/EditorialMarkdown";
import { BlogTopicsList } from "@/client/features/blog/BlogTopicsList";
import { BlogAuthorBio } from "@/client/features/blog/BlogAuthorBio";
import {
  BlogRelatedPosts,
  type RelatedPostItem,
} from "@/client/features/blog/BlogRelatedPosts";

const schemaObject = z.record(z.string(), z.unknown());

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { slug: params.slug } });
    if (!post) throw notFound();

    const allPostsRaw = await listPublishedPosts({ data: undefined });
    const allPosts = allPostsRaw as RelatedPostItem[];
    const relatedPosts = allPosts
      .filter((p) => p.slug !== post.slug)
      .slice(0, 3);

    const readTimeMinutes = calculateReadTime(post.contentMd);
    const headings = extractHeadings(post.contentMd);

    return {
      post: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        contentMd: post.contentMd,
        publishedAt: post.publishedAt,
        featuredImage: post.featuredImage,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        schemaJson: post.schemaJson,
      },
      relatedPosts,
      readTimeMinutes,
      headings,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Blog - SeoTool.im" }] };
    }

    const { post, readTimeMinutes } = loaderData;
    const meta = getPostMetadata(post.slug, post.title);
    const canonicalUrl = `https://seotool.im/blogs/${post.slug}`;

    const effectiveTitle = post.metaTitle?.trim()
      ? `${post.metaTitle.replaceAll("''", "'")} - SeoTool.im Blog`
      : `${post.title.replaceAll("''", "'")} - SeoTool.im Blog`;
    const rawDescription = post.metaDescription?.trim() || post.description;
    const effectiveDescription = rawDescription
      ? rawDescription.replaceAll("''", "'")
      : null;
    const effectiveImage =
      post.featuredImage?.trim() ||
      meta.heroImage ||
      "https://seotool.im/logo.png";

    let customSchema: Record<string, unknown> | null = null;
    if (post.schemaJson?.trim()) {
      try {
        const parsed = schemaObject.safeParse(JSON.parse(post.schemaJson));
        customSchema = parsed.success ? parsed.data : null;
      } catch {
        customSchema = null;
      }
    }

    const defaultSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.metaTitle?.trim() || post.title,
      description: effectiveDescription,
      image: effectiveImage,
      datePublished: post.publishedAt,
      author: {
        "@type": "Person",
        name: meta.author.name,
        jobTitle: meta.author.role,
      },
      publisher: {
        "@type": "Organization",
        name: "SeoTool.im",
        url: "https://seotool.im",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    };

    const finalSchema = customSchema ?? defaultSchema;

    return {
      links: [{ rel: "canonical", href: canonicalUrl }],
      meta: [
        { title: effectiveTitle },
        ...(effectiveDescription
          ? [
              { name: "description", content: effectiveDescription },
              { property: "og:description", content: effectiveDescription },
              { name: "twitter:description", content: effectiveDescription },
            ]
          : []),
        { property: "og:title", content: post.metaTitle || post.title },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: effectiveImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.metaTitle || post.title },
        { name: "twitter:image", content: effectiveImage },
        ...(post.publishedAt
          ? [{ property: "article:published_time", content: post.publishedAt }]
          : []),
        { property: "article:author", content: meta.author.name },
        { property: "article:section", content: meta.category },
        { name: "twitter:label1", content: "Reading time" },
        { name: "twitter:data1", content: `${readTimeMinutes} min read` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(finalSchema),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { signedIn } = useMarketingSession();
  const { post, relatedPosts, readTimeMinutes, headings } =
    Route.useLoaderData();
  const meta = getPostMetadata(post.slug, post.title);
  const currentUrl = `https://seotool.im/blogs/${post.slug}`;
  const displayHeroImage = post.featuredImage || meta.heroImage;

  return (
    <MarketingChrome signedIn={signedIn}>
      {/* Search Engine Land / SEJ Style Editorial Header */}
      <BlogHeroHeader
        title={post.title}
        description={post.description}
        category={meta.category}
        publishedAt={post.publishedAt}
        readTimeMinutes={readTimeMinutes}
        featuredImage={displayHeroImage}
      />

      {/* 3-Column Editorial Body Layout with expanded reading area */}
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          {/* Left Column: Author Byline, Social Share Rail, & Table of Contents */}
          <BlogSocialRail
            author={meta.author}
            url={currentUrl}
            title={post.title}
            headings={headings}
          />

          {/* Center Column: Wide Editorial Article Body */}
          <article className="min-w-0 flex-1 max-w-4xl xl:max-w-5xl">
            <EditorialMarkdown>{post.contentMd}</EditorialMarkdown>
            <BlogTopicsList topics={meta.topics} />
            <BlogAuthorBio author={meta.author} />
          </article>

          {/* Right Column: Sticky Sidebar with Newsletter & SEO Audit CTAs */}
          <BlogSidebar />
        </div>
      </div>

      {/* Bottom Section: Related Articles Grid */}
      <BlogRelatedPosts posts={relatedPosts} />
    </MarketingChrome>
  );
}
