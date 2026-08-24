import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import * as React from "react";
import appCss from "@/styles/app.css?url";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "SeoTool.im - Open Source SEO Platform",
      },
      {
        name: "description",
        content:
          "Open source alternative to Ahrefs and Semrush. Keyword research, backlinks, rank tracking, and site audits, billed by usage instead of a $100-plus monthly subscription.",
      },
      { property: "og:site_name", content: "SeoTool.im" },
      { property: "og:type", content: "website" },
      {
        property: "og:title",
        content: "SeoTool.im - Open Source SEO Platform",
      },
      {
        property: "og:description",
        content:
          "Open source alternative to Ahrefs and Semrush. Keyword research, backlinks, rank tracking, and site audits, billed by usage instead of a $100-plus monthly subscription.",
      },
      { property: "og:url", content: "https://seotool.im/" },
      { property: "og:image", content: "https://seotool.im/social-card.png" },
      { property: "og:image:alt", content: "SeoTool.im product preview" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "SeoTool.im - Open Source SEO Platform",
      },
      {
        name: "twitter:description",
        content:
          "Open source alternative to Ahrefs and Semrush. Keyword research, backlinks, rank tracking, and site audits.",
      },
      {
        name: "twitter:image",
        content: "https://seotool.im/social-card.png",
      },
      {
        name: "twitter:image:alt",
        content: "SeoTool.im product preview",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "canonical", href: "https://seotool.im/" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){function loadAnalytics(){if(window.__seotoolAnalyticsLoaded)return;window.__seotoolAnalyticsLoaded=true;window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init({endpoint:'/api/event'});var script=document.createElement('script');script.defer=true;script.src='/js/script.js';document.head.appendChild(script)}function schedule(){if('requestIdleCallback'in window){window.requestIdleCallback(loadAnalytics,{timeout:2000});return}window.setTimeout(loadAnalytics,2000)}if(document.readyState==='complete'){schedule();return}window.addEventListener('load',schedule,{once:true})})();",
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-fd-background text-fd-foreground">
        <RootProvider search={{ enabled: false }}>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
