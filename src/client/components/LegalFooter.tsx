/**
 * Legal links footer. The legal content lives on the marketing site
 * (seotool.im), served as fumadocs pages. Shown in the hosted SaaS app so the
 * full legal set (not just Terms + Privacy on signup) is reachable in-product.
 */
const LEGAL_BASE_URL = "https://seotool.im";

const LEGAL_LINKS: { label: string; path: string }[] = [
  { label: "Terms", path: "/terms-and-conditions" },
  { label: "Privacy", path: "/privacy" },
  { label: "DPA", path: "/dpa" },
  { label: "Cookies", path: "/cookie-policy" },
  { label: "Refunds", path: "/refund-policy" },
];

export function LegalFooter({ className }: { className?: string }) {
  return (
    <footer
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-base-content/40 ${className ?? ""}`}
    >
      {LEGAL_LINKS.map((link) => (
        <a
          key={link.path}
          href={`${LEGAL_BASE_URL}${link.path}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-base-content/70 transition-colors"
        >
          {link.label}
        </a>
      ))}
    </footer>
  );
}
