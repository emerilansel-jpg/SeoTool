import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";

const NAV_LINKS = [
  { label: "Features", href: "/#features", internal: false },
  { label: "Pricing", href: "/pricing", internal: true },
  { label: "Docs", href: "https://seotool.im/docs", internal: false },
  { label: "Blog", href: "https://seotool.im/blogs", internal: false },
  { label: "Changelog", href: "https://seotool.im/changelog", internal: false },
] as const;

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/pricing", internal: true },
      { label: "Features", href: "/#features", internal: false },
      { label: "Changelog", href: "https://seotool.im/changelog", internal: false },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "https://seotool.im/docs", internal: false },
      { label: "Blog", href: "https://seotool.im/blogs", internal: false },
      { label: "Guides", href: "https://seotool.im/guides", internal: false },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "https://seotool.im/privacy", internal: false },
      { label: "Terms of Service", href: "https://seotool.im/terms-and-conditions", internal: false },
      { label: "Refund Policy", href: "https://seotool.im/refund-policy", internal: false },
    ],
  },
] as const;

export function useMarketingSession() {
  const { data: session } = useSession();
  return { signedIn: Boolean(session?.user?.id) };
}

export function MarketingNavbar({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-black text-white transition-transform group-hover:scale-105">
            S
          </div>
          <span className="text-base font-bold tracking-tight text-base-content">
            SeoTool<span className="text-primary">.im</span>
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {NAV_LINKS.map((link) =>
            link.internal ? (
              <Link
                key={link.label}
                to={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link
              to="/projects"
              className="btn btn-sm gap-1.5 rounded-[10px] border-0 bg-base-200 font-semibold text-base-content transition-transform hover:scale-[1.03]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="btn btn-ghost btn-sm text-sm font-medium text-base-content/70 hover:text-base-content"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                search={{ redirect: "/subscribe" }}
                className="btn btn-sm rounded-[10px] border-0 bg-base-200 font-semibold text-base-content transition-transform hover:scale-[1.03]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-200/50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-5 md:px-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-[10px] font-black text-white">
              S
            </div>
            <span className="text-sm font-bold tracking-tight text-base-content">
              SeoTool.im
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-base-content/60">
            The unified SEO workspace. Live SERP intelligence, technical audits,
            backlink tracking, and autonomous AI agents.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-2.5 py-1 text-[11px] font-medium text-base-content/60">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
        {FOOTER_LINKS.map((group) => (
          <div key={group.heading} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              {group.heading}
            </h3>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.internal ? (
                    <Link
                      to={link.href}
                      className="text-sm text-base-content/60 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-base-content/60 transition-colors hover:text-primary"
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
      <div className="border-t border-base-300/80 bg-base-200/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-base-content/40 md:flex-row md:px-6">
          <p>&copy; {new Date().getFullYear()} SeoTool.im. All rights reserved.</p>
          <p className="text-base-content/30">
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
  announcement,
}: {
  signedIn: boolean;
  children: ReactNode;
  /** Optional campaign banner rendered above the navbar. */
  announcement?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-base-content selection:bg-primary/20 selection:text-primary">
      {announcement}
      <MarketingNavbar signedIn={signedIn} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
