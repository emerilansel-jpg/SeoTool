import { U as jsxRuntimeExports } from "./worker-entry-oZfJ_xJd.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const STEPS = [{
  step: "1",
  title: "Apply",
  description: "Fill out the affiliate application. We review every submission and get back to you quickly."
}, {
  step: "2",
  title: "Share",
  description: "Get your unique referral link and share it with your audience through content, social media, or email."
}, {
  step: "3",
  title: "Earn",
  description: "Earn 30% recurring commission on every paid subscription generated through your link."
}];
function AffiliatePage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl pt-12 pb-24 md:pt-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl", children: "Earn by referring SeoTool.im" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-lg leading-8 text-neutral-600 max-w-2xl mx-auto", children: "Join our affiliate program and earn recurring commissions for every customer you refer to SeoTool.im." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-8 md:grid-cols-3 my-16", children: STEPS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white text-lg font-bold", children: item.step }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-neutral-900 mb-2", children: item.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-neutral-600", children: item.description })
    ] }, item.step)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-[var(--color-border-subtle)] p-10 rounded-2xl bg-white text-center my-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-neutral-950 mb-2", children: "Commission Structure" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-neutral-600 mb-8", children: "Simple, transparent terms that reward long-term partnerships." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-neutral-950", children: "30%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-neutral-600 mt-1", children: "Recurring commission" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-neutral-950", children: "90 days" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-neutral-600 mt-1", children: "Cookie duration" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-neutral-950", children: "Monthly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-neutral-600 mt-1", children: "Payout schedule" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:support@seotool.im?subject=Affiliate Program Application", className: "inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-950 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors", children: "Apply to become an affiliate" }) })
  ] });
}
export {
  AffiliatePage as component
};
