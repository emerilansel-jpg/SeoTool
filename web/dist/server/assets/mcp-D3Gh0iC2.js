import { jsxs, Fragment, jsx } from "react/jsx-runtime";
const toolCategories = [{
  label: "Keywords",
  tools: [{
    title: "Research keywords",
    description: "Get keyword ideas with volume, difficulty, and CPC."
  }, {
    title: "Get SERP results",
    description: "See live Google organic results for a keyword."
  }, {
    title: "Save keywords",
    description: "Keep useful ideas organized in your SeoTool.im project."
  }, {
    title: "Get rank tracker data",
    description: "Read tracked-keyword positions and latest results from your project's rank trackers."
  }]
}, {
  label: "Competitive research",
  tools: [{
    title: "Get domain overview",
    description: "Summarize a domain's organic footprint."
  }, {
    title: "Get domain keywords",
    description: "Find keywords a domain already ranks for."
  }, {
    title: "Get backlinks overview",
    description: "Check backlink and referring-domain stats."
  }]
}, {
  label: "Search Console",
  tools: [{
    title: "Get GSC performance",
    description: "Read clicks, impressions, CTR, and position from the connected property."
  }, {
    title: "Inspect URLs",
    description: "Check index coverage, crawl, canonical, mobile, and rich-result signals."
  }]
}];
const workflows = [{
  title: "First-pass keyword research",
  description: "Ask the agent to expand seed topics into keyword ideas with volume, difficulty, and CPC, then save the promising ones back to your SeoTool.im project for human review."
}, {
  title: "Competitor teardown",
  description: "Point the agent at a competitor domain and have it pull the domain overview, ranking keywords, and backlink stats, then summarize where you can realistically compete."
}, {
  title: "Striking-distance sweep from Search Console",
  description: "Have the agent read your GSC queries, find page-two keywords worth pushing to page one, and check the live SERP for each before recommending changes."
}, {
  title: "Keyword clustering and tagging",
  description: "Let the agent group saved keywords by intent, tag them by page or topic cluster, and hand back a content plan you can act on in the SeoTool.im UI."
}];
function McpPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-neutral-500", children: "SeoTool.im MCP" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-3 text-3xl font-bold tracking-tight leading-tight", children: "An SEO MCP server for AI agents" }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-neutral-700 leading-relaxed", children: "SeoTool.im is an SEO MCP server that connects Claude, Cursor, Codex, or any MCP client to real data, so your agent can research keywords, inspect live SERPs, compare competitor domains, summarize backlink context, save keyword opportunities, review rank-tracking data, and read first-party Search Console signals." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsx("a", { href: "/docs/mcp", className: "inline-flex h-10 items-center justify-center rounded-md bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800", children: "Set up SeoTool.im MCP" }),
      /* @__PURE__ */ jsx("a", { href: "/docs/skills", className: "inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 px-5 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900", children: "View SeoTool.im skills" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "What is an SEO MCP server?" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm leading-relaxed text-neutral-600", children: [
        "MCP (Model Context Protocol) is the standard AI clients use to call external tools. An SEO MCP server exposes SEO data (keyword metrics, SERP results, domain and backlink stats) as tools an agent can call mid-conversation. Instead of guessing at search volumes or rankings, your agent queries real data from your SeoTool.im project, and can save its findings back so you can review them in the UI. Pair it with",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/features/keyword-research", className: "font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-700", children: "keyword research" }),
        " ",
        "for an agent-driven first pass over any topic."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Agent workflows that work" }),
      /* @__PURE__ */ jsx("ol", { className: "mt-6 space-y-6", children: workflows.map((workflow, index) => /* @__PURE__ */ jsxs("li", { className: "grid grid-cols-[2.25rem_1fr] gap-x-4", children: [
        /* @__PURE__ */ jsx("span", { className: "pt-[2px] font-mono text-sm tabular-nums text-neutral-400", children: String(index + 1).padStart(2, "0") }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-900", children: workflow.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm leading-relaxed text-neutral-600", children: workflow.description })
        ] })
      ] }, workflow.title)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Available tool groups" }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 grid gap-x-8 gap-y-8 md:grid-cols-3", children: toolCategories.map((category) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-neutral-500", children: category.label }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-3", children: category.tools.map((tool) => /* @__PURE__ */ jsxs("li", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-neutral-900", children: tool.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-neutral-600", children: tool.description })
        ] }, tool.title)) })
      ] }, category.label)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12 rounded-lg border border-neutral-200 bg-white p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-neutral-900", children: "Google Search Console MCP, no Google Cloud setup" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-neutral-600", children: "SeoTool.im MCP can read Search Console performance and URL inspection data from a connected hosted project. No Google Cloud project or OAuth credentials needed. These tools are read-only and do not use SeoTool.im credits." }),
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx("a", { href: "/google-search-console-mcp", className: "inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 px-4 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900", children: "Explore GSC MCP" }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12 rounded-lg border border-neutral-200 bg-neutral-50 p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-neutral-900", children: "Setup lives in Docs" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-neutral-600", children: "The MCP server URL, Claude setup, Codex setup, and troubleshooting steps are maintained in the docs so this feature page can stay focused on what SeoTool.im MCP makes possible." }),
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx("a", { href: "/docs/mcp", className: "inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800", children: "Open MCP docs" }) })
    ] })
  ] });
}
export {
  McpPage as component
};
