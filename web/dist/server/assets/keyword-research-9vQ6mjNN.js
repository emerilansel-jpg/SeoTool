import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "Keyword Research Agent Skill",
  "description": "Find keyword opportunities from live SEO data with Claude Code, Codex, or another AI agent."
};
let extractedReferences = [{
  "href": "/docs/mcp"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/keyword-research"
}, {
  "href": "/docs/skills/keyword-clustering"
}, {
  "href": "/docs/skills/competitive-landscape"
}, {
  "href": "/docs/skills/competitor-analysis"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "The Keyword Research Agent Skill finds keywords your site can target."
  }, {
    "heading": void 0,
    "content": "Your agent pulls keyword ideas, checks difficulty, inspects SERPs, and filters terms against your company, website, and goals."
  }, {
    "heading": void 0,
    "content": "You get a prioritized set of opportunities, with notes on why each keyword fits, how hard it may be to rank, and what to do next."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Research keywords from seed topics, products, pages, competitors, or audience problems."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Evaluate volume, difficulty, CPC, intent, and SERP competitiveness."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Filter out irrelevant, duplicate, branded-only, or off-strategy terms."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Decide which keywords are worth targeting now, saving for later, or sending into clustering."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Ask before saving keywords back to SeoTool.im."
  }, {
    "heading": "when-to-use-it",
    "content": "Use this skill when you have a topic or market but do not yet know which searches are worth pursuing."
  }, {
    "heading": "when-to-use-it",
    "content": "It helps before writing new pages, planning a content roadmap, refreshing a landing page, or deciding whether a topic has enough search demand to matter."
  }, {
    "heading": "what-you-get-back",
    "content": "Your agent should return a prioritized keyword shortlist, a longer opportunity table, SERP caveats, and a recommended next action. A good result explains why a keyword is useful, not just whether it has search volume."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Give the agent one to five focused seed topics."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Tell it the product, audience, or page type you care about."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Mention the target country or language when it matters."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Ask the agent to inspect SERPs for ambiguous or high-value terms."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Confirm before saving selected keywords to SeoTool.im."
  }, {
    "heading": "use-it-with-seotoolim-mcp",
    "content": "Set up SeoTool.im MCP so your agent can research live keyword metrics, inspect Google SERPs, check saved keywords, and save selected terms with your approval."
  }, {
    "heading": "read-the-actual-skill",
    "content": "The source SKILL.md lives on GitHub:"
  }, {
    "heading": "read-the-actual-skill",
    "content": "Keyword Research skill"
  }, {
    "heading": "related-skills",
    "content": "Keyword Clustering to turn selected keywords into page groups."
  }, {
    "heading": "related-skills",
    "content": "Competitive Landscape to understand the broader market."
  }, {
    "heading": "related-skills",
    "content": "Competitor Analysis to study one competitor's ranking keywords."
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
      command: "/keyword-research"
    }), "\n", jsx(_components.p, {
      children: "The Keyword Research Agent Skill finds keywords your site can target."
    }), "\n", jsx(_components.p, {
      children: "Your agent pulls keyword ideas, checks difficulty, inspects SERPs, and filters terms against your company, website, and goals."
    }), "\n", jsx(_components.p, {
      children: "You get a prioritized set of opportunities, with notes on why each keyword fits, how hard it may be to rank, and what to do next."
    }), "\n", jsx(_components.h2, {
      id: "what-this-skill-helps-your-agent-do",
      children: "What this skill helps your agent do"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Research keywords from seed topics, products, pages, competitors, or audience problems."
      }), "\n", jsx(_components.li, {
        children: "Evaluate volume, difficulty, CPC, intent, and SERP competitiveness."
      }), "\n", jsx(_components.li, {
        children: "Filter out irrelevant, duplicate, branded-only, or off-strategy terms."
      }), "\n", jsx(_components.li, {
        children: "Decide which keywords are worth targeting now, saving for later, or sending into clustering."
      }), "\n", jsx(_components.li, {
        children: "Ask before saving keywords back to SeoTool.im."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "when-to-use-it",
      children: "When to use it"
    }), "\n", jsx(_components.p, {
      children: "Use this skill when you have a topic or market but do not yet know which searches are worth pursuing."
    }), "\n", jsx(_components.p, {
      children: "It helps before writing new pages, planning a content roadmap, refreshing a landing page, or deciding whether a topic has enough search demand to matter."
    }), "\n", jsx(_components.h2, {
      id: "what-you-get-back",
      children: "What you get back"
    }), "\n", jsx(_components.p, {
      children: "Your agent should return a prioritized keyword shortlist, a longer opportunity table, SERP caveats, and a recommended next action. A good result explains why a keyword is useful, not just whether it has search volume."
    }), "\n", jsx(_components.h2, {
      id: "how-to-get-the-best-result",
      children: "How to get the best result"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Give the agent one to five focused seed topics."
      }), "\n", jsx(_components.li, {
        children: "Tell it the product, audience, or page type you care about."
      }), "\n", jsx(_components.li, {
        children: "Mention the target country or language when it matters."
      }), "\n", jsx(_components.li, {
        children: "Ask the agent to inspect SERPs for ambiguous or high-value terms."
      }), "\n", jsx(_components.li, {
        children: "Confirm before saving selected keywords to SeoTool.im."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "use-it-with-seotoolim-mcp",
      children: "Use it with SeoTool.im MCP"
    }), "\n", jsxs(_components.p, {
      children: ["Set up ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), " so your agent can research live keyword metrics, inspect Google SERPs, check saved keywords, and save selected terms with your approval."]
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
          href: "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/keyword-research",
          children: "Keyword Research skill"
        })
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-skills",
      children: "Related skills"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/keyword-clustering",
          children: "Keyword Clustering"
        }), " to turn selected keywords into page groups."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/competitive-landscape",
          children: "Competitive Landscape"
        }), " to understand the broader market."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/competitor-analysis",
          children: "Competitor Analysis"
        }), " to study one competitor's ranking keywords."]
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
