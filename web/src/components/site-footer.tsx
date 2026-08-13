import { Link } from "@tanstack/react-router";
import { featureGroups } from "@/lib/feature-pages";

const featureLinks = featureGroups.flatMap((group) =>
  group.pages.map((page) => ({
    label: page.eyebrow,
    href: `/features/${page.slug}`,
  })),
);

export function SiteFooter({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Link to="/" className="text-sm font-semibold text-neutral-900">
        SeoTool.im
      </Link>

      <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-5">
        <div>
          <p className="font-semibold text-neutral-900">Features</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {featureLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            <Link to="/features">All features</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral-900">AI agents</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link to="/features/mcp">SeoTool.im MCP</Link>
            <Link to="/google-search-console-mcp">
              Google Search Console MCP
            </Link>
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral-900">Resources</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link to="/changelog">Changelog</Link>
            <Link to="/open-source-seo">Why Open Source?</Link>
            <Link to="/blogs">Blog</Link>
            <a href="/docs">Docs</a>
            <a href="/docs/skills">Skills</a>
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral-900">Company</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link to="/about">About</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/affiliates">Affiliates</Link>
            <a
              href="https://github.com/emerilansel-jpg/SeoTool"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://discord.gg/c9uGs3cFXr"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral-900">Legal</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms of Service</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <Link to="/dpa">Data Processing (DPA)</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
