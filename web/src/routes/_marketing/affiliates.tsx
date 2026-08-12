import { createFileRoute } from "@tanstack/react-router";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/_marketing/affiliates")({
  head: () =>
    buildPageSeo({
      title: "Affiliate Program",
      description:
        "Earn recurring commissions by referring customers to SeoTool.im.",
      path: "/affiliates",
    }),
  component: AffiliatePage,
});

const STEPS = [
  {
    step: "1",
    title: "Apply",
    description:
      "Fill out the affiliate application. We review every submission and get back to you quickly.",
  },
  {
    step: "2",
    title: "Share",
    description:
      "Get your unique referral link and share it with your audience through content, social media, or email.",
  },
  {
    step: "3",
    title: "Earn",
    description:
      "Earn 30% recurring commission on every paid subscription generated through your link.",
  },
];

function AffiliatePage() {
  return (
    <div className="mx-auto max-w-4xl pt-12 pb-24 md:pt-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl">
          Earn by referring SeoTool.im
        </h1>
        <p className="mt-6 text-lg leading-8 text-neutral-600 max-w-2xl mx-auto">
          Join our affiliate program and earn recurring commissions for every
          customer you refer to SeoTool.im.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 my-16">
        {STEPS.map((item) => (
          <div key={item.step} className="text-center px-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white text-lg font-bold">
              {item.step}
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-[var(--color-border-subtle)] p-10 rounded-2xl bg-white text-center my-16">
        <h2 className="text-2xl font-bold text-neutral-950 mb-2">
          Commission Structure
        </h2>
        <p className="text-neutral-600 mb-8">
          Simple, transparent terms that reward long-term partnerships.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-4">
            <p className="text-3xl font-bold text-neutral-950">30%</p>
            <p className="text-sm text-neutral-600 mt-1">
              Recurring commission
            </p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold text-neutral-950">90 days</p>
            <p className="text-sm text-neutral-600 mt-1">Cookie duration</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold text-neutral-950">Monthly</p>
            <p className="text-sm text-neutral-600 mt-1">Payout schedule</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <a
          href="mailto:support@seotool.im?subject=Affiliate Program Application"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-950 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Apply to become an affiliate
        </a>
      </div>
    </div>
  );
}
