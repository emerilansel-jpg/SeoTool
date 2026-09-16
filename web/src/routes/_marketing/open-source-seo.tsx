import { createFileRoute } from "@tanstack/react-router";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsBody } from "fumadocs-ui/page";
import OpenSourceSeoContent, {
  frontmatter as openSourceSeoFrontmatter,
} from "../../../content/marketing/open-source-seo.md";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/_marketing/open-source-seo")({
  head: () =>
    buildPageSeo({
      title: openSourceSeoFrontmatter.title,
      description: openSourceSeoFrontmatter.description,
      path: "/open-source-seo",
      titleSuffix: "SeoTool.im",
      ogType: "article",
    }),
  component: OpenSourceSeoPage,
});

function OpenSourceSeoPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-8 text-[var(--color-brand)] md:px-6 md:py-12">
      <header className="mb-10 border-b border-[var(--color-border-subtle)] pb-8">
        <p className="text-sm font-semibold tracking-wide text-[var(--color-brand-accent)]">
          Open Source SEO
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-brand)] md:text-6xl">
          {openSourceSeoFrontmatter.title}
        </h1>
        {openSourceSeoFrontmatter.description ? (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]">
            {openSourceSeoFrontmatter.description}
          </p>
        ) : null}
      </header>

      <DocsBody className="min-w-0 text-[var(--color-brand)] [&_a]:text-[var(--color-brand-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[var(--color-brand)] [&_h2]:font-bold [&_h3]:text-[var(--color-brand)] [&_h3]:font-bold [&_li]:text-[var(--color-brand-muted)] [&_p]:text-[var(--color-brand-muted)] [&_strong]:text-[var(--color-brand)]">
        <OpenSourceSeoContent components={defaultMdxComponents} />
      </DocsBody>

      <OpenSourceSeoCta />
    </article>
  );
}

function OpenSourceSeoCta() {
  return (
    <section className="mt-14 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-8">
      <p className="text-xl font-bold tracking-tight text-[var(--color-brand)]">
        Try SeoTool.im, or follow along on GitHub
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-brand-muted)]">
        Try the hosted app if you want to get started right away. Or, check it
        out on GitHub. Make sure to give it a star!
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href="https://seotool.im/sign-up"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 active:scale-95"
        >
          Try SeoTool.im
          <span className="ml-2" aria-hidden="true">
            &rarr;
          </span>
        </a>
        <a
          href="https://github.com/emerilansel-jpg/SeoTool"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-brand)] transition-all hover:border-[var(--color-brand-accent)]/50"
        >
          <GitHubIcon />
          Star on GitHub
        </a>
      </div>
    </section>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
