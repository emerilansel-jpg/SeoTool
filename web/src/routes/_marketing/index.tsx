import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";
import { buildPageSeo } from "@/lib/seo";

const homeTitle = "SeoTool.im - Open Source SEO Platform";
const homeDescription =
  "SeoTool.im is the open source alternative to Ahrefs and Semrush. Keyword research, backlinks, rank tracking, and site audits, billed by usage instead of a $100-plus monthly subscription. Self-host it free, or connect it to your AI agents over MCP.";

export const Route = createFileRoute("/_marketing/")({
  head: () => {
    const seo = buildPageSeo({
      title: homeTitle,
      description: homeDescription,
      path: "/",
      imageAlt: "SeoTool.im keyword research dashboard preview",
    });

    // SoftwareApplication structured data so search engines render rich
    // product results. No aggregateRating: fabricated review counts risk
    // rich-result penalties.
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "SeoTool.im",
      url: "https://seotool.im/",
      description: homeDescription,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "SEO Software",
      operatingSystem: "Web browser",
      screenshot: "https://seotool.im/social-card.png",
      featureList: [
        "Keyword research",
        "Rank tracking",
        "Site audits",
        "Backlink analysis",
        "AI brand visibility",
        "MCP server for AI agents",
      ],
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "0",
        highPrice: "499",
        offerCount: "4",
      },
    };

    return {
      ...seo,
      meta: [
        ...(seo.meta ?? []),
        { property: "og:site_name", content: "SeoTool.im" },
      ],
      links: [
        ...(seo.links ?? []),
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(softwareSchema),
        },
      ],
    };
  },
  component: LandingPage,
});
