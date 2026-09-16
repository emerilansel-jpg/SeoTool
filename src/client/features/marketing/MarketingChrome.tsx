import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const NAV_LINKS = [
  { label: "Features", href: "/#features", internal: false },
  { label: "Pricing", href: "/pricing", internal: true },
  { label: "Docs", href: "/docs", internal: false },
  { label: "Blog", href: "/blogs", internal: true },
  { label: "Changelog", href: "/changelog", internal: true },
] as const;

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/pricing", internal: true },
      { label: "Features", href: "/#features", internal: false },
      {
        label: "Changelog",
        href: "/changelog",
        internal: true,
      },
    ],
  },
  {
    heading: "Resources",
    links: [
      {
        label: "Documentation",
        href: "/docs",
        internal: false,
      },
      { label: "Blog", href: "/blogs", internal: true },
      { label: "Guides", href: "/guides", internal: false },
    ],
  },
  {
    heading: "Legal",
    links: [
      {
        label: "Privacy Policy",
        href: "/privacy",
        internal: true,
      },
      {
        label: "Terms of Service",
        href: "/terms-and-conditions",
        internal: true,
      },
      {
        label: "Refund Policy",
        href: "/refund-policy",
        internal: true,
      },
    ],
  },
] as const;

export function useMarketingSession() {
  const { data: session } = useSession();
  return { signedIn: Boolean(session?.user?.id) };
}

export function MarketingNavbar({ signedIn }: { signedIn: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <img
            src="/logo.png"
            alt="SeoTool.im"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105 dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="SeoTool.im"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105 hidden dark:block"
          />
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
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
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

          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square md:hidden text-base-content/80 hover:text-base-content"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-base-300 bg-base-100 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) =>
              link.internal ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-base-content/80 transition-colors hover:bg-base-200 hover:text-base-content"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-base-content/80 transition-colors hover:bg-base-200 hover:text-base-content"
                >
                  {link.label}
                </a>
              ),
            )}

            <div className="mt-2 flex flex-col gap-2 border-t border-base-300 pt-3 sm:hidden">
              {signedIn ? (
                <Link
                  to="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-sm w-full rounded-lg bg-base-200 font-semibold text-base-content"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-outline btn-sm w-full rounded-lg text-base-content/80"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/sign-up"
                    search={{ redirect: "/subscribe" }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary btn-sm w-full rounded-lg font-semibold text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-200/50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-5 md:px-6">
        <div className="md:col-span-2 space-y-3">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="SeoTool.im"
              className="h-7 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="SeoTool.im"
              className="h-7 w-auto object-contain hidden dark:block"
            />
          </Link>
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
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
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
          <p>
            &copy; {new Date().getFullYear()} SeoTool.im. All rights reserved.
          </p>
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
