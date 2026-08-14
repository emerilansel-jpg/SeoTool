import { U as jsxRuntimeExports } from "./worker-entry-oZfJ_xJd.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
let frontmatter = {
  "title": "Cloudflare Self-Hosting",
  "description": "Deploy SeoTool.im to your own Cloudflare account for internet-facing, multi-device, or team use."
};
let extractedReferences = [{
  "href": "/docs/self-hosting#dataforseo-api-key-setup"
}, {
  "href": "https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/managed-oauth/"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/blob/main/docs/SELF_HOSTING_CLOUDFLARE_OPERATIONS.md"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/blob/main/docs/SELF_HOSTING_CLOUDFLARE_LEGACY.md"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "Host SeoTool.im on Cloudflare for internet-facing self-hosting across multiple devices or with your team. One deploy command provisions everything, including the Cloudflare Access login gate. Works on Cloudflare's free plan."
  }, {
    "heading": "prerequisites",
    "content": "Node 22.6 or newer and pnpm (corepack enable sets it up)."
  }, {
    "heading": "prerequisites",
    "content": "A Cloudflare account with R2 enabled. Activating R2 requires a payment method on file, even within its free tier — if you have never used R2, open R2 in the Cloudflare dashboard once."
  }, {
    "heading": "prerequisites",
    "content": "A DataForSEO account — see DataForSEO API key setup."
  }, {
    "heading": "1-clone-your-seotoolim-repo",
    "content": "Fork emerilansel-jpg/SeoTool on GitHub if you want a repo you control, then clone it locally:"
  }, {
    "heading": "1-clone-your-seotoolim-repo",
    "content": "If you do not need a fork, clone the upstream repo instead:"
  }, {
    "heading": "2-log-in-to-cloudflare-once",
    "content": "Already logged in from before without the access:write scope? Run pnpm alchemy login --configure — a plain repeat login doesn't re-ask about scopes."
  }, {
    "heading": "3-create-envselfhost",
    "content": "Copy the template and fill in the required values:"
  }, {
    "heading": "4-deploy",
    "content": "This provisions the D1 database, KV namespaces, and R2 bucket, applies the database migrations, deploys the Worker, and creates the Cloudflare Access application protecting it (allowing exactly ACCESS_ALLOWED_EMAILS). If the account has no Zero Trust team yet, one is created for you, named after your workers.dev subdomain."
  }, {
    "heading": "5-validate-setup",
    "content": "Open the Worker URL printed at the end of the deploy."
  }, {
    "heading": "5-validate-setup",
    "content": "Sign in with Cloudflare Access."
  }, {
    "heading": "5-validate-setup",
    "content": "SeoTool.im should load after login."
  }, {
    "heading": "5-validate-setup",
    "content": "If login fails, re-check ACCESS_ALLOWED_EMAILS and redeploy."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Use the same Cloudflare Access application that protects your SeoTool.im Worker. Managed OAuth is required for MCP clients and is not enabled by default."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Open Cloudflare Zero Trust."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Go to Access controls -> Applications."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Find your SeoTool.im application, then select Edit."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Go to Additional settings -> OAuth."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Turn on Managed OAuth."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "In Managed OAuth settings, allow the redirect URIs your MCP clients use:"
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Allow localhost / loopback clients for CLI and desktop agents (Codex CLI, Claude Code) that register http://localhost:PORT/callback."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Add HTTPS redirect URIs for web connectors (a path may end in /*)."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Without this, clients can't finish Dynamic Client Registration and log in but expose no tools."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Save."
  }, {
    "heading": "connect-the-mcp-server-through-cloudflare-access",
    "content": "MCP clients should connect to:"
  }, {
    "heading": "give-teammates-access-to-seotoolim",
    "content": "Add the teammate to ACCESS_ALLOWED_EMAILS in .env.selfhost and redeploy. Everyone allowed through shares one SeoTool.im workspace."
  }, {
    "heading": "more-guides-on-github",
    "content": "Operations: telemetry and other day-to-day tasks."
  }, {
    "heading": "more-guides-on-github",
    "content": "Legacy deployments: maintenance for installs created with the retired Deploy-button or manual Wrangler flows."
  }],
  "headings": [{
    "id": "prerequisites",
    "content": "Prerequisites"
  }, {
    "id": "1-clone-your-seotoolim-repo",
    "content": "1) Clone your SeoTool.im repo"
  }, {
    "id": "2-log-in-to-cloudflare-once",
    "content": "2) Log in to Cloudflare (once)"
  }, {
    "id": "3-create-envselfhost",
    "content": "3) Create .env.selfhost"
  }, {
    "id": "4-deploy",
    "content": "4) Deploy"
  }, {
    "id": "5-validate-setup",
    "content": "5) Validate setup"
  }, {
    "id": "connect-the-mcp-server-through-cloudflare-access",
    "content": "Connect the MCP server through Cloudflare Access"
  }, {
    "id": "give-teammates-access-to-seotoolim",
    "content": "Give teammates access to SeoTool.im"
  }, {
    "id": "updating-to-the-latest-seotoolim-version",
    "content": "Updating to the latest SeoTool.im version"
  }, {
    "id": "more-guides-on-github",
    "content": "More guides on GitHub"
  }]
};
const toc = [{
  depth: 2,
  url: "#prerequisites",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Prerequisites"
  })
}, {
  depth: 2,
  url: "#1-clone-your-seotoolim-repo",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "1) Clone your SeoTool.im repo"
  })
}, {
  depth: 2,
  url: "#2-log-in-to-cloudflare-once",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "2) Log in to Cloudflare (once)"
  })
}, {
  depth: 2,
  url: "#3-create-envselfhost",
  title: jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: ["3) Create ", jsxRuntimeExports.jsx("code", {
      children: ".env.selfhost"
    })]
  })
}, {
  depth: 2,
  url: "#4-deploy",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "4) Deploy"
  })
}, {
  depth: 2,
  url: "#5-validate-setup",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "5) Validate setup"
  })
}, {
  depth: 2,
  url: "#connect-the-mcp-server-through-cloudflare-access",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Connect the MCP server through Cloudflare Access"
  })
}, {
  depth: 2,
  url: "#give-teammates-access-to-seotoolim",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Give teammates access to SeoTool.im"
  })
}, {
  depth: 2,
  url: "#updating-to-the-latest-seotoolim-version",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Updating to the latest SeoTool.im version"
  })
}, {
  depth: 2,
  url: "#more-guides-on-github",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "More guides on GitHub"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.p, {
      children: "Host SeoTool.im on Cloudflare for internet-facing self-hosting across multiple devices or with your team. One deploy command provisions everything, including the Cloudflare Access login gate. Works on Cloudflare's free plan."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "Node 22.6 or newer"
        }), " and ", jsxRuntimeExports.jsx(_components.strong, {
          children: "pnpm"
        }), " (", jsxRuntimeExports.jsx(_components.code, {
          children: "corepack enable"
        }), " sets it up)."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "A Cloudflare account with R2 enabled."
        }), " Activating R2 requires a payment method on file, even within its free tier — if you have never used R2, open ", jsxRuntimeExports.jsx(_components.code, {
          children: "R2"
        }), " in the Cloudflare dashboard once."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "A DataForSEO account"
        }), " — see ", jsxRuntimeExports.jsx(_components.a, {
          href: "/docs/self-hosting#dataforseo-api-key-setup",
          children: "DataForSEO API key setup"
        }), "."]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "1-clone-your-seotoolim-repo",
      children: "1) Clone your SeoTool.im repo"
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Fork ", jsxRuntimeExports.jsx(_components.code, {
        children: "emerilansel-jpg/SeoTool"
      }), " on GitHub if you want a repo you control, then clone it locally:"]
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "git"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " clone"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://github.com/YOUR_GITHUB_USER/open-seo.git"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "cd"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "corepack"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " enable"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "pnpm"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " install"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "If you do not need a fork, clone the upstream repo instead:"
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "git"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " clone"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://github.com/emerilansel-jpg/SeoTool.git"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "cd"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "corepack"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " enable"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "pnpm"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " install"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "2-log-in-to-cloudflare-once",
      children: "2) Log in to Cloudflare (once)"
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "pnpm"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " alchemy"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " login"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: '                # answer yes to "Customize OAuth scopes?" and enable access:write'
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "pnpm"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " alchemy"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " cloudflare"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " bootstrap"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: " # deploys alchemy's state-store Worker to your account"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Already logged in from before without the ", jsxRuntimeExports.jsx(_components.code, {
        children: "access:write"
      }), " scope? Run ", jsxRuntimeExports.jsx(_components.code, {
        children: "pnpm alchemy login --configure"
      }), " — a plain repeat login doesn't re-ask about scopes."]
    }), "\n", jsxRuntimeExports.jsxs(_components.h2, {
      id: "3-create-envselfhost",
      children: ["3) Create ", jsxRuntimeExports.jsx(_components.code, {
        children: ".env.selfhost"
      })]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Copy the template and fill in the required values:"
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsx(_components.code, {
          children: jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "cp"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " .env.selfhost.example"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " .env.selfhost"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "4-deploy",
      children: "4) Deploy"
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsx(_components.code, {
          children: jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "pnpm"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " deploy:selfhost"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --yes"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["This provisions the D1 database, KV namespaces, and R2 bucket, applies the database migrations, deploys the Worker, and creates the Cloudflare Access application protecting it (allowing exactly ", jsxRuntimeExports.jsx(_components.code, {
        children: "ACCESS_ALLOWED_EMAILS"
      }), "). If the account has no Zero Trust team yet, one is created for you, named after your workers.dev subdomain."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "5-validate-setup",
      children: "5) Validate setup"
    }), "\n", jsxRuntimeExports.jsxs(_components.ol, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Open the Worker URL printed at the end of the deploy."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Sign in with Cloudflare Access."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "SeoTool.im should load after login."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["If login fails, re-check ", jsxRuntimeExports.jsx(_components.code, {
        children: "ACCESS_ALLOWED_EMAILS"
      }), " and redeploy."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "connect-the-mcp-server-through-cloudflare-access",
      children: "Connect the MCP server through Cloudflare Access"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Use the same Cloudflare Access application that protects your SeoTool.im Worker. Managed OAuth is required for MCP clients and is not enabled by default."
    }), "\n", jsxRuntimeExports.jsxs(_components.ol, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Open Cloudflare Zero Trust."
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Go to ", jsxRuntimeExports.jsx(_components.code, {
          children: "Access controls"
        }), " -> ", jsxRuntimeExports.jsx(_components.code, {
          children: "Applications"
        }), "."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Find your SeoTool.im application, then select ", jsxRuntimeExports.jsx(_components.code, {
          children: "Edit"
        }), "."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Go to ", jsxRuntimeExports.jsx(_components.code, {
          children: "Additional settings"
        }), " -> ", jsxRuntimeExports.jsx(_components.code, {
          children: "OAuth"
        }), "."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Turn on ", jsxRuntimeExports.jsx(_components.code, {
          children: "Managed OAuth"
        }), "."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["In ", jsxRuntimeExports.jsx(_components.code, {
          children: "Managed OAuth settings"
        }), ", allow the redirect URIs your MCP clients use:", "\n", jsxRuntimeExports.jsxs(_components.ul, {
          children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
            children: ["Allow ", jsxRuntimeExports.jsx(_components.code, {
              children: "localhost"
            }), " / loopback clients for CLI and desktop agents (Codex CLI, Claude Code) that register ", jsxRuntimeExports.jsx(_components.code, {
              children: "http://localhost:PORT/callback"
            }), "."]
          }), "\n", jsxRuntimeExports.jsxs(_components.li, {
            children: ["Add HTTPS redirect URIs for web connectors (a path may end in ", jsxRuntimeExports.jsx(_components.code, {
              children: "/*"
            }), ")."]
          }), "\n", jsxRuntimeExports.jsxs(_components.li, {
            children: ["Without this, clients can't finish ", jsxRuntimeExports.jsx(_components.a, {
              href: "https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/managed-oauth/",
              children: "Dynamic Client Registration"
            }), " and log in but expose no tools."]
          }), "\n"]
        }), "\n"]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Save."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "MCP clients should connect to:"
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsx(_components.code, {
          children: jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "https://YOUR_WORKER_HOSTNAME/mcp"
            })
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "give-teammates-access-to-seotoolim",
      children: "Give teammates access to SeoTool.im"
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Add the teammate to ", jsxRuntimeExports.jsx(_components.code, {
        children: "ACCESS_ALLOWED_EMAILS"
      }), " in ", jsxRuntimeExports.jsx(_components.code, {
        children: ".env.selfhost"
      }), " and redeploy. Everyone allowed through shares one SeoTool.im workspace."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "updating-to-the-latest-seotoolim-version",
      children: "Updating to the latest SeoTool.im version"
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "git"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " pull"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "        # or: git fetch upstream && git merge upstream/main, if you forked"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "pnpm"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " install"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "pnpm"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " deploy:selfhost"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --yes"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "more-guides-on-github",
      children: "More guides on GitHub"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.a, {
          href: "https://github.com/emerilansel-jpg/SeoTool/blob/main/docs/SELF_HOSTING_CLOUDFLARE_OPERATIONS.md",
          children: "Operations"
        }), ": telemetry and other day-to-day tasks."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.a, {
          href: "https://github.com/emerilansel-jpg/SeoTool/blob/main/docs/SELF_HOSTING_CLOUDFLARE_LEGACY.md",
          children: "Legacy deployments"
        }), ": maintenance for installs created with the retired Deploy-button or manual Wrangler flows."]
      }), "\n"]
    })]
  });
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent, {
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
