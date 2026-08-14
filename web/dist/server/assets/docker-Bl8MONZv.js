import { U as jsxRuntimeExports } from "./worker-entry-oZfJ_xJd.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
let frontmatter = {
  "title": "Docker Self-Hosting",
  "description": "Run SeoTool.im locally with Docker Compose using the published GHCR image."
};
let extractedReferences = [{
  "href": "/docs/self-hosting/cloudflare"
}, {
  "href": "https://www.docker.com/products/docker-desktop/"
}, {
  "href": "/docs/self-hosting#dataforseo-api-key-setup"
}, {
  "href": "/docs/self-hosting#dataforseo-api-key-setup"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "Run SeoTool.im locally with Docker."
  }, {
    "heading": void 0,
    "content": "In Docker mode, SeoTool.im uses AUTH_MODE=local_noauth (no auth checks, local admin user admin@localhost). Only expose it behind your own auth-protected reverse proxy, tunnel, or private network. For internet-facing self-hosting, use Cloudflare instead."
  }, {
    "heading": void 0,
    "content": "The default compose.yaml uses the published GHCR image:"
  }, {
    "heading": void 0,
    "content": "ghcr.io/emerilansel-jpg/SeoTool:latest"
  }, {
    "heading": "prerequisites",
    "content": "Docker Desktop (or Docker Engine + Docker Compose)"
  }, {
    "heading": "prerequisites",
    "content": "A DataForSEO API key"
  }, {
    "heading": "quickstart",
    "content": "Clone the repo, then:"
  }, {
    "heading": "quickstart",
    "content": "Set DATAFORSEO_API_KEY in .env using the DataForSEO setup guide, then start SeoTool.im:"
  }, {
    "heading": "quickstart",
    "content": "Open http://localhost:<PORT> (default 3001). Each container start builds the app and may take 1-2 minutes; follow progress with docker compose logs -f."
  }, {
    "heading": "quickstart",
    "content": "Optional env values:"
  }, {
    "heading": "quickstart",
    "content": "PORT (defaults to 3001)"
  }, {
    "heading": "quickstart",
    "content": "ALLOWED_HOST (single reverse-proxy hostname to allow in Vite preview)"
  }, {
    "heading": "quickstart",
    "content": "AUTH_MODE=local_noauth (already set in compose)"
  }, {
    "heading": "quickstart",
    "content": "OPEN_SEO_IMAGE (defaults to ghcr.io/emerilansel-jpg/SeoTool:latest)"
  }, {
    "heading": "quickstart",
    "content": "If you are putting Docker behind a reverse proxy or a temporary tunnel, remember that Docker self-hosting runs with app auth disabled. Only expose it behind your own auth-protected reverse proxy, tunnel, or private network, and add the public hostname before restarting:"
  }, {
    "heading": "quickstart",
    "content": "You can also persist it in .env."
  }, {
    "heading": "telemetry",
    "content": "SeoTool.im collects anonymized telemetry for core usage events: heartbeats with aggregate counts (installs, users, projects, feature usage) tied to a random install ID, sent every 5 minutes during the first two hours after install, then at most once daily. Telemetry also includes failed setup check names and statuses, never values or error messages. No URLs, keywords, prompts, emails, or IP-derived location are collected, and idle installs send nothing."
  }, {
    "heading": "telemetry",
    "content": "To disable it, set OPENSEO_TELEMETRY_DISABLED=1 (or DO_NOT_TRACK=1) in .env, then run docker compose up -d --force-recreate open-seo."
  }, {
    "heading": "pin-to-a-specific-image-tag",
    "content": "Set OPEN_SEO_IMAGE in .env and restart:"
  }, {
    "heading": "build-your-own-image-locally",
    "content": "If you are testing local code changes, build and run a local tag:"
  }, {
    "heading": "common-commands",
    "content": "Restart service after env changes:"
  }, {
    "heading": "common-commands",
    "content": "Pull latest published image and restart:"
  }, {
    "heading": "common-commands",
    "content": "Stop:"
  }, {
    "heading": "health-and-troubleshooting",
    "content": "Startup checks appear in docker compose logs before the build. Once running, /api/health reports configuration and database status, and docker compose ps reports container health."
  }, {
    "heading": "troubleshooting-environment-variables",
    "content": "To confirm Docker Compose is using the expected environment variables:"
  }, {
    "heading": "troubleshooting-environment-variables",
    "content": "Check that AUTH_MODE=local_noauth, and that DATAFORSEO_API_KEY is the base64 encoded value of your DataForSEO email and API password in this format: email:password."
  }, {
    "heading": "troubleshooting-environment-variables",
    "content": "If you changed .env, recreate the container so Compose reapplies it:"
  }],
  "headings": [{
    "id": "prerequisites",
    "content": "Prerequisites"
  }, {
    "id": "quickstart",
    "content": "Quickstart"
  }, {
    "id": "telemetry",
    "content": "Telemetry"
  }, {
    "id": "pin-to-a-specific-image-tag",
    "content": "Pin to a specific image tag"
  }, {
    "id": "build-your-own-image-locally",
    "content": "Build your own image locally"
  }, {
    "id": "common-commands",
    "content": "Common commands"
  }, {
    "id": "health-and-troubleshooting",
    "content": "Health and troubleshooting"
  }, {
    "id": "troubleshooting-environment-variables",
    "content": "Troubleshooting environment variables"
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
  url: "#quickstart",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Quickstart"
  })
}, {
  depth: 2,
  url: "#telemetry",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Telemetry"
  })
}, {
  depth: 2,
  url: "#pin-to-a-specific-image-tag",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Pin to a specific image tag"
  })
}, {
  depth: 2,
  url: "#build-your-own-image-locally",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Build your own image locally"
  })
}, {
  depth: 2,
  url: "#common-commands",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Common commands"
  })
}, {
  depth: 2,
  url: "#health-and-troubleshooting",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Health and troubleshooting"
  })
}, {
  depth: 2,
  url: "#troubleshooting-environment-variables",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Troubleshooting environment variables"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.p, {
      children: "Run SeoTool.im locally with Docker."
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["In Docker mode, SeoTool.im uses ", jsxRuntimeExports.jsx(_components.code, {
        children: "AUTH_MODE=local_noauth"
      }), " (no auth checks, local admin user ", jsxRuntimeExports.jsx(_components.code, {
        children: "admin@localhost"
      }), "). Only expose it behind your own auth-protected reverse proxy, tunnel, or private network. For internet-facing self-hosting, use ", jsxRuntimeExports.jsx(_components.a, {
        href: "/docs/self-hosting/cloudflare",
        children: "Cloudflare"
      }), " instead."]
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["The default ", jsxRuntimeExports.jsx(_components.code, {
        children: "compose.yaml"
      }), " uses the published GHCR image:"]
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "ghcr.io/emerilansel-jpg/SeoTool:latest"
        })
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.a, {
          href: "https://www.docker.com/products/docker-desktop/",
          children: "Docker Desktop"
        }), " (or Docker Engine + Docker Compose)"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["A ", jsxRuntimeExports.jsx(_components.a, {
          href: "/docs/self-hosting#dataforseo-api-key-setup",
          children: "DataForSEO API key"
        })]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "quickstart",
      children: "Quickstart"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Clone the repo, then:"
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
              children: "cp"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " .env.example"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " .env"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Set ", jsxRuntimeExports.jsx(_components.code, {
        children: "DATAFORSEO_API_KEY"
      }), " in ", jsxRuntimeExports.jsx(_components.code, {
        children: ".env"
      }), " using the ", jsxRuntimeExports.jsx(_components.a, {
        href: "/docs/self-hosting#dataforseo-api-key-setup",
        children: "DataForSEO setup guide"
      }), ", then start SeoTool.im:"]
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
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Open ", jsxRuntimeExports.jsx(_components.code, {
        children: "http://localhost:<PORT>"
      }), " (default ", jsxRuntimeExports.jsx(_components.code, {
        children: "3001"
      }), "). Each container start builds the app and may take 1-2 minutes; follow progress with ", jsxRuntimeExports.jsx(_components.code, {
        children: "docker compose logs -f"
      }), "."]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Optional env values:"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "PORT"
        }), " (defaults to ", jsxRuntimeExports.jsx(_components.code, {
          children: "3001"
        }), ")"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "ALLOWED_HOST"
        }), " (single reverse-proxy hostname to allow in Vite preview)"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "AUTH_MODE=local_noauth"
        }), " (already set in compose)"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "OPEN_SEO_IMAGE"
        }), " (defaults to ", jsxRuntimeExports.jsx(_components.code, {
          children: "ghcr.io/emerilansel-jpg/SeoTool:latest"
        }), ")"]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "If you are putting Docker behind a reverse proxy or a temporary tunnel, remember that Docker self-hosting runs with app auth disabled. Only expose it behind your own auth-protected reverse proxy, tunnel, or private network, and add the public hostname before restarting:"
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
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "ALLOWED_HOST"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "yourdomain.com"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: " docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["You can also persist it in ", jsxRuntimeExports.jsx(_components.code, {
        children: ".env"
      }), "."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "telemetry",
      children: "Telemetry"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "SeoTool.im collects anonymized telemetry for core usage events: heartbeats with aggregate counts (installs, users, projects, feature usage) tied to a random install ID, sent every 5 minutes during the first two hours after install, then at most once daily. Telemetry also includes failed setup check names and statuses, never values or error messages. No URLs, keywords, prompts, emails, or IP-derived location are collected, and idle installs send nothing."
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["To disable it, set ", jsxRuntimeExports.jsx(_components.code, {
        children: "OPENSEO_TELEMETRY_DISABLED=1"
      }), " (or ", jsxRuntimeExports.jsx(_components.code, {
        children: "DO_NOT_TRACK=1"
      }), ") in ", jsxRuntimeExports.jsx(_components.code, {
        children: ".env"
      }), ", then run ", jsxRuntimeExports.jsx(_components.code, {
        children: "docker compose up -d --force-recreate open-seo"
      }), "."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "pin-to-a-specific-image-tag",
      children: "Pin to a specific image tag"
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Set ", jsxRuntimeExports.jsx(_components.code, {
        children: "OPEN_SEO_IMAGE"
      }), " in ", jsxRuntimeExports.jsx(_components.code, {
        children: ".env"
      }), " and restart:"]
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
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "OPEN_SEO_IMAGE"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "ghcr.io/emerilansel-jpg/SeoTool:v1.2.3"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "build-your-own-image-locally",
      children: "Build your own image locally"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "If you are testing local code changes, build and run a local tag:"
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
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " build"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -f"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " Dockerfile.selfhost"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -t"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo:local"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ."
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "OPEN_SEO_IMAGE"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "open-seo:local"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: " docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "common-commands",
      children: "Common commands"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Restart service after env changes:"
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
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Pull latest published image and restart:"
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
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " pull"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " && "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Stop:"
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
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " down"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "health-and-troubleshooting",
      children: "Health and troubleshooting"
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Startup checks appear in ", jsxRuntimeExports.jsx(_components.code, {
        children: "docker compose logs"
      }), " before the build. Once running, ", jsxRuntimeExports.jsx(_components.code, {
        children: "/api/health"
      }), " reports configuration and database status, and ", jsxRuntimeExports.jsx(_components.code, {
        children: "docker compose ps"
      }), " reports container health."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "troubleshooting-environment-variables",
      children: "Troubleshooting environment variables"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "To confirm Docker Compose is using the expected environment variables:"
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
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Check that ", jsxRuntimeExports.jsx(_components.code, {
        children: "AUTH_MODE=local_noauth"
      }), ", and that ", jsxRuntimeExports.jsx(_components.code, {
        children: "DATAFORSEO_API_KEY"
      }), " is the base64 encoded value of your DataForSEO email and API password in this format: ", jsxRuntimeExports.jsx(_components.code, {
        children: "email:password"
      }), "."]
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["If you changed ", jsxRuntimeExports.jsx(_components.code, {
        children: ".env"
      }), ", recreate the container so Compose reapplies it:"]
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
              children: "docker"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --force-recreate"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo"
            })]
          })
        })
      })
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
