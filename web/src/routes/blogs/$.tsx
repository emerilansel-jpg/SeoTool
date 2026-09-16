import { createFileRoute, Link } from "@tanstack/react-router";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import { DocsBody } from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { ComponentPropsWithoutRef } from "react";
import { Suspense } from "react";
import { BlogLayout } from "@/components/blog-layout";
import { SiteFooter } from "@/components/site-footer";
import { getBlogPost } from "@/lib/content.functions";
import { blog } from "../../../source.generated";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/blogs/$")({
  loader: async ({ params }: { params: { _splat?: string } }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await getBlogPost({ data: slugs });
    await clientMdxLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }: { loaderData?: unknown }) => {
    const data = loaderData as
      | { title?: string; description?: string; url?: string }
      | undefined;
    const title = data?.title ?? "SeoTool.im Blog";
    const description = data?.description;
    return buildPageSeo({
      title,
      description,
      path: data?.url ?? "/blogs",
      titleSuffix: "SeoTool.im Blog",
      ogType: "article",
    });
  },
  component: BlogPost,
});

const clientMdxLoader = createClientLoader(blog, {
  id: "blog",
  component({ default: MDX }) {
    return (
      <DocsBody className="text-[var(--color-brand)] [&_a]:text-[var(--color-brand-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[var(--color-brand)] [&_h2]:font-bold [&_h3]:text-[var(--color-brand)] [&_h3]:font-bold [&_li]:text-[var(--color-brand-muted)] [&_p]:text-[var(--color-brand-muted)] [&_strong]:text-[var(--color-brand)]">
        <MDX
          components={{
            ...defaultMdxComponents,
            table: BlogTable,
            th: BlogTableHeader,
            td: BlogTableCell,
          }}
        />
      </DocsBody>
    );
  },
});

function BlogTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="not-prose my-8 w-full max-w-full overflow-x-auto rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]">
      <table
        {...props}
        className="w-full border-collapse text-left text-sm text-[var(--color-brand)]"
      />
    </div>
  );
}

function BlogTableHeader(props: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      {...props}
      className="border-b border-r border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-brand)] last:border-r-0"
    />
  );
}

function BlogTableCell(props: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      {...props}
      className="border-b border-r border-[var(--color-border-subtle)] px-4 py-3 align-top text-sm leading-6 text-[var(--color-brand-muted)] last:border-r-0 [&_a]:font-medium [&_a]:text-[var(--color-brand-accent)]"
    />
  );
}

function BlogPost() {
  const data = Route.useLoaderData() as {
    path: string;
    title: string;
    description?: string;
  };
  const Content = clientMdxLoader.getComponent(data.path);

  return (
    <BlogLayout>
      <article className="mx-auto max-w-3xl px-6 py-12 text-[var(--color-brand)] md:py-20">
        <BlogHeader title={data.title} description={data.description} />
        <Suspense>
          <Content />
        </Suspense>

        <div className="mt-16 border-t border-[var(--color-border-subtle)] pt-8">
          <SiteFooter className="text-xs text-[var(--color-brand-muted)] [&_a]:transition-colors [&_a]:hover:text-white" />
        </div>
      </article>
    </BlogLayout>
  );
}

function BlogHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10 border-b border-[var(--color-border-subtle)] pb-8">
      <div className="mb-4">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-accent)] transition-colors hover:underline"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Back to Blog</span>
        </Link>
      </div>
      <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-brand)] md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-brand-muted)]">
          {description}
        </p>
      )}
    </header>
  );
}
