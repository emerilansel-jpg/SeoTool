import { useState, type FormEvent } from "react";

const SIGNUP_URL = "https://seotool.im/sign-up";

type CheckState =
  | { status: "idle" }
  | { status: "loading"; domain: string }
  | {
      status: "result";
      domain: string;
      mentions: number;
      aiSearchVolume: number;
      cached: boolean;
    }
  | {
      status: "error";
      message: string;
      fallbackSignup: boolean;
    };

type VisibilityTier = "zero" | "low" | "strong";

function tierFor(mentions: number): VisibilityTier {
  if (mentions === 0) return "zero";
  if (mentions < 10) return "low";
  return "strong";
}

const numberFormatter = new Intl.NumberFormat("en-US");

/**
 * Interactive body of the free AI visibility checker: the domain form plus
 * the idle / loading / result / error zone beneath it. Styling comes from
 * free-tools.css (page scope) and the shared .itc-urlbox form classes.
 */
export function AiVisibilityChecker() {
  const [domain, setDomain] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [state, setState] = useState<CheckState>({ status: "idle" });

  const isChecking = state.status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        body: JSON.stringify({ domain: trimmed }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        code?: string;
        domain?: string;
        mentions?: number;
        aiSearchVolume?: number;
        cached?: boolean;
      };
      if (!response.ok || !data.ok) {
        setState({
          status: "error",
          message:
            data.error ?? "The check failed. Please try again in a minute.",
          fallbackSignup: data.code === "unavailable",
        });
        return;
      }
      setState({
        status: "result",
        domain: data.domain ?? trimmed,
        mentions: data.mentions ?? 0,
        aiSearchVolume: data.aiSearchVolume ?? 0,
        cached: data.cached ?? false,
      });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
        fallbackSignup: false,
      });
    }
  }

  return (
    <div>
      <p className="ft-result-label" style={{ textAlign: "center" }}>
        Your domain
      </p>
      <form
        className="itc-urlbox ft-hero-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <input
          id="ft-domain"
          name="domain"
          className="itc-urlbox-input"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="yourdomain.com"
          value={domain}
          disabled={isChecking}
          onChange={(event) => setDomain(event.target.value)}
        />
        <button type="submit" className="itc-urlbox-btn" disabled={isChecking}>
          {isChecking ? "Checking..." : "Check my AI visibility"}
        </button>
      </form>
      <p className="itc-urlbox-note">
        Free instant check &middot; No sign-up &middot; No credit card
      </p>
      {fieldError ? (
        <p className="ft-error" role="alert" style={{ marginTop: 16 }}>
          {fieldError}
        </p>
      ) : null}

      <div className="ft-result-zone" role="status" aria-live="polite">
        {state.status === "idle" ? <IdleState /> : null}
        {state.status === "loading" ? (
          <LoadingState domain={state.domain} />
        ) : null}
        {state.status === "result" ? (
          <ResultState
            {...state}
            onReset={() => {
              setState({ status: "idle" });
              setDomain("");
              document.getElementById("ft-domain")?.focus();
            }}
          />
        ) : null}
        {state.status === "error" ? (
          <div className="ft-error">
            {state.message}
            {state.fallbackSignup ? (
              <>
                {" "}
                <a className="itc-textlink" href={SIGNUP_URL}>
                  Create a free account
                </a>{" "}
                to run a full AI visibility report.
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function IdleState() {
  return (
    <div className="ft-idle">
      <span className="itc-mono">AWAITING DOMAIN</span>
      Enter a domain above and run the check. Your verdict appears here in
      seconds.
    </div>
  );
}

function LoadingState({ domain }: { domain: string }) {
  return (
    <div className="ft-loading">
      <div className="ft-radar" aria-hidden="true">
        <div className="ft-radar-sweep" />
        <span className="ft-blip ft-blip-1" />
        <span className="ft-blip ft-blip-2" />
        <span className="ft-blip ft-blip-3" />
      </div>
      <div className="ft-chat" aria-hidden="true">
        <div className="ft-chat-head">
          <span className="ft-chat-dot" />
          chatgpt.com
        </div>
        <p className="ft-chat-q">"Who do you recommend for this?"</p>
        <div className="ft-chat-a">
          <div className="ft-scanline" />
          Scanning tracked ChatGPT answers for <strong>{domain}</strong>
        </div>
      </div>
    </div>
  );
}

function ResultState({
  domain,
  mentions,
  aiSearchVolume,
  cached,
  onReset,
}: {
  domain: string;
  mentions: number;
  aiSearchVolume: number;
  cached: boolean;
  onReset: () => void;
}) {
  const tier = tierFor(mentions);
  const signupHref = `${SIGNUP_URL}?domain=${encodeURIComponent(domain)}`;

  return (
    <div className="ft-result">
      <div className="ft-result-grid">
        <div className="ft-result-main">
          <p className="ft-result-label">
            ChatGPT answers citing <span className="itc-mono">{domain}</span>
          </p>
          <p className="ft-number">
            {numberFormatter.format(mentions)}
            <span className="ft-number-unit"> mentions</span>
          </p>
          <p className={`ft-verdict ft-verdict-${tier}`}>
            {tier === "zero" ? (
              <>
                <strong>ChatGPT never mentions {domain}.</strong> Your domain
                did not appear in any tracked AI answer, so buyers asking
                ChatGPT for recommendations will not hear about you.
              </>
            ) : null}
            {tier === "low" ? (
              <>
                <strong>Early traction.</strong> ChatGPT mentions {domain} in a
                small number of answers. Competitors likely take most
                recommendations today.
              </>
            ) : null}
            {tier === "strong" ? (
              <>
                <strong>Strong presence.</strong> ChatGPT recommends {domain}{" "}
                regularly across buyer questions. Protect the lead and expand
                it.
              </>
            ) : null}
          </p>
          <div className="ft-tier" aria-hidden="true">
            <span
              className={`ft-tier-seg ${tier === "zero" ? "on-zero" : ""}`}
            />
            <span className={`ft-tier-seg ${tier === "low" ? "on-low" : ""}`} />
            <span
              className={`ft-tier-seg ${tier === "strong" ? "on-strong" : ""}`}
            />
          </div>
          <div className="ft-tier-caption">
            <span>Not mentioned</span>
            <span>Getting cited</span>
            <span>Recommended</span>
          </div>
          {aiSearchVolume > 0 ? (
            <p className="ft-meta">
              Monthly AI search volume for these questions:{" "}
              <span className="itc-mono">
                {numberFormatter.format(aiSearchVolume)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="ft-result-side">
          <p className="ft-side-title">The full report adds</p>
          <ul className="ft-side-list">
            <li>Google AI Overviews mentions</li>
            <li>Competitor share of voice</li>
            <li>Every citing page and question</li>
            <li>Monthly trend history</li>
          </ul>
        </div>
      </div>

      <div className="ft-actions">
        <a className="itc-btn itc-btn-primary" href={signupHref}>
          Track my AI visibility free <span className="itc-arrow">&rarr;</span>
        </a>
        <button
          type="button"
          className="itc-btn itc-btn-secondary"
          onClick={onReset}
        >
          Check another domain
        </button>
      </div>
      <p className="ft-meta">
        Data: DataForSEO ChatGPT mentions database, US market
        {cached ? " &middot; cached result from the last 24 hours" : ""}
      </p>
    </div>
  );
}
