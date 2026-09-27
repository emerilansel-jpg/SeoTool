export interface AuthorInfo {
  name: string;
  role: string;
  avatarUrl?: string;
  initials: string;
  bio: string;
  twitter?: string;
  linkedin?: string;
}

export interface PostExtraMetadata {
  category: string;
  author: AuthorInfo;
  topics: string[];
  heroImage?: string;
}

export const AUTHORS: Record<string, AuthorInfo> = {
  "jeremy-rivera": {
    name: "Jeremy Rivera",
    role: "SEO Strategist & Consultant",
    initials: "JR",
    bio: "Jeremy Rivera is an SEO consultant and strategist who helps founders and high-growth brands solve organic tracking gaps and search analytics mysteries.",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  "seotool-team": {
    name: "SeoTool.im Team",
    role: "SEO Research & Engineering",
    initials: "ST",
    bio: "The SeoTool.im research team analyzes open source SEO architectures, search algorithms, and SERP data infrastructure.",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
};

export const POST_METADATA_REGISTRY: Record<string, Partial<PostExtraMetadata>> = {
  "dark-queries": {
    category: "Google Search Console",
    author: AUTHORS["jeremy-rivera"],
    topics: [
      "Google Search Console",
      "Dark Queries",
      "Search Analytics",
      "SEO Strategy",
      "Data Triangulation",
    ],
    heroImage: "/blog/dark-queries/gsc-queries.png",
  },
  "best-open-source-seo-tools": {
    category: "Open Source SEO",
    author: AUTHORS["seotool-team"],
    topics: [
      "Open Source",
      "SEO Tools",
      "Self-Hosting",
      "Rank Tracking",
      "DataForSEO",
    ],
  },
  "seo-for-startups": {
    category: "Startup SEO",
    author: AUTHORS["seotool-team"],
    topics: [
      "Startup SEO",
      "Founder Handbook",
      "Keyword Research",
      "Organic Growth",
    ],
  },
};

export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getPostMetadata(
  slug: string,
  fallbackTitle = "",
): PostExtraMetadata {
  const configured = POST_METADATA_REGISTRY[slug];
  if (configured && configured.category && configured.author && configured.topics) {
    return {
      category: configured.category,
      author: configured.author,
      topics: configured.topics,
      heroImage: configured.heroImage,
    };
  }

  // Derive sensible fallback
  const defaultCategory = slug.includes("seo") ? "SEO Strategy" : "Search Intelligence";
  const defaultTopics = fallbackTitle
    ? [defaultCategory, ...fallbackTitle.split(" ").slice(0, 3)]
    : [defaultCategory, "SEO", "Search"];

  return {
    category: configured?.category ?? defaultCategory,
    author: configured?.author ?? AUTHORS["seotool-team"],
    topics: configured?.topics ?? defaultTopics,
    heroImage: configured?.heroImage,
  };
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split(/\r?\n/);
  const headings: HeadingItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(##|###)\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    const rawText = match[2].trim();

    // Skip "Table of Contents" heading itself
    if (/^table\s+of\s+contents$/i.test(rawText)) continue;

    headings.push({
      id: slugifyHeading(rawText),
      text: rawText,
      level,
    });
  }

  return headings;
}
