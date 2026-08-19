import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { aj as FAQS } from "./router-D7vvO90Q.js";
import { useState } from "react";
import { u as useScrollReveal } from "./use-scroll-reveal-3tW9VM4j.js";
import "@tanstack/react-router";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
const SIGNUP_URL = "https://seotool.im/sign-up";
function tierFor(mentions) {
  if (mentions === 0) return "zero";
  if (mentions < 10) return "low";
  return "strong";
}
const numberFormatter = new Intl.NumberFormat("en-US");
function AiVisibilityChecker() {
  const [domain, setDomain] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [state, setState] = useState({ status: "idle" });
  const isChecking = state.status === "loading";
  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = domain.trim();
    if (!trimmed) {
      setFieldError("Enter a domain like yourdomain.com");
      return;
    }
    setFieldError(null);
    setState({ status: "loading", domain: trimmed });
    try {
      const response = await fetch("/api/ai-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setState({
          status: "error",
          message: data.error ?? "The check failed. Please try again in a minute.",
          fallbackSignup: data.code === "unavailable"
        });
        return;
      }
      setState({
        status: "result",
        domain: data.domain ?? trimmed,
        mentions: data.mentions ?? 0,
        aiSearchVolume: data.aiSearchVolume ?? 0,
        cached: data.cached ?? false
      });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
        fallbackSignup: false
      });
    }
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "ft-result-label", style: { textAlign: "center" }, children: "Your domain" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: "itc-urlbox ft-hero-form",
        onSubmit: handleSubmit,
        noValidate: true,
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "ft-domain",
              name: "domain",
              className: "itc-urlbox-input",
              type: "text",
              inputMode: "url",
              autoComplete: "url",
              placeholder: "yourdomain.com",
              value: domain,
              disabled: isChecking,
              onChange: (event) => setDomain(event.target.value)
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "itc-urlbox-btn", disabled: isChecking, children: isChecking ? "Checking..." : "Check my AI visibility" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "itc-urlbox-note", children: "Free instant check · No sign-up · No credit card" }),
    fieldError ? /* @__PURE__ */ jsx("p", { className: "ft-error", role: "alert", style: { marginTop: 16 }, children: fieldError }) : null,
    /* @__PURE__ */ jsxs("div", { className: "ft-result-zone", role: "status", "aria-live": "polite", children: [
      state.status === "idle" ? /* @__PURE__ */ jsx(IdleState, {}) : null,
      state.status === "loading" ? /* @__PURE__ */ jsx(LoadingState, { domain: state.domain }) : null,
      state.status === "result" ? /* @__PURE__ */ jsx(
        ResultState,
        {
          ...state,
          onReset: () => {
            setState({ status: "idle" });
            setDomain("");
            document.getElementById("ft-domain")?.focus();
          }
        }
      ) : null,
      state.status === "error" ? /* @__PURE__ */ jsxs("div", { className: "ft-error", children: [
        state.message,
        state.fallbackSignup ? /* @__PURE__ */ jsxs(Fragment, { children: [
          " ",
          /* @__PURE__ */ jsx("a", { className: "itc-textlink", href: SIGNUP_URL, children: "Create a free account" }),
          " ",
          "to run a full AI visibility report."
        ] }) : null
      ] }) : null
    ] })
  ] });
}
function IdleState() {
  return /* @__PURE__ */ jsxs("div", { className: "ft-idle", children: [
    /* @__PURE__ */ jsx("span", { className: "itc-mono", children: "AWAITING DOMAIN" }),
    "Enter a domain above and run the check. Your verdict appears here in seconds."
  ] });
}
function LoadingState({ domain }) {
  return /* @__PURE__ */ jsxs("div", { className: "ft-loading", children: [
    /* @__PURE__ */ jsxs("div", { className: "ft-radar", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "ft-radar-sweep" }),
      /* @__PURE__ */ jsx("span", { className: "ft-blip ft-blip-1" }),
      /* @__PURE__ */ jsx("span", { className: "ft-blip ft-blip-2" }),
      /* @__PURE__ */ jsx("span", { className: "ft-blip ft-blip-3" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ft-chat", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsxs("div", { className: "ft-chat-head", children: [
        /* @__PURE__ */ jsx("span", { className: "ft-chat-dot" }),
        "chatgpt.com"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "ft-chat-q", children: '"Who do you recommend for this?"' }),
      /* @__PURE__ */ jsxs("div", { className: "ft-chat-a", children: [
        /* @__PURE__ */ jsx("div", { className: "ft-scanline" }),
        "Scanning tracked ChatGPT answers for ",
        /* @__PURE__ */ jsx("strong", { children: domain })
      ] })
    ] })
  ] });
}
function ResultState({
  domain,
  mentions,
  aiSearchVolume,
  cached,
  onReset
}) {
  const tier = tierFor(mentions);
  const signupHref = `${SIGNUP_URL}?domain=${encodeURIComponent(domain)}`;
  return /* @__PURE__ */ jsxs("div", { className: "ft-result", children: [
    /* @__PURE__ */ jsxs("div", { className: "ft-result-grid", children: [
      /* @__PURE__ */ jsxs("div", { className: "ft-result-main", children: [
        /* @__PURE__ */ jsxs("p", { className: "ft-result-label", children: [
          "ChatGPT answers citing ",
          /* @__PURE__ */ jsx("span", { className: "itc-mono", children: domain })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "ft-number", children: [
          numberFormatter.format(mentions),
          /* @__PURE__ */ jsx("span", { className: "ft-number-unit", children: " mentions" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: `ft-verdict ft-verdict-${tier}`, children: [
          tier === "zero" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              "ChatGPT never mentions ",
              domain,
              "."
            ] }),
            " Your domain did not appear in any tracked AI answer, so buyers asking ChatGPT for recommendations will not hear about you."
          ] }) : null,
          tier === "low" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("strong", { children: "Early traction." }),
            " ChatGPT mentions ",
            domain,
            " in a small number of answers. Competitors likely take most recommendations today."
          ] }) : null,
          tier === "strong" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("strong", { children: "Strong presence." }),
            " ChatGPT recommends ",
            domain,
            " ",
            "regularly across buyer questions. Protect the lead and expand it."
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ft-tier", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `ft-tier-seg ${tier === "zero" ? "on-zero" : ""}`
            }
          ),
          /* @__PURE__ */ jsx("span", { className: `ft-tier-seg ${tier === "low" ? "on-low" : ""}` }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `ft-tier-seg ${tier === "strong" ? "on-strong" : ""}`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ft-tier-caption", children: [
          /* @__PURE__ */ jsx("span", { children: "Not mentioned" }),
          /* @__PURE__ */ jsx("span", { children: "Getting cited" }),
          /* @__PURE__ */ jsx("span", { children: "Recommended" })
        ] }),
        aiSearchVolume > 0 ? /* @__PURE__ */ jsxs("p", { className: "ft-meta", children: [
          "Monthly AI search volume for these questions:",
          " ",
          /* @__PURE__ */ jsx("span", { className: "itc-mono", children: numberFormatter.format(aiSearchVolume) })
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ft-result-side", children: [
        /* @__PURE__ */ jsx("p", { className: "ft-side-title", children: "The full report adds" }),
        /* @__PURE__ */ jsxs("ul", { className: "ft-side-list", children: [
          /* @__PURE__ */ jsx("li", { children: "Google AI Overviews mentions" }),
          /* @__PURE__ */ jsx("li", { children: "Competitor share of voice" }),
          /* @__PURE__ */ jsx("li", { children: "Every citing page and question" }),
          /* @__PURE__ */ jsx("li", { children: "Monthly trend history" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ft-actions", children: [
      /* @__PURE__ */ jsxs("a", { className: "itc-btn itc-btn-primary", href: signupHref, children: [
        "Track my AI visibility free ",
        /* @__PURE__ */ jsx("span", { className: "itc-arrow", children: "→" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "itc-btn itc-btn-secondary",
          onClick: onReset,
          children: "Check another domain"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "ft-meta", children: [
      "Data: DataForSEO ChatGPT mentions database, US market",
      cached ? " &middot; cached result from the last 24 hours" : ""
    ] })
  ] });
}
function revealDelay(index) {
  return {
    "--reveal-i": String(index)
  };
}
function AiVisibilityCheckerPage() {
  useScrollReveal();
  return /* @__PURE__ */ jsxs("div", { className: "itc", children: [
    /* @__PURE__ */ jsx("section", { className: "ft-hero", children: /* @__PURE__ */ jsxs("div", { className: "itc-container", children: [
      /* @__PURE__ */ jsx("p", { className: "itc-eyebrow", children: "Free tool" }),
      /* @__PURE__ */ jsx("h1", { className: "ft-hero-title", children: "Is ChatGPT mentioning you?" }),
      /* @__PURE__ */ jsx("p", { className: "ft-hero-sub", children: "Enter your domain and see how many ChatGPT answers cite it when buyers ask for recommendations. Free instant check, no sign-up." }),
      /* @__PURE__ */ jsx(AiVisibilityChecker, {})
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "itc-section", children: /* @__PURE__ */ jsx("div", { className: "itc-container", children: /* @__PURE__ */ jsxs("div", { className: "ft-cols", children: [
      /* @__PURE__ */ jsxs("div", { className: "ft-cols-copy itc-reveal", children: [
        /* @__PURE__ */ jsx("p", { className: "itc-eyebrow", children: "What is AI visibility" }),
        /* @__PURE__ */ jsx("h2", { className: "itc-display-md", style: {
          marginTop: 14
        }, children: "AI answers decide the shortlist now" }),
        /* @__PURE__ */ jsx("p", { style: {
          marginTop: 18
        }, children: "AI visibility, sometimes called GEO or generative engine optimization, measures whether AI assistants like ChatGPT mention your brand when people ask for recommendations. Those answers increasingly decide which products buyers shortlist, and they are not ranked like Google results. There is no position one to fight for. Your brand is either cited or absent." }),
        /* @__PURE__ */ jsxs("p", { children: [
          "That makes visibility measurable and fixable. Mentions cluster around pages that answer buyer questions clearly, so improving starts with knowing where you stand. Run the check above, then work through",
          " ",
          /* @__PURE__ */ jsx("a", { className: "itc-textlink", href: "/library/ai-search-geo", children: "our guide to AI search optimization" }),
          " ",
          "or see how",
          " ",
          /* @__PURE__ */ jsx("a", { className: "itc-textlink", href: "/features/ai-brand-visibility", children: "AI brand visibility tracking" }),
          " ",
          "works inside SeoTool.im."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "itc-reveal", style: revealDelay(1), children: [
        /* @__PURE__ */ jsxs("div", { className: "ft-chat", children: [
          /* @__PURE__ */ jsxs("div", { className: "ft-chat-head", children: [
            /* @__PURE__ */ jsx("span", { className: "ft-chat-dot" }),
            "chatgpt.com"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "ft-chat-q", children: `"What's the best SEO tool for a small agency?"` }),
          /* @__PURE__ */ jsxs("div", { className: "ft-chat-a", children: [
            "For a small agency, ",
            /* @__PURE__ */ jsx("strong", { children: "SeoTool.im" }),
            " covers audits, rank tracking, and AI visibility in one plan.",
            " ",
            /* @__PURE__ */ jsx("span", { className: "ft-cite", children: "Ahrefs" }),
            " is stronger for deep backlink research, and",
            " ",
            /* @__PURE__ */ jsx("span", { className: "ft-cite", children: "Mangools" }),
            " fits solo marketers on a tight budget."
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "ft-tool-kw", style: {
          marginTop: 12
        }, children: "ChatGPT answers recommend a shortlist of brands. The free check tells you if you are on it." })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "itc-section", style: {
      paddingTop: 0
    }, children: /* @__PURE__ */ jsxs("div", { className: "itc-container", children: [
      /* @__PURE__ */ jsx("p", { className: "itc-eyebrow itc-reveal", children: "How it works" }),
      /* @__PURE__ */ jsx("h2", { className: "itc-display-md itc-reveal", style: {
        marginTop: 14
      }, children: "A real answer in three steps" }),
      /* @__PURE__ */ jsxs("div", { className: "ft-steps", style: {
        marginTop: 32
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "itc-card itc-reveal", children: [
          /* @__PURE__ */ jsx("p", { className: "ft-step-num", children: "01" }),
          /* @__PURE__ */ jsx("p", { className: "ft-step-title", children: "Enter your domain" }),
          /* @__PURE__ */ jsx("p", { className: "ft-step-body", children: "Type the domain you want to check. No account, no email, no credit card." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "itc-card itc-reveal", style: revealDelay(1), children: [
          /* @__PURE__ */ jsx("p", { className: "ft-step-num", children: "02" }),
          /* @__PURE__ */ jsx("p", { className: "ft-step-title", children: "We query live AI data" }),
          /* @__PURE__ */ jsx("p", { className: "ft-step-body", children: "Your check runs against DataForSEO's ChatGPT mentions database, the same source that powers the full SeoTool.im report." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "itc-card itc-reveal", style: revealDelay(2), children: [
          /* @__PURE__ */ jsx("p", { className: "ft-step-num", children: "03" }),
          /* @__PURE__ */ jsx("p", { className: "ft-step-title", children: "Read your verdict" }),
          /* @__PURE__ */ jsx("p", { className: "ft-step-body", children: "See your mention count, the monthly AI search volume behind it, and what to do next. Save a full report to track it over time." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "itc-section", style: {
      paddingTop: 0
    }, children: /* @__PURE__ */ jsxs("div", { className: "itc-container", children: [
      /* @__PURE__ */ jsx("p", { className: "itc-eyebrow itc-reveal", children: "Free check vs full report" }),
      /* @__PURE__ */ jsx("h2", { className: "itc-display-md itc-reveal", style: {
        marginTop: 14
      }, children: "Start free, go deeper inside" }),
      /* @__PURE__ */ jsxs("div", { className: "ft-compare", style: {
        marginTop: 32
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "ft-compare-col itc-reveal", children: [
          /* @__PURE__ */ jsx("p", { className: "ft-compare-title", children: "Free check" }),
          /* @__PURE__ */ jsxs("ul", { className: "ft-compare-list", children: [
            /* @__PURE__ */ jsx("li", { "data-mark": "+", children: "ChatGPT mention count for your domain" }),
            /* @__PURE__ */ jsx("li", { "data-mark": "+", children: "Monthly AI search volume" }),
            /* @__PURE__ */ jsx("li", { "data-mark": "+", children: "Instant result, no account" }),
            /* @__PURE__ */ jsx("li", { "data-mark": "+", children: "Refreshed every 24 hours" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ft-compare-col is-full itc-reveal", style: revealDelay(1), children: [
          /* @__PURE__ */ jsx("p", { className: "ft-compare-title", children: "Full report in SeoTool.im" }),
          /* @__PURE__ */ jsxs("ul", { className: "ft-compare-list", children: [
            /* @__PURE__ */ jsx("li", { children: "Google AI Overviews mentions" }),
            /* @__PURE__ */ jsx("li", { children: "Competitor share of voice" }),
            /* @__PURE__ */ jsx("li", { children: "Every citing page and question" }),
            /* @__PURE__ */ jsx("li", { children: "Monthly trend history and alerts" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "itc-section", style: {
      paddingTop: 0
    }, children: /* @__PURE__ */ jsxs("div", { className: "itc-container", children: [
      /* @__PURE__ */ jsx("p", { className: "itc-eyebrow itc-reveal", children: "FAQ" }),
      /* @__PURE__ */ jsx("h2", { className: "itc-display-md itc-reveal", style: {
        marginTop: 14
      }, children: "Questions people ask" }),
      /* @__PURE__ */ jsx("div", { className: "ft-faq", style: {
        marginTop: 32
      }, children: FAQS.map((faq) => /* @__PURE__ */ jsxs("div", { className: "ft-faq-item itc-reveal", children: [
        /* @__PURE__ */ jsx("p", { className: "ft-faq-q", children: faq.question }),
        /* @__PURE__ */ jsx("p", { className: "ft-faq-a", children: faq.answer })
      ] }, faq.question)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "itc-section", style: {
      paddingTop: 0
    }, children: /* @__PURE__ */ jsx("div", { className: "itc-container", children: /* @__PURE__ */ jsxs("div", { className: "ft-cta itc-reveal", children: [
      /* @__PURE__ */ jsx("h2", { className: "itc-display-md", children: "See the whole picture" }),
      /* @__PURE__ */ jsx("p", { className: "ft-hero-sub", style: {
        marginTop: 16
      }, children: "Google rankings and AI mentions in one workspace, from a free plan." }),
      /* @__PURE__ */ jsxs("div", { className: "ft-actions", style: {
        justifyContent: "center"
      }, children: [
        /* @__PURE__ */ jsxs("a", { className: "itc-btn itc-btn-primary itc-btn-lg", href: "https://seotool.im/sign-up", children: [
          "Start free ",
          /* @__PURE__ */ jsx("span", { className: "itc-arrow", children: "→" })
        ] }),
        /* @__PURE__ */ jsx("a", { className: "itc-btn itc-btn-secondary itc-btn-lg", href: "/features/ai-brand-visibility", children: "See AI brand visibility" })
      ] })
    ] }) }) })
  ] });
}
export {
  AiVisibilityCheckerPage as component
};
