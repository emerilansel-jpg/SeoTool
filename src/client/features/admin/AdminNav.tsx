import { Link } from "@tanstack/react-router";

const ADMIN_TABS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/billing", label: "Billing" },
  { to: "/admin/pricing", label: "Pricing" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/api-keys", label: "API Keys" },
] as const;

export function AdminNav() {
  return (
    <div role="tablist" className="tabs tabs-border mb-6 w-full">
      {ADMIN_TABS.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          activeOptions={{ exact: true, includeSearch: false }}
          className="tab text-xs font-semibold"
          activeProps={{ className: "tab tab-active text-xs font-semibold" }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
