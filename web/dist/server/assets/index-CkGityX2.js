import { jsxs, jsx, Fragment } from "react/jsx-runtime";
const plays = [{
  title: "How to appear in ChatGPT results",
  description: "The mechanics of LLM citations: where the training and retrieval data comes from, and the page patterns that get cited.",
  href: "/library/ai-search-geo/appear-in-chatgpt-results"
}, {
  title: "How to track your AI visibility",
  description: "What to measure, how often, and which movements actually matter: mentions, share of voice, and cited pages.",
  href: "/library/ai-search-geo/track-ai-visibility"
}, {
  title: "GEO vs SEO: what actually changes",
  description: "Which classic SEO work still counts, which signals AI assistants ignore, and what to do differently."
}, {
  title: "Getting into Google AI Overviews",
  description: "AI Overviews cite differently than ChatGPT. The overlap with positions 1-10 and how to earn the citation block."
}, {
  title: "Winning citations from Perplexity and Gemini",
  description: "Perplexity is a search engine wearing a chat mask. What that means for how it picks sources."
}, {
  title: "LLM crawlers: GPTBot, ClaudeBot, and robots.txt",
  description: "Who is crawling your site, what they take, and the blocking tradeoff nobody explains honestly."
}, {
  title: "Structured answers: formatting content for AI readers",
  description: "Extractable answers, entity clarity, and the page anatomy models retrieve well."
}, {
  title: "AI search statistics from live data",
  description: "Quarterly numbers from our own AI answers dataset: who gets cited, in which categories, and how fast it shifts."
}];
const faqs = [{
  question: "What is AI search optimization (GEO)?",
  answer: "Generative engine optimization is the practice of making your brand and pages citable by AI assistants like ChatGPT, Perplexity, and Google's AI Overviews. Where SEO fights for a position in a list of links, GEO fights for inclusion in a generated answer that often replaces the list."
}, {
  question: "How do I get my website mentioned by ChatGPT?",
  answer: "Publish pages that directly answer buyer questions in extractable form, earn citations from the sites AI models already retrieve (listicles, comparison pages, directories, wikis), keep content fresh, and allow AI crawlers in robots.txt. Then measure with a visibility tracker instead of guessing."
}, {
  question: "Does regular SEO help with AI Overviews?",
  answer: "Partly. Technical health and topical authority carry over, but AI Overviews assemble answers from multiple sources and favor pages that state the answer plainly, not just pages that rank first. Ranking helps you get retrieved; clarity gets you quoted."
}, {
  question: "How do I measure AI visibility?",
  answer: "Track three things: how many AI answers mention your brand (mentions), how big your slice of mentions is versus competitors (share of voice), and which of your pages get cited. SeoTool.im's free AI visibility checker gives you the first number instantly; the full report tracks all three over time."
}, {
  question: "What is the difference between GEO and SEO?",
  answer: "SEO optimizes for a ranking algorithm that orders links. GEO optimizes for language models that synthesize an answer. Links, crawlability, and authority still matter, but extractable answers, entity clarity, and third-party citations matter far more in generated results."
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
function AiSearchGeoLibraryPage() {
  return /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-5xl", children: [
    /* @__PURE__ */ jsxs("header", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: "Strategy Library" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-6xl", children: "The AI Search Optimization Library" }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 text-lg leading-8 text-[var(--color-brand-muted)]", children: "Plays for the newest front page of search: the answer AI assistants give when buyers ask who to choose. Built from live AI citation data, executable with free tools." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "GEO plays: get cited, then get chosen" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "Every play ends in something measurable: a mention count, a cited page, a share-of-voice number. No recycled speculation about training AI to love your brand, just the mechanics of how answers get assembled and who ends up in them." }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 grid gap-4 md:grid-cols-2", children: plays.map((play, index) => {
        const number = String(index + 1).padStart(2, "0");
        const body = /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-sm tabular-nums text-[var(--color-brand-accent)]", children: number }),
            play.href ? null : /* @__PURE__ */ jsx("span", { className: "rounded-full border border-[var(--color-border-subtle)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-brand-muted)]", children: "Next up" })
          ] }),
          /* @__PURE__ */ jsxs("h3", { className: "mt-3 text-base font-semibold text-neutral-950", children: [
            play.title,
            play.href ? /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "ml-1 text-[var(--color-brand-accent)]", children: "→" }) : null
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-[var(--color-brand-muted)]", children: play.description })
        ] });
        return play.href ? /* @__PURE__ */ jsx("a", { href: play.href, className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-5 transition-colors hover:border-neutral-900", children: body }, play.title) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-5", children: body }, play.title);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12 rounded-xl border border-[var(--color-border-subtle)] bg-white p-6 md:p-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Why AI search is a different discipline" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-3xl text-sm leading-6 text-neutral-700", children: "A Google result page shows ten links and lets the buyer choose. An AI answer names a shortlist, sometimes three brands, sometimes one, and explains why. There is no position five to rank for. Your brand is in the answer or it is invisible at the exact moment of shortlisting." }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-3xl text-sm leading-6 text-neutral-700", children: "The levers differ too. Assistants assemble answers from pages that state conclusions plainly, from third-party sources buyers already trust (roundups, comparisons, communities), and from fresh material their retrieval step can find. Classic ranking signals still open the door, but the citation decision happens on the page itself: does this page answer the question in a form a model can quote?" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-3xl text-sm leading-6 text-neutral-700", children: "That is good news for smaller teams. You cannot out-spend a DR-90 publisher on links, but you can out-answer them on the questions your buyers actually ask, and that is what AI citations reward." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Tools for every play" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: [
        "Start with the",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/free-tools/ai-visibility-checker", className: "font-medium text-neutral-950 underline decoration-[var(--color-brand-accent)] underline-offset-4", children: "free AI visibility checker" }),
        " ",
        "to see your baseline. Then track ChatGPT and AI Overviews mentions, competitor share of voice, and every cited page inside",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/features/ai-brand-visibility", className: "font-medium text-neutral-950 underline decoration-[var(--color-brand-accent)] underline-offset-4", children: "SeoTool.im's AI brand visibility" }),
        " ",
        ", scriptable through the",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/docs/mcp", className: "font-medium text-neutral-950 underline decoration-[var(--color-brand-accent)] underline-offset-4", children: "MCP" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "AI search optimization FAQ" }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 divide-y divide-[var(--color-border-subtle)] rounded-lg border border-[var(--color-border-subtle)] bg-white", children: faqs.map((faq) => /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-900", children: faq.question }),
        /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: faq.answer })
      ] }, faq.question)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--color-border-subtle)] bg-white p-6 sm:flex-row sm:items-center md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Find out where you stand" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "Run the free check, then track every mention, competitor, and cited page over time. Takes about ten seconds." })
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "/free-tools/ai-visibility-checker", className: "inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-neutral-950 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800", children: [
        "Check my AI visibility",
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "ml-2", children: "→" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
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
  AiSearchGeoLibraryPage as component
};
