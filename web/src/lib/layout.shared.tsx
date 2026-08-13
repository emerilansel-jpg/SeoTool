import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="font-semibold">SeoTool.im</span>,
    },
    searchToggle: {
      enabled: false,
    },
    links: [
      {
        text: "Resources",
        url: "/blogs",
        items: [
          {
            text: "Blog",
            description: "SEO articles and guides.",
            url: "/blogs",
          },
          {
            text: "MCP",
            description: "Connect SeoTool.im to AI clients.",
            url: "/docs/mcp",
          },
          {
            text: "Skills",
            description: "Focused SeoTool.im workflows.",
            url: "/docs/skills",
          },
        ],
      },
      {
        text: "GitHub",
        url: "https://github.com/emerilansel-jpg/SeoTool",
        external: true,
      },
    ],
  };
}
