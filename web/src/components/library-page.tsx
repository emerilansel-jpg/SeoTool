import type { ReactNode } from "react";
import { DocsBody } from "fumadocs-ui/page";

const LIBRARY_PILLAR_PATH = "/library/keyword-research";

export function LibrarySpokePage({
  crumb,
  title,
  description,
  children,
}: {
  crumb: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-8 text-[var(--color-brand)] md:px-6 md:py-12">
      <header className="mb-10 border-b border-[var(--color-border-subtle)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-muted)]">
          <a
            href={LIBRARY_PILLAR_PATH}
            className="font-semibold text-[var(--color-brand-accent)] hover:underline"
          >
            Strategy Library
          </a>{" "}
          / <span>{crumb}</span>
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-brand)] md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]">
            {description}
          </p>
        ) : null}
      </header>

      <DocsBody className="min-w-0 text-[var(--color-brand)] [&_a]:text-[var(--color-brand-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[var(--color-brand)] [&_h2]:font-bold [&_h3]:text-[var(--color-brand)] [&_h3]:font-bold [&_li]:text-[var(--color-brand-muted)] [&_p]:text-[var(--color-brand-muted)] [&_strong]:text-[var(--color-brand)]">
        {children}
      </DocsBody>

      <LibrarySpokeCta />
    </article>
  );
}

function LibrarySpokeCta() {
  return (
    <section className="mt-14 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-8">
      <p className="text-xl font-bold tracking-tight text-[var(--color-brand)]">
        Run every play in this guide
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-brand-muted)]">
        SeoTool.im connects your Search Console and expands your seeds. Open
        source, free to try, no credit card.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href="https://seotool.im/sign-up"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 active:scale-95"
        >
          Start with SeoTool.im
          <span className="ml-2" aria-hidden="true">
            &rarr;
          </span>
        </a>
        <a
          href={LIBRARY_PILLAR_PATH}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-brand)] transition-all hover:border-[var(--color-brand-accent)]/50"
        >
          Back to the Strategy Library
        </a>
      </div>
    </section>
  );
}
