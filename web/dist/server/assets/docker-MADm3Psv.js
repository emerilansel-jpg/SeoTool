import { jsx, jsxs, Fragment } from "react/jsx-runtime";
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
  title: jsx(Fragment, {
    children: "Prerequisites"
  })
}, {
  depth: 2,
  url: "#quickstart",
  title: jsx(Fragment, {
    children: "Quickstart"
  })
}, {
  depth: 2,
  url: "#telemetry",
  title: jsx(Fragment, {
    children: "Telemetry"
  })
}, {
  depth: 2,
  url: "#pin-to-a-specific-image-tag",
  title: jsx(Fragment, {
    children: "Pin to a specific image tag"
  })
}, {
  depth: 2,
  url: "#build-your-own-image-locally",
  title: jsx(Fragment, {
    children: "Build your own image locally"
  })
}, {
  depth: 2,
  url: "#common-commands",
  title: jsx(Fragment, {
    children: "Common commands"
  })
}, {
  depth: 2,
  url: "#health-and-troubleshooting",
  title: jsx(Fragment, {
    children: "Health and troubleshooting"
  })
}, {
  depth: 2,
  url: "#troubleshooting-environment-variables",
  title: jsx(Fragment, {
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
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "Run SeoTool.im locally with Docker."
    }), "\n", jsxs(_components.p, {
      children: ["In Docker mode, SeoTool.im uses ", jsx(_components.code, {
        children: "AUTH_MODE=local_noauth"
      }), " (no auth checks, local admin user ", jsx(_components.code, {
        children: "admin@localhost"
      }), "). Only expose it behind your own auth-protected reverse proxy, tunnel, or private network. For internet-facing self-hosting, use ", jsx(_components.a, {
        href: "/docs/self-hosting/cloudflare",
        children: "Cloudflare"
      }), " instead."]
    }), "\n", jsxs(_components.p, {
      children: ["The default ", jsx(_components.code, {
        children: "compose.yaml"
      }), " uses the published GHCR image:"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: jsx(_components.code, {
          children: "ghcr.io/emerilansel-jpg/SeoTool:latest"
        })
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "https://www.docker.com/products/docker-desktop/",
          children: "Docker Desktop"
        }), " (or Docker Engine + Docker Compose)"]
      }), "\n", jsxs(_components.li, {
        children: ["A ", jsx(_components.a, {
          href: "/docs/self-hosting#dataforseo-api-key-setup",
          children: "DataForSEO API key"
        })]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "quickstart",
      children: "Quickstart"
    }), "\n", jsx(_components.p, {
      children: "Clone the repo, then:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "git"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " clone"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://github.com/emerilansel-jpg/SeoTool.git"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "cd"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "cp"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " .env.example"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " .env"
            })]
          })]
        })
      })
    }), "\n", jsxs(_components.p, {
      children: ["Set ", jsx(_components.code, {
        children: "DATAFORSEO_API_KEY"
      }), " in ", jsx(_components.code, {
        children: ".env"
      }), " using the ", jsx(_components.a, {
        href: "/docs/self-hosting#dataforseo-api-key-setup",
        children: "DataForSEO setup guide"
      }), ", then start SeoTool.im:"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })
        })
      })
    }), "\n", jsxs(_components.p, {
      children: ["Open ", jsx(_components.code, {
        children: "http://localhost:<PORT>"
      }), " (default ", jsx(_components.code, {
        children: "3001"
      }), "). Each container start builds the app and may take 1-2 minutes; follow progress with ", jsx(_components.code, {
        children: "docker compose logs -f"
      }), "."]
    }), "\n", jsx(_components.p, {
      children: "Optional env values:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "PORT"
        }), " (defaults to ", jsx(_components.code, {
          children: "3001"
        }), ")"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "ALLOWED_HOST"
        }), " (single reverse-proxy hostname to allow in Vite preview)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "AUTH_MODE=local_noauth"
        }), " (already set in compose)"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "OPEN_SEO_IMAGE"
        }), " (defaults to ", jsx(_components.code, {
          children: "ghcr.io/emerilansel-jpg/SeoTool:latest"
        }), ")"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "If you are putting Docker behind a reverse proxy or a temporary tunnel, remember that Docker self-hosting runs with app auth disabled. Only expose it behind your own auth-protected reverse proxy, tunnel, or private network, and add the public hostname before restarting:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "ALLOWED_HOST"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "yourdomain.com"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: " docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })
        })
      })
    }), "\n", jsxs(_components.p, {
      children: ["You can also persist it in ", jsx(_components.code, {
        children: ".env"
      }), "."]
    }), "\n", jsx(_components.h2, {
      id: "telemetry",
      children: "Telemetry"
    }), "\n", jsx(_components.p, {
      children: "SeoTool.im collects anonymized telemetry for core usage events: heartbeats with aggregate counts (installs, users, projects, feature usage) tied to a random install ID, sent every 5 minutes during the first two hours after install, then at most once daily. Telemetry also includes failed setup check names and statuses, never values or error messages. No URLs, keywords, prompts, emails, or IP-derived location are collected, and idle installs send nothing."
    }), "\n", jsxs(_components.p, {
      children: ["To disable it, set ", jsx(_components.code, {
        children: "OPENSEO_TELEMETRY_DISABLED=1"
      }), " (or ", jsx(_components.code, {
        children: "DO_NOT_TRACK=1"
      }), ") in ", jsx(_components.code, {
        children: ".env"
      }), ", then run ", jsx(_components.code, {
        children: "docker compose up -d --force-recreate open-seo"
      }), "."]
    }), "\n", jsx(_components.h2, {
      id: "pin-to-a-specific-image-tag",
      children: "Pin to a specific image tag"
    }), "\n", jsxs(_components.p, {
      children: ["Set ", jsx(_components.code, {
        children: "OPEN_SEO_IMAGE"
      }), " in ", jsx(_components.code, {
        children: ".env"
      }), " and restart:"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "OPEN_SEO_IMAGE"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "ghcr.io/emerilansel-jpg/SeoTool:v1.2.3"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "build-your-own-image-locally",
      children: "Build your own image locally"
    }), "\n", jsx(_components.p, {
      children: "If you are testing local code changes, build and run a local tag:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " build"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -f"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " Dockerfile.selfhost"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -t"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo:local"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ."
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "OPEN_SEO_IMAGE"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "open-seo:local"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: " docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "common-commands",
      children: "Common commands"
    }), "\n", jsx(_components.p, {
      children: "Restart service after env changes:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: "Pull latest published image and restart:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " pull"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " && "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: "Stop:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " down"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "health-and-troubleshooting",
      children: "Health and troubleshooting"
    }), "\n", jsxs(_components.p, {
      children: ["Startup checks appear in ", jsx(_components.code, {
        children: "docker compose logs"
      }), " before the build. Once running, ", jsx(_components.code, {
        children: "/api/health"
      }), " reports configuration and database status, and ", jsx(_components.code, {
        children: "docker compose ps"
      }), " reports container health."]
    }), "\n", jsx(_components.h2, {
      id: "troubleshooting-environment-variables",
      children: "Troubleshooting environment variables"
    }), "\n", jsx(_components.p, {
      children: "To confirm Docker Compose is using the expected environment variables:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " config"
            })]
          })
        })
      })
    }), "\n", jsxs(_components.p, {
      children: ["Check that ", jsx(_components.code, {
        children: "AUTH_MODE=local_noauth"
      }), ", and that ", jsx(_components.code, {
        children: "DATAFORSEO_API_KEY"
      }), " is the base64 encoded value of your DataForSEO email and API password in this format: ", jsx(_components.code, {
        children: "email:password"
      }), "."]
    }), "\n", jsxs(_components.p, {
      children: ["If you changed ", jsx(_components.code, {
        children: ".env"
      }), ", recreate the container so Compose reapplies it:"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "docker"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " compose"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " up"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --force-recreate"
            }), jsx(_components.span, {
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
