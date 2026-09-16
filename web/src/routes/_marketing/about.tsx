import { createFileRoute } from "@tanstack/react-router";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/_marketing/about")({
  head: () =>
    buildPageSeo({
      title: "About SeoTool.im",
      description:
        "The modern SEO platform built for power users and AI agents.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 pb-24 text-[var(--color-brand)] md:px-6 md:pt-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-brand)] sm:text-6xl">
          We build tools for the next era of search.
        </h1>
        <p className="mt-6 text-lg leading-8 text-[var(--color-brand-muted)] max-w-2xl mx-auto">
          SeoTool.im is redefining technical marketing. We provide high-precision
          data infrastructure natively designed for modern teams and autonomous
          AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch my-16">
        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] p-8 md:p-10 rounded-2xl text-[var(--color-brand)] shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-[var(--color-brand)]">Our Mission</h2>
          <p className="text-[var(--color-brand-muted)] leading-relaxed">
            Search is fundamentally changing. The transition from traditional
            engines to generative AI requires a new class of diagnostics. Our
            goal is to make enterprise-grade SEO data accessible, fast, and
            programmatically controllable.
          </p>
        </div>
        <div className="space-y-6 flex flex-col justify-between">
          <div className="border border-[var(--color-border-subtle)] p-6 rounded-2xl bg-[var(--color-surface-raised)]">
            <h3 className="font-bold text-lg text-[var(--color-brand)] mb-2">
              Transparency First
            </h3>
            <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed">
              We believe in open standards. You own your data. We integrate with
              the tools you already use.
            </p>
          </div>
          <div className="border border-[var(--color-border-subtle)] p-6 rounded-2xl bg-[var(--color-surface-raised)]">
            <h3 className="font-bold text-lg text-[var(--color-brand)] mb-2">
              Engineering Driven
            </h3>
            <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed">
              Built on a modern stack with performance at its core. Zero bloat,
              zero legacy technical debt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
