import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const VALUES = [{
  title: "Open Source First",
  description: "Our core is fully open source. We believe in transparency and community-driven development."
}, {
  title: "Remote by Default",
  description: "Work from anywhere. We optimize for async communication and deep focus time."
}, {
  title: "Engineering Driven",
  description: "We build with a modern stack and care deeply about code quality, performance, and developer experience."
}, {
  title: "Small Team, Big Impact",
  description: "Every person on the team has a direct impact on the product and the company's direction."
}];
function CareersPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl pt-12 pb-24 md:pt-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl", children: "Build the future of SEO with us" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-lg leading-8 text-neutral-600 max-w-2xl mx-auto", children: "We are a small, focused team building the open source alternative to expensive SEO platforms. If you love open source and data, we would love to hear from you." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2 my-16", children: VALUES.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-[var(--color-border-subtle)] p-8 rounded-2xl bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-neutral-900 mb-2", children: value.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-neutral-600", children: value.description })
    ] }, value.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-[var(--color-border-subtle)] p-10 rounded-2xl bg-white text-center my-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-neutral-950 mb-4", children: "Open Positions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-neutral-600 max-w-xl mx-auto leading-relaxed", children: "We do not have any open positions right now, but we are always looking for talented people. Send us your resume and tell us how you would make SeoTool.im better." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:support@seotool.im?subject=Career Inquiry", className: "inline-flex items-center gap-2 mt-8 px-6 py-3 bg-neutral-950 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors", children: "Get in touch" })
    ] })
  ] });
}
export {
  CareersPage as component
};
