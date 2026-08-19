import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "SEO Project Setup Agent Skill",
  "description": "Create a local SEO workspace where your AI agent can save project context, notes, goals, exports, and preferences over time."
};
let extractedReferences = [{
  "href": "/docs/mcp"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/seo-project-setup"
}, {
  "href": "/docs/skills/seo-coach"
}, {
  "href": "/docs/skills/seo-audit"
}, {
  "href": "/docs/skills/keyword-research"
}, {
  "href": "/docs/skills/competitive-landscape"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "The SEO Project Setup Agent Skill gives your agent the context it needs before doing SEO work for a site."
  }, {
    "heading": void 0,
    "content": "Your agent organizes the website, goals, competitors, files, and preferences once. It creates a working folder for notes, exports, briefs, and project context."
  }, {
    "heading": void 0,
    "content": "That workspace carries context across sessions, so future keyword research, clustering, competitor analysis, and content planning are more specific to your site."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Pick or create a working folder for one website or SEO project."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Save the basics: domain, goals, audience, positioning, competitors, and target markets."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Organize exports and notes so they are easy to reuse in later sessions."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Capture how you want the agent to approach SEO for this project."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Recommend the next SeoTool.im Agent Skill to run."
  }, {
    "heading": "when-to-use-it",
    "content": "Use this skill when you are starting SEO work for a website, client, product, or content program."
  }, {
    "heading": "when-to-use-it",
    "content": "It helps when SEO work will span multiple sessions. Keep project context in one folder and let the agent build on it."
  }, {
    "heading": "what-you-get-back",
    "content": "Your agent should help set up a simple workspace structure and a short project summary. The summary should explain what site is in scope, what goals matter, what files or exports are available, and what workflow should run next."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Run the skill from the folder where you want SEO work to live."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Share your primary domain and any important subdomains."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Tell the agent what SEO should support: signups, leads, revenue, awareness, or recovery from a traffic drop."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Provide positioning notes, competitor names, or customer context if you have them."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Add Google Search Console exports when available."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Tell the agent any preferences you want it to remember for future SEO work."
  }, {
    "heading": "use-it-with-seotoolim-mcp",
    "content": "Set up SeoTool.im MCP so your agent can confirm the right SeoTool.im project and use live SEO data in later workflows."
  }, {
    "heading": "read-the-actual-skill",
    "content": "The source SKILL.md lives on GitHub:"
  }, {
    "heading": "read-the-actual-skill",
    "content": "SEO Project Setup skill"
  }, {
    "heading": "related-skills",
    "content": "SEO Coach if you are new to SEO or unsure where to start."
  }, {
    "heading": "related-skills",
    "content": "SEO Audit once setup is done and you want a plain-language report on what to do first."
  }, {
    "heading": "related-skills",
    "content": "Keyword Research when you are ready to find search opportunities."
  }, {
    "heading": "related-skills",
    "content": "Competitive Landscape when you need to understand the market first."
  }],
  "headings": [{
    "id": "what-this-skill-helps-your-agent-do",
    "content": "What this skill helps your agent do"
  }, {
    "id": "when-to-use-it",
    "content": "When to use it"
  }, {
    "id": "what-you-get-back",
    "content": "What you get back"
  }, {
    "id": "how-to-get-the-best-result",
    "content": "How to get the best result"
  }, {
    "id": "use-it-with-seotoolim-mcp",
    "content": "Use it with SeoTool.im MCP"
  }, {
    "id": "read-the-actual-skill",
    "content": "Read the actual skill"
  }, {
    "id": "related-skills",
    "content": "Related skills"
  }]
};
const toc = [{
  depth: 2,
  url: "#what-this-skill-helps-your-agent-do",
  title: jsx(Fragment, {
    children: "What this skill helps your agent do"
  })
}, {
  depth: 2,
  url: "#when-to-use-it",
  title: jsx(Fragment, {
    children: "When to use it"
  })
}, {
  depth: 2,
  url: "#what-you-get-back",
  title: jsx(Fragment, {
    children: "What you get back"
  })
}, {
  depth: 2,
  url: "#how-to-get-the-best-result",
  title: jsx(Fragment, {
    children: "How to get the best result"
  })
}, {
  depth: 2,
  url: "#use-it-with-seotoolim-mcp",
  title: jsx(Fragment, {
    children: "Use it with SeoTool.im MCP"
  })
}, {
  depth: 2,
  url: "#read-the-actual-skill",
  title: jsx(Fragment, {
    children: "Read the actual skill"
  })
}, {
  depth: 2,
  url: "#related-skills",
  title: jsx(Fragment, {
    children: "Related skills"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    li: "li",
    p: "p",
    ul: "ul",
    ...props.components
  }, { RunSkillCallout } = _components;
  if (!RunSkillCallout) _missingMdxReference("RunSkillCallout");
  return jsxs(Fragment, {
    children: [jsx(RunSkillCallout, {
      command: "/seo-project-setup"
    }), "\n", jsx(_components.p, {
      children: "The SEO Project Setup Agent Skill gives your agent the context it needs before doing SEO work for a site."
    }), "\n", jsx(_components.p, {
      children: "Your agent organizes the website, goals, competitors, files, and preferences once. It creates a working folder for notes, exports, briefs, and project context."
    }), "\n", jsx(_components.p, {
      children: "That workspace carries context across sessions, so future keyword research, clustering, competitor analysis, and content planning are more specific to your site."
    }), "\n", jsx(_components.h2, {
      id: "what-this-skill-helps-your-agent-do",
      children: "What this skill helps your agent do"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Pick or create a working folder for one website or SEO project."
      }), "\n", jsx(_components.li, {
        children: "Save the basics: domain, goals, audience, positioning, competitors, and target markets."
      }), "\n", jsx(_components.li, {
        children: "Organize exports and notes so they are easy to reuse in later sessions."
      }), "\n", jsx(_components.li, {
        children: "Capture how you want the agent to approach SEO for this project."
      }), "\n", jsx(_components.li, {
        children: "Recommend the next SeoTool.im Agent Skill to run."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "when-to-use-it",
      children: "When to use it"
    }), "\n", jsx(_components.p, {
      children: "Use this skill when you are starting SEO work for a website, client, product, or content program."
    }), "\n", jsx(_components.p, {
      children: "It helps when SEO work will span multiple sessions. Keep project context in one folder and let the agent build on it."
    }), "\n", jsx(_components.h2, {
      id: "what-you-get-back",
      children: "What you get back"
    }), "\n", jsx(_components.p, {
      children: "Your agent should help set up a simple workspace structure and a short project summary. The summary should explain what site is in scope, what goals matter, what files or exports are available, and what workflow should run next."
    }), "\n", jsx(_components.h2, {
      id: "how-to-get-the-best-result",
      children: "How to get the best result"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Run the skill from the folder where you want SEO work to live."
      }), "\n", jsx(_components.li, {
        children: "Share your primary domain and any important subdomains."
      }), "\n", jsx(_components.li, {
        children: "Tell the agent what SEO should support: signups, leads, revenue, awareness, or recovery from a traffic drop."
      }), "\n", jsx(_components.li, {
        children: "Provide positioning notes, competitor names, or customer context if you have them."
      }), "\n", jsx(_components.li, {
        children: "Add Google Search Console exports when available."
      }), "\n", jsx(_components.li, {
        children: "Tell the agent any preferences you want it to remember for future SEO work."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "use-it-with-seotoolim-mcp",
      children: "Use it with SeoTool.im MCP"
    }), "\n", jsxs(_components.p, {
      children: ["Set up ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), " so your agent can confirm the right SeoTool.im project and use live SEO data in later workflows."]
    }), "\n", jsx(_components.h2, {
      id: "read-the-actual-skill",
      children: "Read the actual skill"
    }), "\n", jsxs(_components.p, {
      children: ["The source ", jsx(_components.code, {
        children: "SKILL.md"
      }), " lives on GitHub:"]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: jsx(_components.a, {
          href: "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/seo-project-setup",
          children: "SEO Project Setup skill"
        })
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-skills",
      children: "Related skills"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/seo-coach",
          children: "SEO Coach"
        }), " if you are new to SEO or unsure where to start."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/seo-audit",
          children: "SEO Audit"
        }), " once setup is done and you want a plain-language report on what to do first."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/keyword-research",
          children: "Keyword Research"
        }), " when you are ready to find search opportunities."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/competitive-landscape",
          children: "Competitive Landscape"
        }), " when you need to understand the market first."]
      }), "\n"]
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
function _missingMdxReference(id, component) {
  throw new Error("Expected component `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}
export {
  MDXContent as default,
  extractedReferences,
  frontmatter,
  structuredData,
  toc
};
