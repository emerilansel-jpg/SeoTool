import { U as jsxRuntimeExports } from "./worker-entry-T7oaZFxD.js";
import { ak as Route } from "./router-nYHkPPcI.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-CEEcLXFO.js";
function ChangelogPage() {
  const logs = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl px-4 pt-12 pb-24 text-[var(--color-brand)] md:px-6 md:pt-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-extrabold tracking-tight text-[var(--color-brand)] sm:text-5xl", children: "Changelog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg text-[var(--color-brand-muted)]", children: "New updates and improvements to SeoTool.im." })
    ] }),
    logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--color-brand-muted)]", children: "No release notes found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-16", children: logs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative pl-4 md:pl-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:grid md:grid-cols-[1fr_3fr] md:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 md:mb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sticky top-24 inline-flex items-center px-3.5 py-1 rounded-full text-sm font-bold bg-primary/15 text-primary border border-primary/20", children: log.version }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-invert max-w-none text-[var(--color-brand-muted)] prose-a:text-[var(--color-brand-accent)] prose-a:no-underline hover:prose-a:underline prose-headings:font-bold prose-headings:text-[var(--color-brand)] prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dangerouslySetInnerHTML: {
        __html: log.html
      } }) })
    ] }) }, log.version)) })
  ] });
}
export {
  ChangelogPage as component
};
