import { createFileRoute } from "@tanstack/react-router";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/_marketing/contact")({
  head: () =>
    buildPageSeo({
      title: "Contact Us",
      description:
        "Get in touch with the SeoTool.im team for support or inquiries.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl pt-12 pb-24 md:pt-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Need help with your account, have a feature request, or want to report
          a bug? We are here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a
          href="mailto:support@seotool.im"
          className="group relative flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border-subtle)] bg-white p-10 text-center shadow-sm transition-all hover:border-neutral-900 hover:shadow-md"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            Email Support
          </h3>
          <p className="text-sm text-neutral-600">support@seotool.im</p>
          <p className="mt-4 text-xs text-neutral-500">
            We typically reply within 24 hours.
          </p>
        </a>

        <a
          href="https://github.com/emerilansel-jpg/SeoTool/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border-subtle)] bg-white p-10 text-center shadow-sm transition-all hover:border-neutral-900 hover:shadow-md"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            GitHub Issues
          </h3>
          <p className="text-sm text-neutral-600">
            Feature requests &amp; bugs
          </p>
          <p className="mt-4 text-xs text-neutral-500">
            Public tracking for our community.
          </p>
        </a>
      </div>
    </div>
  );
}
