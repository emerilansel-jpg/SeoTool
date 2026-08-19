import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "Self-Hosting SeoTool.im",
  "description": "Run SeoTool.im yourself with Docker or Cloudflare, bring your own DataForSEO API key, and pay only for what you use."
};
let extractedReferences = [{
  "href": "/docs/self-hosting/docker"
}, {
  "href": "/docs/self-hosting/cloudflare"
}, {
  "href": "https://dataforseo.com/?aff=255379"
}, {
  "href": "https://app.dataforseo.com/api-access?aff=255379"
}, {
  "href": "/pricing"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/blob/main/docs/SELF_HOSTING_GOOGLE_SEARCH_CONSOLE.md"
}, {
  "href": "https://openrouter.ai/settings/keys"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "SeoTool.im is free and open source. Self-hosting means the app costs $0. You bring your own DataForSEO API key and pay DataForSEO directly for API usage."
  }, {
    "heading": void 0,
    "content": "There are two self-hosting paths:"
  }, {
    "heading": void 0,
    "content": "Simple: Docker, recommended for personal use on your own machine. Easiest way to get started."
  }, {
    "heading": void 0,
    "content": "Advanced: Cloudflare, for internet-facing self-hosting across multiple devices or with your team. A SaaS-like experience with automatic database backups, and it works on Cloudflare's free plan. Slightly more setup if you're unfamiliar with Cloudflare."
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": "SeoTool.im uses DataForSEO to fetch SEO data. DataForSEO is a paid third-party service unaffiliated with SeoTool.im. You need an API key to connect SeoTool.im to it."
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": "Go to DataForSEO API Access."
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": 'Click "Send by email" to get your credentials.'
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": 'Copy the longer credentials labelled "Base64" credentials.'
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": "Set this as DATAFORSEO_API_KEY in your environment:"
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": "Docker: .env"
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": "Cloudflare: as a Worker secret in the dashboard"
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": "Local development: .env.local"
  }, {
    "heading": "dataforseo-api-key-setup",
    "content": "New DataForSEO accounts include $1 of free credit to test with, and the minimum top-up is $50. See pricing for cost estimates. Self-hosted costs run slightly lower, since the hosted service adds a 28% fee on DataForSEO requests."
  }, {
    "heading": "google-search-console",
    "content": "Search Console is optional and works in self-hosted deployments using your own Google OAuth client. It takes about 10 minutes of one-time setup. See the Google Search Console guide on GitHub."
  }, {
    "heading": "ai-features-sam",
    "content": "AI features like SAM, the in-app SEO agent, are optional. Set the OPENROUTER_API_KEY environment variable to enable them. Create a key at openrouter.ai/settings/keys."
  }],
  "headings": [{
    "id": "dataforseo-api-key-setup",
    "content": "DataForSEO API key setup"
  }, {
    "id": "optional-features",
    "content": "Optional features"
  }, {
    "id": "google-search-console",
    "content": "Google Search Console"
  }, {
    "id": "ai-features-sam",
    "content": "AI features (SAM)"
  }]
};
const toc = [{
  depth: 2,
  url: "#dataforseo-api-key-setup",
  title: jsx(Fragment, {
    children: "DataForSEO API key setup"
  })
}, {
  depth: 2,
  url: "#optional-features",
  title: jsx(Fragment, {
    children: "Optional features"
  })
}, {
  depth: 3,
  url: "#google-search-console",
  title: jsx(Fragment, {
    children: "Google Search Console"
  })
}, {
  depth: 3,
  url: "#ai-features-sam",
  title: jsx(Fragment, {
    children: "AI features (SAM)"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    h3: "h3",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "SeoTool.im is free and open source. Self-hosting means the app costs $0. You bring your own DataForSEO API key and pay DataForSEO directly for API usage."
    }), "\n", jsx(_components.p, {
      children: "There are two self-hosting paths:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsxs(_components.strong, {
          children: ["Simple: ", jsx(_components.a, {
            href: "/docs/self-hosting/docker",
            children: "Docker"
          })]
        }), ", recommended for personal use on your own machine. Easiest way to get started."]
      }), "\n", jsxs(_components.li, {
        children: [jsxs(_components.strong, {
          children: ["Advanced: ", jsx(_components.a, {
            href: "/docs/self-hosting/cloudflare",
            children: "Cloudflare"
          })]
        }), ", for internet-facing self-hosting across multiple devices or with your team. A SaaS-like experience with automatic database backups, and it works on Cloudflare's free plan. Slightly more setup if you're unfamiliar with Cloudflare."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "dataforseo-api-key-setup",
      children: "DataForSEO API key setup"
    }), "\n", jsxs(_components.p, {
      children: ["SeoTool.im uses ", jsx(_components.a, {
        href: "https://dataforseo.com/?aff=255379",
        children: "DataForSEO"
      }), " to fetch SEO data. DataForSEO is a paid third-party service unaffiliated with SeoTool.im. You need an API key to connect SeoTool.im to it."]
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: ["Go to ", jsx(_components.a, {
          href: "https://app.dataforseo.com/api-access?aff=255379",
          children: "DataForSEO API Access"
        }), "."]
      }), "\n", jsx(_components.li, {
        children: 'Click "Send by email" to get your credentials.'
      }), "\n", jsx(_components.li, {
        children: 'Copy the longer credentials labelled "Base64" credentials.'
      }), "\n", jsxs(_components.li, {
        children: ["Set this as ", jsx(_components.code, {
          children: "DATAFORSEO_API_KEY"
        }), " in your environment:", "\n", jsxs(_components.ul, {
          children: ["\n", jsxs(_components.li, {
            children: ["Docker: ", jsx(_components.code, {
              children: ".env"
            })]
          }), "\n", jsx(_components.li, {
            children: "Cloudflare: as a Worker secret in the dashboard"
          }), "\n", jsxs(_components.li, {
            children: ["Local development: ", jsx(_components.code, {
              children: ".env.local"
            })]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["New DataForSEO accounts include $1 of free credit to test with, and the minimum top-up is $50. See ", jsx(_components.a, {
        href: "/pricing",
        children: "pricing"
      }), " for cost estimates. Self-hosted costs run slightly lower, since the hosted service adds a 28% fee on DataForSEO requests."]
    }), "\n", jsx(_components.h2, {
      id: "optional-features",
      children: "Optional features"
    }), "\n", jsx(_components.h3, {
      id: "google-search-console",
      children: "Google Search Console"
    }), "\n", jsxs(_components.p, {
      children: ["Search Console is optional and works in self-hosted deployments using your own Google OAuth client. It takes about 10 minutes of one-time setup. See the ", jsx(_components.a, {
        href: "https://github.com/emerilansel-jpg/SeoTool/blob/main/docs/SELF_HOSTING_GOOGLE_SEARCH_CONSOLE.md",
        children: "Google Search Console guide on GitHub"
      }), "."]
    }), "\n", jsx(_components.h3, {
      id: "ai-features-sam",
      children: "AI features (SAM)"
    }), "\n", jsxs(_components.p, {
      children: ["AI features like SAM, the in-app SEO agent, are optional. Set the ", jsx(_components.code, {
        children: "OPENROUTER_API_KEY"
      }), " environment variable to enable them. Create a key at ", jsx(_components.a, {
        href: "https://openrouter.ai/settings/keys",
        children: "openrouter.ai/settings/keys"
      }), "."]
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
