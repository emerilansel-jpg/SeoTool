import { U as jsxRuntimeExports } from "./worker-entry-oZfJ_xJd.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const plays = [{
  title: "Seed from conversation, not a volume report",
  description: "Harvest seed keywords from sales calls and support tickets: the phrasings tools never surface.",
  href: "/library/keyword-research/seed-from-conversation"
}, {
  title: "What are long-tail keywords, and how to mine them",
  description: "PAA fan-out, autocomplete harvesting, and the GSC queries you already half-rank for.",
  href: "/library/keyword-research/long-tail-question-mining"
}, {
  title: "Search-intent mapping (hot / warm / cold)",
  description: "Label every keyword by buying temperature before you write. Build the hot pages first.",
  href: "/library/keyword-research/search-intent-mapping"
}, {
  title: "Cluster keywords into topical hubs",
  description: "One page per intent, one hub per topic, plus the fix for keyword cannibalization.",
  href: "/library/keyword-research/cluster-topical-hubs"
}, {
  title: "Programmatic discovery with Search Console",
  description: "Query-mine your own GSC by MCP: striking-distance keywords, zero-click pages, dark queries."
}, {
  title: "Opportunity sizing & forecasting",
  description: "Size a cluster before you invest: difficulty, traffic ceiling, and honest payback windows."
}, {
  title: "Intent beyond Google (Pinterest, AI, LinkedIn)",
  description: "Where queries happen when they don't happen in a search box, AI assistants included."
}, {
  title: "Map positioning to real demand",
  description: "Competitor keyword gaps as a positioning instrument, not a copying exercise."
}];
const faqs = [{
  question: "How do you do keyword research for SEO?",
  answer: "Seed from customer language, expand into long-tails and questions, label by intent, cluster into one-page-per-intent hubs, then validate against Search Console. Volume is the final filter, not the starting point."
}, {
  question: "How do you do keyword research for free?",
  answer: "The discovery half runs on sources you already have: customer conversations, Google's autocomplete and People Also Ask, and your Search Console. Quality SEO data (volume, difficulty, live SERPs) is difficult to get, which is why SaaS tools run $100/month and up. SeoTool.im is the most affordable option, starting at $10/month, and you can start for free."
}, {
  question: "Can you do keyword research without Google Keyword Planner?",
  answer: "Yes, and for SEO you should. Planner groups variants and hides zero-ad-demand queries. Use it to sanity-check commercial value, not to discover topics."
}, {
  question: "What are the 3 types of keywords?",
  answer: "By intent: informational, commercial/navigational, transactional. By shape: head, mid-tail, long-tail. The useful planning question is always intent first, shape second."
}, {
  question: "How do you do keyword research for a blog?",
  answer: "Blogs win in the tail: mine questions, cluster them into topical hubs, and let each post own one question-intent completely rather than skimming ten."
}];
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
};
function KeywordResearchLibraryPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: "Strategy Library" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-6xl", children: "The Keyword Research Strategy Library" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-lg leading-8 text-[var(--color-brand-muted)]", children: "Eight practitioner plays that treat keyword research as demand discovery, sourced from real interviews with working SEOs, executable inside SeoTool.im." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "How to do keyword research: demand discovery, not a volume spreadsheet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "Most guides teach you to export a volume report and sort descending. These plays start earlier, where demand originates: customer language, question mining, your own Search Console. They end with pages mapped to intent, not keywords stuffed into paragraphs. Each play is a full walkthrough with the copy-paste MCP prompt that runs it." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-4 md:grid-cols-2", children: plays.map((play, index) => {
        const number = String(index + 1).padStart(2, "0");
        const body = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm tabular-nums text-[var(--color-brand-accent)]", children: number }),
            play.href ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-[var(--color-border-subtle)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-brand-muted)]", children: "Next up" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mt-3 text-base font-semibold text-neutral-950", children: [
            play.title,
            play.href ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "ml-1 text-[var(--color-brand-accent)]", children: "→" }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-[var(--color-brand-muted)]", children: play.description })
        ] });
        return play.href ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: play.href, className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-5 transition-colors hover:border-neutral-900", children: body }, play.title) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-5", children: body }, play.title);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12 rounded-xl border border-[var(--color-border-subtle)] bg-white p-6 md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "What Google Keyword Planner hides (and what to use instead)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-3xl text-sm leading-6 text-neutral-700", children: "Keyword Planner is an ads tool wearing an SEO costume: it buckets close variants into one number, rounds volumes into bands, and hides everything with no ad demand. That's fine for bidding. It's blinding for content strategy." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 max-w-3xl text-sm leading-6 text-neutral-700", children: [
        "The plays in this library replace it with three honest sources: your customers' language (play 01), Google's own question surfaces (play 02), and your Search Console reality (play 05). Volume data still matters, but it's the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "last" }),
        " filter, not the first."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Free keyword research tools for every play" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: [
        "Google's free surfaces (autocomplete, People Also Ask) plus your own Search Console do the discovery. Every play then runs in",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/features/keyword-research", className: "font-medium text-neutral-950 underline decoration-[var(--color-brand-accent)] underline-offset-4", children: "SeoTool.im's keyword research" }),
        ", connected to your live Search Console. Open source, self-hostable, and scriptable through the",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/mcp", className: "font-medium text-neutral-950 underline decoration-[var(--color-brand-accent)] underline-offset-4", children: "MCP" }),
        " ",
        "so your AI assistant can run the whole workflow. Quality SEO data is why the big suites run $100/month and up; SeoTool.im starts at $10/month, and you can start for free."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Keyword research FAQ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 divide-y divide-[var(--color-border-subtle)] rounded-lg border border-[var(--color-border-subtle)] bg-white", children: faqs.map((faq) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-neutral-900", children: faq.question }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: faq.answer })
      ] }, faq.question)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--color-border-subtle)] bg-white p-6 sm:flex-row sm:items-center md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "The Keyword Research Playbook" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "The plays as a working PDF: checklists, the MCP prompts, and the keyword-map template. Ungated." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/library/keyword-research/keyword-research-playbook.pdf", className: "inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-neutral-950 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800", children: [
        "Download the playbook",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "ml-2", children: "→" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "script",
      {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify(faqLd)
        }
      }
    )
  ] });
}
export {
  KeywordResearchLibraryPage as component
};
