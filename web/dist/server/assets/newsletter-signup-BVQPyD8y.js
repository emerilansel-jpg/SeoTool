import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || "Something went wrong"
        );
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };
  if (status === "success") {
    return /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-brand)]", children: "You're on the list." });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, autoComplete: "on", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "newsletter-email", className: "sr-only", children: "Email address" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "newsletter-email",
          name: "email",
          type: "email",
          autoComplete: "email",
          required: true,
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: "you@example.com",
          disabled: status === "loading",
          className: "h-10 min-w-0 flex-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-3 text-sm text-[var(--color-brand)] placeholder:text-[var(--color-brand-muted)] transition focus:border-[var(--color-brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: status === "loading",
          className: "h-10 shrink-0 rounded-lg bg-[var(--color-cta)] px-5 text-sm font-medium text-white transition-colors hover:bg-[#ff6a1f] disabled:opacity-50",
          children: status === "loading" ? "..." : "Subscribe"
        }
      )
    ] }),
    status === "error" && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-400", children: errorMessage })
  ] });
}
export {
  NewsletterSignup as N
};
