import type { FeaturePage } from "@/lib/feature-pages";

type FeaturePageProps = {
  page: FeaturePage;
};

export function FeaturePageTemplate({ page }: FeaturePageProps) {
  return (
    <article className="mx-auto max-w-5xl text-[var(--color-brand)]">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-[var(--color-brand-accent)]">
          {page.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-brand)] md:text-6xl">
          {page.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--color-brand-muted)]">
          {page.description}
        </p>
        <div className="mt-6">
          <a
            href="https://seotool.im/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 active:scale-95"
          >
            Try SeoTool.im
            <span aria-hidden="true" className="ml-2">
              &rarr;
            </span>
          </a>
        </div>
      </header>

      <FeatureImage page={page} />

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand)]">
          What you can do
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {page.workflows.map((workflow, index) => (
            <li
              key={workflow.title}
              className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-6 transition-colors hover:border-[var(--color-brand-accent)]/40"
            >
              <span className="font-mono text-xs font-bold tabular-nums text-[var(--color-brand-accent)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-base font-bold text-[var(--color-brand)]">
                {workflow.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-brand-muted)]">
                {workflow.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {page.showMetrics ? <MetricsSection page={page} /> : null}

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <ListSection title="Use cases" items={page.useCases} />
        <ListSection title="Why SeoTool.im" items={page.differentiators} />
      </div>

      {page.guides ? <GuidesSection guides={page.guides} /> : null}

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand)]">
          Related features
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {page.related.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-4 text-sm font-medium text-[var(--color-brand)] transition-all hover:border-[var(--color-brand-accent)]/50"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="ml-1 text-[var(--color-brand-accent)]"
              >
                &rarr;
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand)]">
          FAQ
        </h2>
        <div className="mt-5 divide-y divide-[var(--color-border-subtle)] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]">
          {page.faqs.map((faq) => (
            <div key={faq.question} className="p-6">
              <h3 className="text-base font-semibold text-[var(--color-brand)]">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-brand-muted)]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-8 md:p-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-brand)]">
          Try SeoTool.im
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-brand-muted)]">
          The open source alternative to bloated, expensive, legacy SEO tools.
        </p>
        <div className="mt-6">
          <a
            href="https://seotool.im/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 active:scale-95"
          >
            Try SeoTool.im
            <span aria-hidden="true" className="ml-2">
              &rarr;
            </span>
          </a>
        </div>
      </section>
    </article>
  );
}

function FeatureImage({ page }: FeaturePageProps) {
  return (
    <figure className="mt-10 overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-3">
      <img
        src={page.imageSrc}
        alt={page.imageAlt}
        width={1600}
        height={1000}
        loading="eager"
        decoding="async"
        className="aspect-[16/10] w-full rounded-xl border border-[var(--color-border-subtle)] object-cover object-top"
      />
      <figcaption className="px-1 pt-2.5 text-xs text-[var(--color-brand-muted)]">
        {page.eyebrow} in SeoTool.im.
      </figcaption>
    </figure>
  );
}

function MetricsSection({ page }: FeaturePageProps) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand)]">
        Data you can act on
      </h2>
      <dl className="mt-5 grid overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] sm:grid-cols-2 md:grid-cols-4">
        {page.metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={[
              "p-6",
              index > 0 && "border-t border-[var(--color-border-subtle)]",
              index % 2 === 1 &&
                "sm:border-l sm:border-[var(--color-border-subtle)]",
              index > 1 && "sm:border-t",
              index > 0 &&
                "md:border-l md:border-t-0 md:border-[var(--color-border-subtle)]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-muted)]">
              {metric.label}
            </dt>
            <dd className="mt-1.5 text-base font-bold text-[var(--color-brand)]">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function GuidesSection({
  guides,
}: {
  guides: NonNullable<FeaturePage["guides"]>;
}) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand)]">
        {guides.title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-brand-muted)]">
        {guides.description}
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {guides.items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-6 transition-all hover:border-[var(--color-brand-accent)]/50"
          >
            <h3 className="text-base font-bold text-[var(--color-brand)]">
              {item.label}
              <span
                aria-hidden="true"
                className="ml-1 text-[var(--color-brand-accent)]"
              >
                &rarr;
              </span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-brand-muted)]">
              {item.description}
            </p>
          </a>
        ))}
      </div>
      <div className="mt-4">
        <a
          href={guides.cta.href}
          className="text-sm font-semibold text-[var(--color-brand-accent)] underline underline-offset-4 transition-colors hover:text-white"
        >
          {guides.cta.label}
          <span aria-hidden="true" className="ml-1">
            &rarr;
          </span>
        </a>
      </div>
    </section>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-6 md:p-8">
      <h2 className="text-xl font-bold tracking-tight text-[var(--color-brand)]">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-[var(--color-brand-muted)]">
            <span
              aria-hidden="true"
              className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-brand-accent)]"
            />
            <span className="leading-relaxed text-[var(--color-brand)]/90">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
