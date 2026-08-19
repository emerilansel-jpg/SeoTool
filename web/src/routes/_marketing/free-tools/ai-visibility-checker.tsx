import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { AiVisibilityChecker } from "@/components/ai-visibility-checker";
import { buildPageSeo } from "@/lib/seo";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import "@/components/landing-page.css";
import "@/components/free-tools.css";

/** Stagger index for .itc-reveal children (80ms per step). */
function revealDelay(index: number): CSSProperties {
  return { "--reveal-i": String(index) } as CSSProperties;
}

const FAQS = [
  {
    question: "Is the AI visibility checker really free?",
    answer:
      "Yes. The check runs against live ChatGPT mention data and costs you nothing: no account, no email, no credit card. We cache each domain for 24 hours and limit checks per visitor to keep it fast and free.",
  },
  {
    question: "What does the mentions number mean?",
    answer:
      "It counts how many tracked ChatGPT answers cite your domain as a source or recommendation. The data comes from DataForSEO's AI optimization database, which monitors real ChatGPT responses across the US market.",
  },
  {
    question: "Why does the free check only cover ChatGPT?",
    answer:
      "ChatGPT is the most used AI assistant for buying research, so it is where visibility matters first. The full report inside SeoTool.im adds Google AI Overviews mentions, competitor share of voice, every citing page, and monthly trends.",
  },
  {
    question: "How do I get mentioned by ChatGPT?",
    answer:
      "AI assistants cite pages that clearly answer buyer questions. Start with our guide How to appear in ChatGPT results: answer the questions your buyers ask, earn citations on pages AI models already trust, and keep your content fresh.",
  },
  {
    question: "How is this different from rank tracking?",
    answer:
      "Rank tracking shows where you sit in Google's list of links. AI visibility shows whether AI assistants recommend you at all, in answers that increasingly replace those lists. Serious SEO teams track both.",
  },
];

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

