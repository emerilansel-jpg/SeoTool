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
    <div className="mx-auto max-w-4xl pt-12 pb-24 md:pt-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl">
          We build tools for the next era of search.
        </h1>
        <p className="mt-6 text-lg leading-8 text-neutral-600 max-w-2xl mx-auto">
          SeoTool.im is redefining technical marketing. We provide high-precision
          data infrastructure natively designed for modern teams and autonomous
          AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-20">
        <div className="bg-neutral-950 p-10 rounded-3xl text-white shadow-xl shadow-neutral-950/10">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-neutral-300 leading-relaxed">
            Search is fundamentally changing. The transition from traditional
            engines to generative AI requires a new class of diagnostics. Our
            goal is to make enterprise-grade SEO data accessible, fast, and
            programmatically controllable.
          </p>
        </div>
        <div className="space-y-6">
          <div className="border border-[var(--color-border-subtle)] p-6 rounded-2xl bg-white shadow-sm">
            <h3 className="font-semibold text-lg text-neutral-900 mb-2">
              Transparency First
            </h3>
            <p className="text-neutral-600 text-sm">
              We believe in open standards. You own your data. We integrate with
              the tools you already use.
            </p>
          </div>
          <div className="border border-[var(--color-border-subtle)] p-6 rounded-2xl bg-white shadow-sm">
            <h3 className="font-semibold text-lg text-neutral-900 mb-2">
              Engineering Driven
            </h3>
            <p className="text-neutral-600 text-sm">
              Built on a modern stack with performance at its core. Zero bloat,
              zero legacy technical debt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
