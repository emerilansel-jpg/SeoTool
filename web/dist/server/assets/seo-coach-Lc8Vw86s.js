import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "SEO Coach Agent Skill",
  "description": "Learn SEO basics, choose the right workflow, and decide what to do next with your AI agent."
};
let extractedReferences = [{
  "href": "/docs/mcp"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/seo-coach"
}, {
  "href": "/docs/skills/seo-project-setup"
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
    "content": "The SEO Coach Agent Skill helps you decide what to do next."
  }, {
    "heading": void 0,
    "content": "Your agent looks at your goal, experience level, available data, and project context. It explains the options in plain language and recommends the next step."
  }, {
    "heading": void 0,
    "content": "You get a short plan: which workflow to run now, what information the agent needs, and why that step makes sense."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Explain SEO concepts without turning the conversation into a course."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Help you choose the next SeoTool.im Agent Skill based on your goal."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Distinguish strategy questions from execution work."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Explain when to use SeoTool.im MCP, web search, browser review, or local files."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Keep the next step small enough to act on."
  }, {
    "heading": "when-to-use-it",
    "content": "Use SEO Coach when you are asking questions like:"
  }, {
    "heading": "when-to-use-it",
    "content": '"Where should I start with SEO?"'
  }, {
    "heading": "when-to-use-it",
    "content": '"Should I research keywords or study competitors first?"'
  }, {
    "heading": "when-to-use-it",
    "content": '"What does SeoTool.im help my agent do?"'
  }, {
    "heading": "when-to-use-it",
    "content": '"How do I use AI for SEO without getting generic content?"'
  }, {
    "heading": "when-to-use-it",
    "content": "If you already know the exact workflow you want, go directly to that skill."
  }, {
    "heading": "what-you-get-back",
    "content": "Your agent should give you a clear explanation, a recommended next workflow, and the minimum information it needs to continue."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Tell the agent your SEO experience level."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Share the site or project you are working on."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Say whether you want strategy, execution help, or a tool explanation."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Ask for a recommendation if you are choosing between multiple workflows."
  }, {
    "heading": "use-it-with-seotoolim-mcp",
    "content": "The coach can help before MCP is connected, but your agent needs SeoTool.im MCP for live keyword, SERP, domain, backlink, and saved keyword data."
  }, {
    "heading": "read-the-actual-skill",
    "content": "The source SKILL.md lives on GitHub:"
  }, {
    "heading": "read-the-actual-skill",
    "content": "SEO Coach skill"
  }, {
    "heading": "related-skills",
    "content": "SEO Project Setup when you need setup and project context."
  }, {
    "heading": "related-skills",
    "content": "SEO Audit when you have a site and want a plain-language report on what to do first."
  }, {
    "heading": "related-skills",
    "content": "Keyword Research when you are ready to find opportunities."
  }, {
    "heading": "related-skills",
    "content": "Competitive Landscape when the market is unclear."
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
      command: "/seo-coach"
    }), "\n", jsx(_components.p, {
      children: "The SEO Coach Agent Skill helps you decide what to do next."
    }), "\n", jsx(_components.p, {
      children: "Your agent looks at your goal, experience level, available data, and project context. It explains the options in plain language and recommends the next step."
    }), "\n", jsx(_components.p, {
      children: "You get a short plan: which workflow to run now, what information the agent needs, and why that step makes sense."
    }), "\n", jsx(_components.h2, {
      id: "what-this-skill-helps-your-agent-do",
      children: "What this skill helps your agent do"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Explain SEO concepts without turning the conversation into a course."
      }), "\n", jsx(_components.li, {
        children: "Help you choose the next SeoTool.im Agent Skill based on your goal."
      }), "\n", jsx(_components.li, {
        children: "Distinguish strategy questions from execution work."
      }), "\n", jsx(_components.li, {
        children: "Explain when to use SeoTool.im MCP, web search, browser review, or local files."
      }), "\n", jsx(_components.li, {
        children: "Keep the next step small enough to act on."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "when-to-use-it",
      children: "When to use it"
    }), "\n", jsx(_components.p, {
      children: "Use SEO Coach when you are asking questions like:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: '"Where should I start with SEO?"'
      }), "\n", jsx(_components.li, {
        children: '"Should I research keywords or study competitors first?"'
      }), "\n", jsx(_components.li, {
        children: '"What does SeoTool.im help my agent do?"'
      }), "\n", jsx(_components.li, {
        children: '"How do I use AI for SEO without getting generic content?"'
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "If you already know the exact workflow you want, go directly to that skill."
    }), "\n", jsx(_components.h2, {
      id: "what-you-get-back",
      children: "What you get back"
    }), "\n", jsx(_components.p, {
      children: "Your agent should give you a clear explanation, a recommended next workflow, and the minimum information it needs to continue."
    }), "\n", jsx(_components.h2, {
      id: "how-to-get-the-best-result",
      children: "How to get the best result"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Tell the agent your SEO experience level."
      }), "\n", jsx(_components.li, {
        children: "Share the site or project you are working on."
      }), "\n", jsx(_components.li, {
        children: "Say whether you want strategy, execution help, or a tool explanation."
      }), "\n", jsx(_components.li, {
        children: "Ask for a recommendation if you are choosing between multiple workflows."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "use-it-with-seotoolim-mcp",
      children: "Use it with SeoTool.im MCP"
    }), "\n", jsxs(_components.p, {
      children: ["The coach can help before MCP is connected, but your agent needs ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), " for live keyword, SERP, domain, backlink, and saved keyword data."]
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
          href: "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/seo-coach",
          children: "SEO Coach skill"
        })
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-skills",
      children: "Related skills"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/seo-project-setup",
          children: "SEO Project Setup"
        }), " when you need setup and project context."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/seo-audit",
          children: "SEO Audit"
        }), " when you have a site and want a plain-language report on what to do first."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/keyword-research",
          children: "Keyword Research"
        }), " when you are ready to find opportunities."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/competitive-landscape",
          children: "Competitive Landscape"
        }), " when the market is unclear."]
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
