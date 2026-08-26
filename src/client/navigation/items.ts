import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  Bot,
  Bug,
  ClipboardCheck,
  FileCode,
  FileCheck,
  Globe,
  LayoutDashboard,
  Layers,
  Link2,
  MessageSquare,
  FileText,
  Search,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
  MapPin,
  Target,
  Waypoints,
  SearchCheck,
} from "lucide-react";
import { linkOptions } from "@tanstack/react-router";
import { GoogleGlyphMuted } from "@/client/features/gsc/GoogleGlyph";

const projectNavItems = [
  {
    to: "/p/$projectId" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
    // Without exact matching, the index path is a prefix of every project
    // route and the Dashboard item would render active everywhere.
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    to: "/p/$projectId/keywords" as const,
    label: "Keyword Research",
    icon: Search,
  },
  {
    to: "/p/$projectId/keyword-research-pro" as const,
    label: "Keyword Research Pro",
    icon: SearchCheck,
  },
  {
    to: "/p/$projectId/saved" as const,
    label: "Saved Keywords",
    icon: Bookmark,
  },
  {
    to: "/p/$projectId/rank-tracking" as const,
    label: "Rank Tracking",
    icon: TrendingUp,
  },
  {
    to: "/p/$projectId/gmb-grid" as const,
    label: "Local Map Rank",
    icon: MapPin,
  },
  {
    to: "/p/$projectId/search-performance" as const,
    label: "GSC Insights",
    icon: GoogleGlyphMuted,
  },
  {
    to: "/p/$projectId/ga4-insights" as const,
    label: "GA4 Insights",
    icon: BarChart3,
  },
  {
    to: "/p/$projectId/domain" as const,
    label: "Domain Overview",
    icon: Globe,
  },
  {
    to: "/p/$projectId/backlinks" as const,
    label: "Backlinks",
    icon: Link2,
  },
  {
    to: "/p/$projectId/audit" as const,
    label: "Site Audit",
    icon: ClipboardCheck,
  },
  {
    to: "/p/$projectId/content-gap" as const,
    label: "Content Gap",
    icon: Swords,
  },
  {
    to: "/p/$projectId/strategy" as const,
    label: "Content Strategy",
    icon: Target,
  },
  {
    to: "/p/$projectId/brand-lookup" as const,
    label: "Brand Lookup",
    icon: Sparkles,
  },
  {
    to: "/p/$projectId/prompt-explorer" as const,
    label: "Prompt Explorer",
    icon: MessageSquare,
  },
  {
    to: "/p/$projectId/reports" as const,
    label: "Reports",
    icon: FileText,
  },
  {
    to: "/p/$projectId/alerts" as const,
    label: "Alerts",
    icon: Bell,
  },
  {
    to: "/p/$projectId/sitemap-validator" as const,
    label: "Sitemap Validator",
    icon: FileCode,
  },
  {
    to: "/p/$projectId/on-page-checker" as const,
    label: "On-Page SEO",
    icon: FileCheck,
  },
  {
    to: "/p/$projectId/keyword-clustering" as const,
    label: "Keyword Clustering",
    icon: Layers,
  },
  {
    to: "/p/$projectId/link-intersect" as const,
    label: "Link Intersect",
    icon: Waypoints,
  },
  {
    to: "/p/$projectId/crawl-budget" as const,
    label: "Crawl Budget",
    icon: Bug,
  },
  {
    to: "/p/$projectId/serp-volatility" as const,
    label: "SERP Volatility",
    icon: Activity,
  },
] as const;

const aiNavItem = linkOptions({
  to: "/ai" as const,
  label: "AI & MCP",
  icon: Bot,
});

// Always-visible sidebar group (not project-scoped, unlike the groups below).
export const connectNavGroup = {
  label: "Connect",
  items: [aiNavItem],
};

// Platform-admin group. Rendered conditionally by the Sidebar when the
// current user passes the platform-admin check (env allowlist).
export const adminNavGroup = {
  label: "Admin",
  items: [linkOptions({ to: "/admin" as const, label: "Admin", icon: Shield })],
};

function getProjectNavItems(projectId: string) {
  return linkOptions(
    projectNavItems.map((item) => ({
      ...item,
      params: { projectId },
      search: {},
    })),
  );
}

// Grouped by function: Overview, Keywords & Ranking, Site & Audit, Competitors & Links, Strategy & Reports
export function getProjectNavGroups(projectId: string) {
  const all = getProjectNavItems(projectId);
  const byPath = (path: (typeof projectNavItems)[number]["to"]) =>
    all.find((i) => i.to === path)!;

  return [
    {
      label: "Overview",
      items: [byPath("/p/$projectId")],
    },
    {
      label: "Keywords & Ranking",
      items: [
        byPath("/p/$projectId/keywords"),
        byPath("/p/$projectId/keyword-research-pro"),
        byPath("/p/$projectId/saved"),
        byPath("/p/$projectId/rank-tracking"),
        byPath("/p/$projectId/gmb-grid"),
        byPath("/p/$projectId/keyword-clustering"),
      ],
    },
    {
      label: "Site & Audit",
      items: [
        byPath("/p/$projectId/audit"),
        byPath("/p/$projectId/search-performance"),
        byPath("/p/$projectId/ga4-insights"),
        byPath("/p/$projectId/on-page-checker"),
        byPath("/p/$projectId/sitemap-validator"),
        byPath("/p/$projectId/crawl-budget"),
      ],
    },
    {
      label: "Competitors & Links",
      items: [
        byPath("/p/$projectId/domain"),
        byPath("/p/$projectId/backlinks"),
        byPath("/p/$projectId/content-gap"),
        byPath("/p/$projectId/link-intersect"),
        byPath("/p/$projectId/serp-volatility"),
      ],
    },
    {
      label: "Strategy & Reports",
      items: [
        byPath("/p/$projectId/strategy"),
        byPath("/p/$projectId/brand-lookup"),
        byPath("/p/$projectId/prompt-explorer"),
        byPath("/p/$projectId/reports"),
        byPath("/p/$projectId/alerts"),
      ],
    },
  ];
}

export const dataforseoHelpLinkOptions = linkOptions({
  to: "/help/dataforseo-api-key",
});
