import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { buildPageSeo } from "@/lib/seo";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import "@/components/landing-page.css";
import "@/components/free-tools.css";

function revealDelay(index: number): CSSProperties {
  return { "--reveal-i": String(index) } as CSSProperties;
}

type ToolCard = {
  name: string;
  description: string;
  keyword: string;
  live: boolean;
  href: string;
  linkLabel: string;
};

const TOOLS: ToolCard[] = [
  {
    name: "AI Visibility Checker",
    description:
      "See whether ChatGPT mentions your domain when buyers ask for recommendations. The check most SEO suites still do not have.",
    keyword: "ai visibility checker",
    live: true,
    href: "/free-tools/ai-visibility-checker",
    linkLabel: "Open the free check",
  },
  {
    name: "Website SEO Checker",
    description:
      "Crawl your site for technical issues, Core Web Vitals, and content flags, with a plain-language action list.",
    keyword: "website seo checker",
    live: false,
    href: "/features/site-audit",
    linkLabel: "See site audits",
  },
  {
    name: "Backlink Checker",
    description:
      "See who links to you, your anchor text profile, and which links look toxic enough to disavow.",
    keyword: "free backlink checker",
    live: false,
    href: "/features/backlink-checker",
    linkLabel: "See backlink data",
  },
  {
    name: "Keyword Rank Checker",
    description:
      "Track where you rank for the keywords that matter, across devices, with position history and trend charts.",
    keyword: "keyword rank checker",
    live: false,
    href: "/features/rank-tracking",
    linkLabel: "See rank tracking",
  },
  {
    name: "Keyword Difficulty Checker",
    description:
      "Score how hard a keyword is to win before you write a word, with volume and intent beside it.",
    keyword: "keyword difficulty checker",
    live: false,
    href: "/features/keyword-research",
    linkLabel: "See keyword research",
  },
  {
    name: "SERP Preview",
    description:
      "Inspect the live results page for any keyword: who ranks, which features appear, and where you sit.",
    keyword: "serp preview tool",
    live: false,
    href: "/features/rank-tracking",
    linkLabel: "See SERP data",
  },
  {
    name: "Sitemap Validator",
    description:
      "Check your sitemap for broken URLs, redirects, and blocked pages before crawlers waste your budget.",
    keyword: "sitemap validator",
    live: false,
    href: "/features/site-audit",
    linkLabel: "See technical SEO",
  },
];

export const Route = createFileRoute("/_marketing/free-tools/")({
  head: () => ({
    ...buildPageSeo({
      title: "Free SEO Tools",
      description:
        "Free SEO tools built on live data: check your AI visibility, backlinks, rankings, and technical health. No sign-up required.",
      path: "/free-tools",
      titleSuffix: "SeoTool.im",
      imageAlt: "SeoTool.im free SEO tools",
    }),
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: FreeToolsIndexPage,
});

function FreeToolsIndexPage() {
  useScrollReveal();

  return (
    <div className="itc">
      <section className="ft-hero">
        <div className="itc-container">
          <p className="itc-eyebrow">Free tools</p>
          <h1 className="ft-hero-title">Free SEO tools, no sign-up</h1>
          <p className="ft-hero-sub">
            Real data from the same live engine that powers SeoTool.im. Start
            with the AI visibility checker, the one most suites still do not
            have.
          </p>
          <div
            className="ft-actions"
            style={{ justifyContent: "center", marginTop: 28 }}
          >
            <a
              className="itc-btn itc-btn-primary"
              href="/free-tools/ai-visibility-checker"
            >
              Check my AI visibility <span className="itc-arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      <section className="itc-section" style={{ paddingTop: 32 }}>
        <div className="itc-container">
          <div className="ft-grid">
            {TOOLS.map((tool, index) => (
              <div
                key={tool.name}
                className={`itc-card itc-reveal ${tool.live ? "" : "is-soon"}`}
                style={revealDelay(index % 3)}
              >
                <div className="ft-tool-head">
                  <p className="ft-tool-name" style={{ marginTop: 0 }}>
                    {tool.name}
                  </p>
                  <span
                    className={`ft-status-chip ${tool.live ? "ft-status-live" : ""}`}
                  >
                    {tool.live ? "Live" : "Coming soon"}
                  </span>
                </div>
                <p className="ft-tool-desc">{tool.description}</p>
                <span className="ft-tool-kw">targets: {tool.keyword}</span>
                <a className="ft-tool-link" href={tool.href}>
                  {tool.linkLabel} <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="itc-section" style={{ paddingTop: 0 }}>
        <div className="itc-container">
          <div className="ft-cta itc-reveal">
            <h2 className="itc-display-md">Every tool, one workspace</h2>
            <p className="ft-hero-sub" style={{ marginTop: 16 }}>
              The free tools cover one question each. SeoTool.im answers all of
              them, every day, for every project.
            </p>
            <div className="ft-actions" style={{ justifyContent: "center" }}>
              <a
                className="itc-btn itc-btn-primary itc-btn-lg"
                href="https://seotool.im/sign-up"
              >
                Start free <span className="itc-arrow">&rarr;</span>
              </a>
              <a
                className="itc-btn itc-btn-secondary itc-btn-lg"
                href="/pricing"
              >
                See pricing
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
