import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
let frontmatter = {
  "title": "Set up SeoTool.im Agent Skills",
  "description": "Add SeoTool.im skill files to your AI agent after connecting SeoTool.im MCP."
};
let extractedReferences = [{
  "href": "/docs/mcp"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills"
}, {
  "href": "/docs/skills/seo-project-setup"
}, {
  "href": "/docs/skills/seo-coach"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "SeoTool.im Agent Skills are separate files from SeoTool.im MCP."
  }, {
    "heading": void 0,
    "content": "First, set up SeoTool.im MCP. MCP gives your agent access to SeoTool.im data."
  }, {
    "heading": void 0,
    "content": "Then add the SeoTool.im SKILL.md files you want your agent to use. Each skill gives your agent one SEO workflow."
  }, {
    "heading": "choose-an-installation-option",
    "content": "Pick the option that matches how you want to install the files."
  }, {
    "heading": "option-1-install-and-choose-interactively",
    "content": "Use this if you want the installer to show the available skills and agents."
  }, {
    "heading": "option-2-install-all-seotoolim-skills",
    "content": "Use this if you want every SeoTool.im skill."
  }, {
    "heading": "option-3-install-all-skills-for-claude-code-only",
    "content": "Use this if the skills should be available in Claude Code only."
  }, {
    "heading": "option-4-install-all-skills-for-openai-codex-only",
    "content": "Use this if the skills should be available in Codex only."
  }, {
    "heading": "option-5-copy-the-skill-files-manually",
    "content": "Use this if you prefer to copy files into your agent's skills folder."
  }, {
    "heading": "option-5-copy-the-skill-files-manually",
    "content": "You can also review the source skills on GitHub:"
  }, {
    "heading": "option-5-copy-the-skill-files-manually",
    "content": "SeoTool.im Agent Skills on GitHub"
  }, {
    "heading": "option-5-copy-the-skill-files-manually",
    "content": "Each skill page also links to its source SKILL.md."
  }, {
    "heading": "run-a-skill",
    "content": "After the skill files are available to your agent, run the matching slash command:"
  }, {
    "heading": "run-a-skill",
    "content": "/seo-project-setup"
  }, {
    "heading": "run-a-skill",
    "content": "/seo-coach"
  }, {
    "heading": "run-a-skill",
    "content": "/keyword-research"
  }, {
    "heading": "run-a-skill",
    "content": "/keyword-clustering"
  }, {
    "heading": "run-a-skill",
    "content": "/competitive-landscape"
  }, {
    "heading": "run-a-skill",
    "content": "/competitor-analysis"
  }, {
    "heading": "run-a-skill",
    "content": "/link-prospecting"
  }, {
    "heading": "next-step",
    "content": "Start with SEO Project Setup if this is a new SEO project, or SEO Coach if you are not sure which workflow to run first."
  }],
  "headings": [{
    "id": "choose-an-installation-option",
    "content": "Choose an installation option"
  }, {
    "id": "option-1-install-and-choose-interactively",
    "content": "Option 1: Install and choose interactively"
  }, {
    "id": "option-2-install-all-seotoolim-skills",
    "content": "Option 2: Install all SeoTool.im skills"
  }, {
    "id": "option-3-install-all-skills-for-claude-code-only",
    "content": "Option 3: Install all skills for Claude Code only"
  }, {
    "id": "option-4-install-all-skills-for-openai-codex-only",
    "content": "Option 4: Install all skills for OpenAI Codex only"
  }, {
    "id": "option-5-copy-the-skill-files-manually",
    "content": "Option 5: Copy the skill files manually"
  }, {
    "id": "run-a-skill",
    "content": "Run a skill"
  }, {
    "id": "next-step",
    "content": "Next step"
  }]
};
const toc = [{
  depth: 2,
  url: "#choose-an-installation-option",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Choose an installation option"
  })
}, {
  depth: 3,
  url: "#option-1-install-and-choose-interactively",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Option 1: Install and choose interactively"
  })
}, {
  depth: 3,
  url: "#option-2-install-all-seotoolim-skills",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Option 2: Install all SeoTool.im skills"
  })
}, {
  depth: 3,
  url: "#option-3-install-all-skills-for-claude-code-only",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Option 3: Install all skills for Claude Code only"
  })
}, {
  depth: 3,
  url: "#option-4-install-all-skills-for-openai-codex-only",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Option 4: Install all skills for OpenAI Codex only"
  })
}, {
  depth: 3,
  url: "#option-5-copy-the-skill-files-manually",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Option 5: Copy the skill files manually"
  })
}, {
  depth: 2,
  url: "#run-a-skill",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Run a skill"
  })
}, {
  depth: 2,
  url: "#next-step",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Next step"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    h3: "h3",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.p, {
      children: "SeoTool.im Agent Skills are separate files from SeoTool.im MCP."
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["First, ", jsxRuntimeExports.jsx(_components.a, {
        href: "/docs/mcp",
        children: "set up SeoTool.im MCP"
      }), ". MCP gives your agent access to SeoTool.im data."]
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Then add the SeoTool.im ", jsxRuntimeExports.jsx(_components.code, {
        children: "SKILL.md"
      }), " files you want your agent to use. Each skill gives your agent one SEO workflow."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "choose-an-installation-option",
      children: "Choose an installation option"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Pick the option that matches how you want to install the files."
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "option-1-install-and-choose-interactively",
      children: "Option 1: Install and choose interactively"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Use this if you want the installer to show the available skills and agents."
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
              children: "npx"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " skills"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " add"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " emerilansel-jpg/SeoTool"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "option-2-install-all-seotoolim-skills",
      children: "Option 2: Install all SeoTool.im skills"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Use this if you want every SeoTool.im skill."
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
              children: "npx"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " skills"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " add"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " emerilansel-jpg/SeoTool"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --skill"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " '*'"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "option-3-install-all-skills-for-claude-code-only",
      children: "Option 3: Install all skills for Claude Code only"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Use this if the skills should be available in Claude Code only."
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
              children: "npx"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " skills"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " add"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " emerilansel-jpg/SeoTool"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --skill"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " '*'"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --agent"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " claude-code"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "option-4-install-all-skills-for-openai-codex-only",
      children: "Option 4: Install all skills for OpenAI Codex only"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Use this if the skills should be available in Codex only."
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
              children: "npx"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " skills"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " add"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " emerilansel-jpg/SeoTool"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --skill"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " '*'"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --agent"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " codex"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "option-5-copy-the-skill-files-manually",
      children: "Option 5: Copy the skill files manually"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Use this if you prefer to copy files into your agent's skills folder."
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
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line"
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Codex"
            })
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "mkdir"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -p"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ~/.codex/skills"
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
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -R"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo/.agents/skills/"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "*"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ~/.codex/skills/"
            })]
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line"
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Claude Code"
            })
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "mkdir"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -p"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ~/.claude/skills"
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
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -R"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " open-seo/.agents/skills/"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "*"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ~/.claude/skills/"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "You can also review the source skills on GitHub:"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.a, {
          href: "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills",
          children: "SeoTool.im Agent Skills on GitHub"
        })
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Each skill page also links to its source ", jsxRuntimeExports.jsx(_components.code, {
        children: "SKILL.md"
      }), "."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "run-a-skill",
      children: "Run a skill"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "After the skill files are available to your agent, run the matching slash command:"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "/seo-project-setup"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "/seo-coach"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "/keyword-research"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "/keyword-clustering"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "/competitive-landscape"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "/competitor-analysis"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "/link-prospecting"
        })
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "next-step",
      children: "Next step"
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Start with ", jsxRuntimeExports.jsx(_components.a, {
        href: "/docs/skills/seo-project-setup",
        children: "SEO Project Setup"
      }), " if this is a new SEO project, or ", jsxRuntimeExports.jsx(_components.a, {
        href: "/docs/skills/seo-coach",
        children: "SEO Coach"
      }), " if you are not sure which workflow to run first."]
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
