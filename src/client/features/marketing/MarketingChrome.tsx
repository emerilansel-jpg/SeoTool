import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/pricing", internal: true },
      { label: "Keyword Research", href: "/#features", internal: false },
      { label: "Site Audit", href: "/#features", internal: false },
      { label: "AI Visibility", href: "/#features", internal: false },
    ],
  },
  {
    heading: "Resources",
    links: [
      {
        label: "Documentation",
        href: "https://seotool.im/docs",
        internal: false,
      },
      { label: "Blog", href: "https://seotool.im/blog", internal: false },
      {
        label: "Changelog",
        href: "https://seotool.im/changelog",
        internal: false,
      },
    ],
  },
  {
    heading: "Legal",
    links: [
      {
        label: "Privacy Policy",
        href: "https://seotool.im/privacy",
        internal: false,
      },
      {
        label: "Terms of Service",
        href: "https://seotool.im/terms-and-conditions",
        internal: false,
      },
      {
        label: "Refund Policy",
        href: "https://seotool.im/refund-policy",
        internal: false,
      },
    ],
  },
] as const;

export function useMarketingSession() {
  const { data: session } = useSession();
  return { signedIn: Boolean(session?.user?.id) };
}

export function MarketingNavbar({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300/80 bg-base-100/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-indigo-600 to-cyan-400 text-sm font-black text-white shadow-sm shadow-primary/30 transition-transform group-hover:scale-105">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">
              SeoTool<span className="text-primary font-black">.im</span>
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/pricing"
            className="btn btn-ghost btn-sm text-sm font-medium text-base-content/80 hover:text-base-content"
          >
            Pricing
          </Link>
          {signedIn ? (
            <Link
              to="/projects"
              className="btn btn-primary btn-sm gap-1.5 shadow-sm shadow-primary/20"
            >
              Dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="btn btn-ghost btn-sm text-sm font-medium text-base-content/80 hover:text-base-content"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                search={{ redirect: "/subscribe" }}
                className="btn btn-primary btn-sm gap-1.5 shadow-sm shadow-primary/25"
              >
                Get started
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-200/60 transition-colors">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-5 md:px-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-400 text-xs font-bold text-white shadow-sm shadow-primary/20">
              S
            </div>
            <span className="text-base font-bold tracking-tight text-base-content">
              SeoTool.im
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-base-content/65">
            The next-generation SEO command center. Live SERP intelligence,
            technical audits, backlink tracking, and autonomous AI SEO agents.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-2.5 py-1 text-[11px] font-medium text-base-content/70">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
        {FOOTER_LINKS.map((group) => (
          <div key={group.heading} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
              {group.heading}
            </h3>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.internal ? (
                    <Link
                      to={link.href}
                      className="text-sm text-base-content/70 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-base-content/70 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-base-300/80 bg-base-200/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-base-content/50 md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} SeoTool.im. All rights reserved.</p>
          <p className="text-base-content/40">
            Built for high-performance organic growth.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Shared page shell for public marketing pages. */
export function MarketingChrome({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-base-content selection:bg-primary/20 selection:text-primary">
      <MarketingNavbar signedIn={signedIn} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
