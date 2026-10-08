import { useState } from "react";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function BlogSidebar() {
  const [email, setEmail] = useState("");
  const [auditDomain, setAuditDomain] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing to our SEO newsletter!");
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditDomain) {
      toast.error("Please enter a domain or URL");
      return;
    }
    // Redirect to signup or tool
    window.location.href = `/sign-up?domain=${encodeURIComponent(auditDomain)}`;
  };

  return (
    <aside className="sticky top-24 hidden w-72 shrink-0 space-y-6 lg:block xl:w-80">
      {/* Widget 1: Newsletter Signup (Styled with website theme) */}
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-base-100 to-base-200/40 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-primary">
            <Sparkles className="size-3" />
            FREE WEEKLY
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug text-base-content">
          Get the newsletter 10,000+ search marketers rely on.
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-base-content/70">
          Actionable SEO teardowns, algorithm shift analysis, and search
          intelligence delivered straight to your inbox every Tuesday.
        </p>

        {subscribed ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-xs text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>You are subscribed. Check your inbox for confirmation.</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full rounded-xl border border-base-300 bg-base-200/50 px-3.5 py-2.5 text-xs text-base-content placeholder-base-content/40 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-content transition-colors hover:bg-primary/90 active:scale-[0.99]"
            >
              <span>Sign me up!</span>
              <ArrowRight className="size-3.5" />
            </button>
            <p className="text-[10px] text-base-content/50 text-center">
              No spam. Unsubscribe anytime with one click.
            </p>
          </form>
        )}
      </div>

      {/* Widget 2: Free SEO Audit CTA */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Instant Tool
        </span>
        <h3 className="mt-1 text-base font-bold text-base-content">
          Find Your SEO Issues in 30 Seconds
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-base-content/70">
          Analyze technical crawl errors, keyword rank opportunities, and dark
          query gaps without expensive subscriptions.
        </p>

        <form onSubmit={handleAuditSubmit} className="mt-4 space-y-2.5">
          <input
            type="text"
            value={auditDomain}
            onChange={(e) => setAuditDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="w-full rounded-xl border border-base-300 bg-base-200/50 px-3.5 py-2.5 text-xs text-base-content placeholder-base-content/40 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-content transition-colors hover:bg-primary/90"
          >
            <span>Audit My Site</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>

        <p className="mt-3 text-center text-[10px] text-base-content/50">
          Powered by SeoTool.im Open Source Engine
        </p>
      </div>
    </aside>
  );
}
