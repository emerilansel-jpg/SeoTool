import { jsxs, jsx } from "react/jsx-runtime";
import { ai as Route } from "./router-D7vvO90Q.js";
import "@tanstack/react-router";
import "react";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
function ChangelogPage() {
  const logs = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl pt-12 pb-24 md:pt-20", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl", children: "Changelog" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-lg text-neutral-600", children: "New updates and improvements to SeoTool.im." })
    ] }),
    logs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-neutral-500", children: "No release notes found." }) : /* @__PURE__ */ jsx("div", { className: "space-y-16", children: logs.map((log) => /* @__PURE__ */ jsx("div", { className: "relative pl-4 md:pl-0", children: /* @__PURE__ */ jsxs("div", { className: "md:grid md:grid-cols-[1fr_3fr] md:gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 md:mb-0", children: /* @__PURE__ */ jsx("h2", { className: "sticky top-24 text-xl font-bold text-neutral-950", children: log.version }) }),
      /* @__PURE__ */ jsx("div", { className: "prose prose-neutral max-w-none prose-a:text-[var(--color-brand-accent)] prose-a:no-underline hover:prose-a:underline prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg", children: /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: {
        __html: log.html
      } }) })
    ] }) }, log.version)) })
  ] });
}
export {
  ChangelogPage as component
};