export const Route = createFileRoute(
  "/_marketing/free-tools/ai-visibility-checker",
)({
  head: () => ({
    ...buildPageSeo({
      title: "Free AI Visibility Checker: Is ChatGPT Mentioning You?",
      description:
        "Check if ChatGPT mentions your domain in the AI answers buyers read. Free instant check, no sign-up. See your mention count and how to improve it.",
      path: "/free-tools/ai-visibility-checker",
      titleSuffix: "SeoTool.im",
      imageAlt: "SeoTool.im AI Visibility Checker",
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
    scripts: [{ type: "application/ld+json", children: faqSchema }],
  }),
  component: AiVisibilityCheckerPage,
});

function AiVisibilityCheckerPage() {
  useScrollReveal();

  return (
    <div className="itc">
      <section className="ft-hero">
        <div className="itc-container">
          <p className="itc-eyebrow">Free tool</p>
          <h1 className="ft-hero-title">Is ChatGPT mentioning you?</h1>
          <p className="ft-hero-sub">
            Enter your domain and see how many ChatGPT answers cite it when
            buyers ask for recommendations. Free instant check, no sign-up.
          </p>
          <AiVisibilityChecker />
        </div>
      </section>

      <section className="itc-section">
        <div className="itc-container">
          <div className="ft-cols">
            <div className="ft-cols-copy itc-reveal">
              <p className="itc-eyebrow">What is AI visibility</p>
              <h2 className="itc-display-md" style={{ marginTop: 14 }}>
                AI answers decide the shortlist now
              </h2>
              <p style={{ marginTop: 18 }}>
                AI visibility, sometimes called GEO or generative engine
                optimization, measures whether AI assistants like ChatGPT
                mention your brand when people ask for recommendations. Those
                answers increasingly decide which products buyers shortlist, and
                they are not ranked like Google results. There is no position
                one to fight for. Your brand is either cited or absent.
              </p>
              <p>
                That makes visibility measurable and fixable. Mentions cluster
                around pages that answer buyer questions clearly, so improving
                starts with knowing where you stand. Run the check above, then
                work through{" "}
                <a className="itc-textlink" href="/library/ai-search-geo">
                  our guide to AI search optimization
                </a>{" "}
                or see how{" "}
                <a
                  className="itc-textlink"
                  href="/features/ai-brand-visibility"
                >
                  AI brand visibility tracking
                </a>{" "}
                works inside SeoTool.im.
              </p>
            </div>
            <div className="itc-reveal" style={revealDelay(1)}>
              <div className="ft-chat">
                <div className="ft-chat-head">
                  <span className="ft-chat-dot" />
                  chatgpt.com
                </div>
                <p className="ft-chat-q">
                  "What's the best SEO tool for a small agency?"
                </p>
                <div className="ft-chat-a">
                  For a small agency, <strong>SeoTool.im</strong> covers audits,
                  rank tracking, and AI visibility in one plan.{" "}
                  <span className="ft-cite">Ahrefs</span> is stronger for deep
                  backlink research, and{" "}
                  <span className="ft-cite">Mangools</span> fits solo marketers
                  on a tight budget.
                </div>
              </div>
              <p className="ft-tool-kw" style={{ marginTop: 12 }}>
                ChatGPT answers recommend a shortlist of brands. The free check
                tells you if you are on it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="itc-section" style={{ paddingTop: 0 }}>
        <div className="itc-container">
          <p className="itc-eyebrow itc-reveal">How it works</p>
          <h2 className="itc-display-md itc-reveal" style={{ marginTop: 14 }}>
            A real answer in three steps
          </h2>
          <div className="ft-steps" style={{ marginTop: 32 }}>
            <div className="itc-card itc-reveal">
              <p className="ft-step-num">01</p>
              <p className="ft-step-title">Enter your domain</p>
              <p className="ft-step-body">
                Type the domain you want to check. No account, no email, no
                credit card.
              </p>
            </div>
            <div className="itc-card itc-reveal" style={revealDelay(1)}>
              <p className="ft-step-num">02</p>
              <p className="ft-step-title">We query live AI data</p>
              <p className="ft-step-body">
                Your check runs against DataForSEO's ChatGPT mentions database,
                the same source that powers the full SeoTool.im report.
              </p>
            </div>
            <div className="itc-card itc-reveal" style={revealDelay(2)}>
              <p className="ft-step-num">03</p>
              <p className="ft-step-title">Read your verdict</p>
              <p className="ft-step-body">
                See your mention count, the monthly AI search volume behind it,
                and what to do next. Save a full report to track it over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="itc-section" style={{ paddingTop: 0 }}>
        <div className="itc-container">
          <p className="itc-eyebrow itc-reveal">Free check vs full report</p>
          <h2 className="itc-display-md itc-reveal" style={{ marginTop: 14 }}>
            Start free, go deeper inside
          </h2>
          <div className="ft-compare" style={{ marginTop: 32 }}>
            <div className="ft-compare-col itc-reveal">
              <p className="ft-compare-title">Free check</p>
              <ul className="ft-compare-list">
                <li data-mark="+">ChatGPT mention count for your domain</li>
                <li data-mark="+">Monthly AI search volume</li>
                <li data-mark="+">Instant result, no account</li>
                <li data-mark="+">Refreshed every 24 hours</li>
              </ul>
            </div>
            <div
              className="ft-compare-col is-full itc-reveal"
              style={revealDelay(1)}
            >
              <p className="ft-compare-title">Full report in SeoTool.im</p>
              <ul className="ft-compare-list">
                <li>Google AI Overviews mentions</li>
                <li>Competitor share of voice</li>
                <li>Every citing page and question</li>
                <li>Monthly trend history and alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="itc-section" style={{ paddingTop: 0 }}>
        <div className="itc-container">
          <p className="itc-eyebrow itc-reveal">FAQ</p>
          <h2 className="itc-display-md itc-reveal" style={{ marginTop: 14 }}>
            Questions people ask
          </h2>
          <div className="ft-faq" style={{ marginTop: 32 }}>
            {FAQS.map((faq) => (
              <div className="ft-faq-item itc-reveal" key={faq.question}>
                <p className="ft-faq-q">{faq.question}</p>
                <p className="ft-faq-a">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="itc-section" style={{ paddingTop: 0 }}>
        <div className="itc-container">
          <div className="ft-cta itc-reveal">
            <h2 className="itc-display-md">See the whole picture</h2>
            <p className="ft-hero-sub" style={{ marginTop: 16 }}>
              Google rankings and AI mentions in one workspace, from a free
              plan.
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
                href="/features/ai-brand-visibility"
              >
                See AI brand visibility
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
