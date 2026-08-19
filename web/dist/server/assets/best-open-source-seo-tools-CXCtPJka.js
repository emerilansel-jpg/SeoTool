import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "The Best Open Source SEO Tools in 2026",
  "description": "Open source SEO tools in 2026: SeoTool.im, SerpBear, SEONaut, LibreCrawl, and SEOMachine — what each one does, what it costs to run, and how to self-host.",
  "author": "SeoTool.im Team",
  "date": "2026-06-05"
};
let extractedReferences = [{
  "href": "/open-source-seo"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool"
}, {
  "href": "https://github.com/towfiqi/serpbear"
}, {
  "href": "https://github.com/StJudeWasHere/seonaut"
}, {
  "href": "https://github.com/PhialsBasement/LibreCrawl"
}, {
  "href": "https://github.com/TheCraigHewitt/seomachine"
}, {
  "href": "/features"
}, {
  "href": "https://dataforseo.com"
}, {
  "href": "/pricing"
}, {
  "href": "/docs/mcp"
}, {
  "href": "https://docs.serpbear.com"
}, {
  "href": "https://docs.serpbear.com/miscellaneous/integrate-google-ads"
}, {
  "href": "https://seonaut.org/features/"
}, {
  "href": "https://librecrawl.com"
}, {
  "href": "https://github.com/karust/openserp"
}, {
  "href": "https://github.com/mascanho/RustySEO"
}, {
  "href": "https://github.com/beb7/gflare-tk"
}, {
  "href": "https://github.com/hilmanski/contentswift"
}, {
  "href": "https://github.com/seopanel/Seo-Panel"
}, {
  "href": "https://github.com/elmohq/elmo"
}, {
  "href": "https://github.com/kemalai/FreeCrawl-SEO-Tool"
}, {
  "href": "https://github.com/oguzhan18/seo-tools-api"
}, {
  "href": "https://github.com/swalker-888/google-search-console-export-all"
}, {
  "href": "https://seotool.im"
}, {
  "href": "mailto:support@seotool.im"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "There are a lot of open source SEO projects on GitHub, but only a handful are mature enough to rely on. This guide covers those, plus a few honorable mentions worth watching or testing."
  }, {
    "heading": void 0,
    "content": "In the past, open source SEO tools struggled because they lacked quality data. Beyond auditing, most SEO tasks have a cost, so most of the projects in this guide aren't totally free. For example, rank tracking requires SERP results from around the world. Coming up with a content strategy means you need accurate search volumes and backlink indexes. Most of the tools in this list rely on paid third-party services, but they still cost far less than the equivalent legacy SaaS tools."
  }, {
    "heading": void 0,
    "content": "Note: SeoTool.im publishes this guide, and SeoTool.im is one of the tools listed, as the project has 2,000+ stars on GitHub. We have tried to make this useful even if you never touch it. We love open source and think it's the future of SEO tools: seotool.im/open-source-seo."
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Tool"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Stars"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "What it does"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Cost to run"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Self-hosting"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "SeoTool.im"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "2.1k"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "All-in-one: keyword research, rank tracking, backlinks, site audits, AI visibility"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "DataForSEO usage (your own API key, pay-as-you-go)"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Docker or Cloudflare Workers"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "SerpBear"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "2.0k"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Rank tracking"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "SERP API usage (provider of your choice)"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Docker"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "SEONaut"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "717"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Technical SEO and site audits"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Free"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Docker"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "LibreCrawl"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "681"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Site crawling and SEO audits"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Free"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Desktop or web"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "SEOMachine"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "7.1k"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "SEO content writing inside Claude Code"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Anthropic API usage"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Clone the repo, run in Claude Code"
  }, {
    "heading": "the-main-tools-at-a-glance",
    "content": "Star counts are updated monthly. Last updated June 5, 2026."
  }, {
    "heading": "seotoolim",
    "content": "SeoTool.im is an open source alternative to Semrush and Ahrefs, built to be the only SEO tool that companies or small agencies need. It covers keyword research, rank tracking, backlinks, site audits, AI brand visibility, and an AI search prompt explorer. See them all on the features page."
  }, {
    "heading": "seotoolim",
    "content": "It relies on DataForSEO, a paid service, which is the gold standard for SEO data with pay-as-you-go pricing. Many features cost money to run, but far less than a legacy SaaS seat, and the costs are documented."
  }, {
    "heading": "seotoolim",
    "content": "SeoTool.im also has an MCP server and AI skills, so you can use Claude Code, Codex, or OpenClaw to handle tedious SEO work like a first pass of keyword research, then dig into the results in the SeoTool.im UI. That is different from pointing an agent at DataForSEO's MCP directly. You can save data to your SeoTool.im account through the MCP, like tags for clustering keywords, and you can ask the agent for a link to view its research in SeoTool.im instead of trusting whatever it reports back."
  }, {
    "heading": "serpbear",
    "content": "SerpBear's main focus is rank tracking. You can track unlimited keywords for unlimited domains."
  }, {
    "heading": "serpbear",
    "content": "The app is free; you pay by usage for the SERP requests you make to your chosen provider. SerpBear supports eight providers with different cost and functionality tradeoffs, so you can pick the one that fits. It also has a free Google Search Console integration and a free Keyword Research feature. Both pair well with rank tracking: you can see your real GSC data and find new keywords to target."
  }, {
    "heading": "serpbear",
    "content": "One warning on Keyword Research. It relies on the Google Ads API, which has an application and approval process before you can use it."
  }, {
    "heading": "seonaut--librecrawl",
    "content": "SEONaut and LibreCrawl are both open source Screaming Frog alternatives for technical SEO: crawl a site, audit on-page SEO, and surface issues like broken links. Neither depends on a paid data provider, so they are the cheapest tools here to run, and an easy first install if technical SEO is your immediate need."
  }, {
    "heading": "seonaut--librecrawl",
    "content": "The difference is how you run them. SEONaut is a self-hosted web app (Docker), with a hosted version and the full feature list at seonaut.org/features. LibreCrawl runs as a free desktop or web crawler that analyzes links and exports SEO data; it is newer but moving fast. Try whichever fits your setup."
  }, {
    "heading": "seomachine",
    "content": "SEOMachine is a Claude Code workspace for creating long-form, SEO-optimized blog content, rather than a data platform. It works with Claude Code and an Anthropic API account, plus optional Google Analytics, Search Console, and DataForSEO integrations. To self-host, clone the repo, install its Python dependencies, add your business context, and open it in Claude Code."
  }, {
    "heading": "seomachine",
    "content": "It gives you commands like /research, /write, and /optimize, along with a set of SEO agents to draft and refine content. If your bottleneck is producing content rather than pulling data, it solves a different problem than the tools above."
  }, {
    "heading": "honorable-mentions",
    "content": "These have fewer stars, or fill a narrower niche, than the main tools above. We have not put any of them through real work, so treat these as leads rather than recommendations. If you love one of them, email us and we will test it. Sorted by GitHub stars."
  }, {
    "heading": "honorable-mentions",
    "content": "openserp (745, active): a Go API and CLI that scrapes normalized SERP results from Google, Yandex, Baidu, Bing, DuckDuckGo, and Ecosia, self-hostable via Docker."
  }, {
    "heading": "honorable-mentions",
    "content": "RustySEO (276, active): a cross-platform desktop SEO/GEO toolkit with a Rust crawling core, plus Google Analytics, Search Console, and PageSpeed integrations. It looked promising, but the Mac build would not run on our machine."
  }, {
    "heading": "honorable-mentions",
    "content": "Greenflare (195, unmaintained): a lightweight Python technical-SEO crawler for Linux, Mac, and Windows. It is no longer maintained — last release 2021 — and its download site is down."
  }, {
    "heading": "honorable-mentions",
    "content": "contentswift (159, unmaintained): a self-hostable content research tool that analyzes top-ranking SERP results to guide on-page optimization. The demo video is strong, but the repo has been dormant since 2023 and has no declared license."
  }, {
    "heading": "honorable-mentions",
    "content": "SEO Panel (146, active): an older PHP control panel, around since 2010, for managing SEO across multiple sites — rank tracking, audits, sitemaps, backlink monitoring, and multi-user accounts."
  }, {
    "heading": "honorable-mentions",
    "content": "elmo (124, active): an AI-visibility (AEO/GEO) tracker that monitors how ChatGPT, Claude, Gemini, and Perplexity mention a brand and cite its content, self-hostable via Docker Compose."
  }, {
    "heading": "honorable-mentions",
    "content": "FreeCrawl-SEO-Tool (46, active): a free desktop SEO crawler aimed at large technical audits — 1M+ URLs, 150+ checks, JS rendering — that runs locally with no telemetry. Very new."
  }, {
    "heading": "honorable-mentions",
    "content": "seo-tools-api (46, unmaintained): a NestJS REST API bundling meta-tag analysis, sitemap generation, SEO scoring, and rank and backlink checks. No declared license."
  }, {
    "heading": "honorable-mentions",
    "content": "google-search-console-export-all (8, unmaintained): a single-file Node.js script that bulk-exports all your Search Console data to CSV, bypassing the UI's row limits. No declared license."
  }, {
    "heading": "honorable-mentions",
    "content": "One clarification, since it shows up on other lists: seojuice.com is not open source. They publish open source SDKs for their APIs, but the core product is closed."
  }, {
    "heading": "try-seotoolim-and-tell-us-what-we-missed",
    "content": "If you want one open source tool that covers most of SEO, start with SeoTool.im. Self-host it with Docker or Cloudflare Workers, or use the hosted version at seotool.im if you would rather not run it yourself."
  }, {
    "heading": "try-seotoolim-and-tell-us-what-we-missed",
    "content": "We will keep this guide current. If there is an open source SEO project you love that we did not cover, email us at support@seotool.im and we will test it and consider adding it."
  }],
  "headings": [{
    "id": "the-main-tools-at-a-glance",
    "content": "The main tools at a glance"
  }, {
    "id": "seotoolim",
    "content": "SeoTool.im"
  }, {
    "id": "serpbear",
    "content": "SerpBear"
  }, {
    "id": "seonaut--librecrawl",
    "content": "SEONaut & LibreCrawl"
  }, {
    "id": "seomachine",
    "content": "SEOMachine"
  }, {
    "id": "honorable-mentions",
    "content": "Honorable mentions"
  }, {
    "id": "try-seotoolim-and-tell-us-what-we-missed",
    "content": "Try SeoTool.im, and tell us what we missed"
  }]
};
const toc = [{
  depth: 2,
  url: "#the-main-tools-at-a-glance",
  title: jsx(Fragment, {
    children: "The main tools at a glance"
  })
}, {
  depth: 2,
  url: "#seotoolim",
  title: jsx(Fragment, {
    children: "SeoTool.im"
  })
}, {
  depth: 2,
  url: "#serpbear",
  title: jsx(Fragment, {
    children: "SerpBear"
  })
}, {
  depth: 2,
  url: "#seonaut--librecrawl",
  title: jsx(Fragment, {
    children: "SEONaut & LibreCrawl"
  })
}, {
  depth: 2,
  url: "#seomachine",
  title: jsx(Fragment, {
    children: "SEOMachine"
  })
}, {
  depth: 2,
  url: "#honorable-mentions",
  title: jsx(Fragment, {
    children: "Honorable mentions"
  })
}, {
  depth: 2,
  url: "#try-seotoolim-and-tell-us-what-we-missed",
  title: jsx(Fragment, {
    children: "Try SeoTool.im, and tell us what we missed"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    em: "em",
    h2: "h2",
    li: "li",
    p: "p",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "There are a lot of open source SEO projects on GitHub, but only a handful are mature enough to rely on. This guide covers those, plus a few honorable mentions worth watching or testing."
    }), "\n", jsx(_components.p, {
      children: "In the past, open source SEO tools struggled because they lacked quality data. Beyond auditing, most SEO tasks have a cost, so most of the projects in this guide aren't totally free. For example, rank tracking requires SERP results from around the world. Coming up with a content strategy means you need accurate search volumes and backlink indexes. Most of the tools in this list rely on paid third-party services, but they still cost far less than the equivalent legacy SaaS tools."
    }), "\n", jsxs(_components.p, {
      children: ["Note: SeoTool.im publishes this guide, and SeoTool.im is one of the tools listed, as the project has 2,000+ stars on GitHub. We have tried to make this useful even if you never touch it. We love open source and think it's the future of SEO tools: ", jsx(_components.a, {
        href: "/open-source-seo",
        children: "seotool.im/open-source-seo"
      }), "."]
    }), "\n", jsx(_components.h2, {
      id: "the-main-tools-at-a-glance",
      children: "The main tools at a glance"
    }), "\n", jsxs(_components.table, {
      children: [jsx(_components.thead, {
        children: jsxs(_components.tr, {
          children: [jsx(_components.th, {
            children: "Tool"
          }), jsx(_components.th, {
            children: "Stars"
          }), jsx(_components.th, {
            children: "What it does"
          }), jsx(_components.th, {
            children: "Cost to run"
          }), jsx(_components.th, {
            children: "Self-hosting"
          })]
        })
      }), jsxs(_components.tbody, {
        children: [jsxs(_components.tr, {
          children: [jsx(_components.td, {
            children: jsx(_components.a, {
              href: "https://github.com/emerilansel-jpg/SeoTool",
              children: "SeoTool.im"
            })
          }), jsx(_components.td, {
            children: "2.1k"
          }), jsx(_components.td, {
            children: "All-in-one: keyword research, rank tracking, backlinks, site audits, AI visibility"
          }), jsx(_components.td, {
            children: "DataForSEO usage (your own API key, pay-as-you-go)"
          }), jsx(_components.td, {
            children: "Docker or Cloudflare Workers"
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            children: jsx(_components.a, {
              href: "https://github.com/towfiqi/serpbear",
              children: "SerpBear"
            })
          }), jsx(_components.td, {
            children: "2.0k"
          }), jsx(_components.td, {
            children: "Rank tracking"
          }), jsx(_components.td, {
            children: "SERP API usage (provider of your choice)"
          }), jsx(_components.td, {
            children: "Docker"
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            children: jsx(_components.a, {
              href: "https://github.com/StJudeWasHere/seonaut",
              children: "SEONaut"
            })
          }), jsx(_components.td, {
            children: "717"
          }), jsx(_components.td, {
            children: "Technical SEO and site audits"
          }), jsx(_components.td, {
            children: "Free"
          }), jsx(_components.td, {
            children: "Docker"
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            children: jsx(_components.a, {
              href: "https://github.com/PhialsBasement/LibreCrawl",
              children: "LibreCrawl"
            })
          }), jsx(_components.td, {
            children: "681"
          }), jsx(_components.td, {
            children: "Site crawling and SEO audits"
          }), jsx(_components.td, {
            children: "Free"
          }), jsx(_components.td, {
            children: "Desktop or web"
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            children: jsx(_components.a, {
              href: "https://github.com/TheCraigHewitt/seomachine",
              children: "SEOMachine"
            })
          }), jsx(_components.td, {
            children: "7.1k"
          }), jsx(_components.td, {
            children: "SEO content writing inside Claude Code"
          }), jsx(_components.td, {
            children: "Anthropic API usage"
          }), jsx(_components.td, {
            children: "Clone the repo, run in Claude Code"
          })]
        })]
      })]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.em, {
        children: "Star counts are updated monthly. Last updated June 5, 2026."
      })
    }), "\n", jsx(_components.h2, {
      id: "seotoolim",
      children: "SeoTool.im"
    }), "\n", jsxs(_components.p, {
      children: ["SeoTool.im is an open source alternative to Semrush and Ahrefs, built to be the only SEO tool that companies or small agencies need. It covers keyword research, rank tracking, backlinks, site audits, AI brand visibility, and an AI search prompt explorer. See them all on the ", jsx(_components.a, {
        href: "/features",
        children: "features page"
      }), "."]
    }), "\n", jsxs(_components.p, {
      children: ["It relies on ", jsx(_components.a, {
        href: "https://dataforseo.com",
        children: "DataForSEO"
      }), ", a paid service, which is the gold standard for SEO data with pay-as-you-go pricing. Many features cost money to run, but far less than a legacy SaaS seat, and the ", jsx(_components.a, {
        href: "/pricing",
        children: "costs are documented"
      }), "."]
    }), "\n", jsxs(_components.p, {
      children: ["SeoTool.im also has an ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "MCP server"
      }), " and AI skills, so you can use Claude Code, Codex, or OpenClaw to handle tedious SEO work like a first pass of keyword research, then dig into the results in the SeoTool.im UI. That is different from pointing an agent at DataForSEO's MCP directly. You can save data to your SeoTool.im account through the MCP, like tags for clustering keywords, and you can ask the agent for a link to view its research in SeoTool.im instead of trusting whatever it reports back."]
    }), "\n", jsx(_components.h2, {
      id: "serpbear",
      children: "SerpBear"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.a, {
        href: "https://docs.serpbear.com",
        children: "SerpBear"
      }), "'s main focus is rank tracking. You can track unlimited keywords for unlimited domains."]
    }), "\n", jsx(_components.p, {
      children: "The app is free; you pay by usage for the SERP requests you make to your chosen provider. SerpBear supports eight providers with different cost and functionality tradeoffs, so you can pick the one that fits. It also has a free Google Search Console integration and a free Keyword Research feature. Both pair well with rank tracking: you can see your real GSC data and find new keywords to target."
    }), "\n", jsxs(_components.p, {
      children: ["One warning on Keyword Research. It relies on the ", jsx(_components.a, {
        href: "https://docs.serpbear.com/miscellaneous/integrate-google-ads",
        children: "Google Ads API"
      }), ", which has an application and approval process before you can use it."]
    }), "\n", jsx(_components.h2, {
      id: "seonaut--librecrawl",
      children: "SEONaut & LibreCrawl"
    }), "\n", jsx(_components.p, {
      children: "SEONaut and LibreCrawl are both open source Screaming Frog alternatives for technical SEO: crawl a site, audit on-page SEO, and surface issues like broken links. Neither depends on a paid data provider, so they are the cheapest tools here to run, and an easy first install if technical SEO is your immediate need."
    }), "\n", jsxs(_components.p, {
      children: ["The difference is how you run them. SEONaut is a self-hosted web app (Docker), with a hosted version and the full feature list at ", jsx(_components.a, {
        href: "https://seonaut.org/features/",
        children: "seonaut.org/features"
      }), ". ", jsx(_components.a, {
        href: "https://librecrawl.com",
        children: "LibreCrawl"
      }), " runs as a free desktop or web crawler that analyzes links and exports SEO data; it is newer but moving fast. Try whichever fits your setup."]
    }), "\n", jsx(_components.h2, {
      id: "seomachine",
      children: "SEOMachine"
    }), "\n", jsx(_components.p, {
      children: "SEOMachine is a Claude Code workspace for creating long-form, SEO-optimized blog content, rather than a data platform. It works with Claude Code and an Anthropic API account, plus optional Google Analytics, Search Console, and DataForSEO integrations. To self-host, clone the repo, install its Python dependencies, add your business context, and open it in Claude Code."
    }), "\n", jsx(_components.p, {
      children: "It gives you commands like /research, /write, and /optimize, along with a set of SEO agents to draft and refine content. If your bottleneck is producing content rather than pulling data, it solves a different problem than the tools above."
    }), "\n", jsx(_components.h2, {
      id: "honorable-mentions",
      children: "Honorable mentions"
    }), "\n", jsx(_components.p, {
      children: "These have fewer stars, or fill a narrower niche, than the main tools above. We have not put any of them through real work, so treat these as leads rather than recommendations. If you love one of them, email us and we will test it. Sorted by GitHub stars."
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/karust/openserp",
          children: "openserp"
        }), " (745, active): a Go API and CLI that scrapes normalized SERP results from Google, Yandex, Baidu, Bing, DuckDuckGo, and Ecosia, self-hostable via Docker."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/mascanho/RustySEO",
          children: "RustySEO"
        }), " (276, active): a cross-platform desktop SEO/GEO toolkit with a Rust crawling core, plus Google Analytics, Search Console, and PageSpeed integrations. It looked promising, but the Mac build would not run on our machine."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/beb7/gflare-tk",
          children: "Greenflare"
        }), " (195, unmaintained): a lightweight Python technical-SEO crawler for Linux, Mac, and Windows. It is no longer maintained — last release 2021 — and its download site is down."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/hilmanski/contentswift",
          children: "contentswift"
        }), " (159, unmaintained): a self-hostable content research tool that analyzes top-ranking SERP results to guide on-page optimization. The demo video is strong, but the repo has been dormant since 2023 and has no declared license."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/seopanel/Seo-Panel",
          children: "SEO Panel"
        }), " (146, active): an older PHP control panel, around since 2010, for managing SEO across multiple sites — rank tracking, audits, sitemaps, backlink monitoring, and multi-user accounts."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/elmohq/elmo",
          children: "elmo"
        }), " (124, active): an AI-visibility (AEO/GEO) tracker that monitors how ChatGPT, Claude, Gemini, and Perplexity mention a brand and cite its content, self-hostable via Docker Compose."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/kemalai/FreeCrawl-SEO-Tool",
          children: "FreeCrawl-SEO-Tool"
        }), " (46, active): a free desktop SEO crawler aimed at large technical audits — 1M+ URLs, 150+ checks, JS rendering — that runs locally with no telemetry. Very new."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/oguzhan18/seo-tools-api",
          children: "seo-tools-api"
        }), " (46, unmaintained): a NestJS REST API bundling meta-tag analysis, sitemap generation, SEO scoring, and rank and backlink checks. No declared license."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://github.com/swalker-888/google-search-console-export-all",
          children: "google-search-console-export-all"
        }), " (8, unmaintained): a single-file Node.js script that bulk-exports all your Search Console data to CSV, bypassing the UI's row limits. No declared license."]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "One clarification, since it shows up on other lists: seojuice.com is not open source. They publish open source SDKs for their APIs, but the core product is closed."
    }), "\n", jsx(_components.h2, {
      id: "try-seotoolim-and-tell-us-what-we-missed",
      children: "Try SeoTool.im, and tell us what we missed"
    }), "\n", jsxs(_components.p, {
      children: ["If you want one open source tool that covers most of SEO, start with SeoTool.im. Self-host it with Docker or Cloudflare Workers, or use the hosted version at ", jsx(_components.a, {
        href: "https://seotool.im",
        children: "seotool.im"
      }), " if you would rather not run it yourself."]
    }), "\n", jsxs(_components.p, {
      children: ["We will keep this guide current. If there is an open source SEO project you love that we did not cover, email us at ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), " and we will test it and consider adding it."]
    })]
  });
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
export {
  MDXContent as default,
  extractedReferences,
  frontmatter,
  structuredData,
  toc
};
