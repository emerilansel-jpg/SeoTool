import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "Competitor Analysis Agent Skill",
  "description": "Analyze one competitor's keywords, pages, backlinks, content themes, and SEO gaps with your AI agent."
};
let extractedReferences = [{
  "href": "/docs/mcp"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/competitor-analysis"
}, {
  "href": "/docs/skills/competitive-landscape"
}, {
  "href": "/docs/skills/keyword-clustering"
}, {
  "href": "/docs/skills/link-prospecting"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "The Competitor Analysis Agent Skill studies one competitor and turns the research into strategic takeaways."
  }, {
    "heading": void 0,
    "content": "Your agent reviews the competitor's keywords, pages, backlinks, and content themes. It looks for the patterns that explain where the competitor gets organic visibility and which parts matter for your own site."
  }, {
    "heading": void 0,
    "content": "You get a focused readout of what to learn from, what to avoid, and where your site may have a better angle."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Review a competitor's organic footprint."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Find ranking keyword themes and page opportunities."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Compare backlink and authority signals when relevant."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Inspect SERPs for important head-to-head keywords."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Separate evidence from inference."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Recommend stronger angles instead of copying competitor pages."
  }, {
    "heading": "when-to-use-it",
    "content": "Use this skill when a specific competitor keeps appearing in search results, sales conversations, or customer comparisons."
  }, {
    "heading": "when-to-use-it",
    "content": "It helps before creating comparison pages, refreshing positioning, finding keyword gaps, or deciding whether a competitor's SEO advantage comes from content, links, brand, or a small number of strong pages."
  }, {
    "heading": "what-you-get-back",
    "content": "Your agent should return a competitor snapshot, the biggest lesson, the best opportunity to beat them, keyword themes, content patterns, backlink notes, SERP observations, and priority actions."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Give the agent one competitor domain."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Share your own domain if you want a comparison."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Mention the product category or topic if the competitor is broad."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Ask the agent to filter for business fit, not just traffic."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Ask for evidence and recommendations separately."
  }, {
    "heading": "use-it-with-seotoolim-mcp",
    "content": "Set up SeoTool.im MCP so your agent can inspect domain overview data, ranking keywords, SERPs, and backlink context."
  }, {
    "heading": "read-the-actual-skill",
    "content": "The source SKILL.md lives on GitHub:"
  }, {
    "heading": "read-the-actual-skill",
    "content": "Competitor Analysis skill"
  }, {
    "heading": "related-skills",
    "content": "Competitive Landscape if you still need to identify the right competitors."
  }, {
    "heading": "related-skills",
    "content": "Keyword Clustering to turn useful competitor keywords into page groups."
  }, {
    "heading": "related-skills",
    "content": "Link Prospecting if competitor backlinks reveal outreach opportunities."
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
      command: "/competitor-analysis"
    }), "\n", jsx(_components.p, {
      children: "The Competitor Analysis Agent Skill studies one competitor and turns the research into strategic takeaways."
    }), "\n", jsx(_components.p, {
      children: "Your agent reviews the competitor's keywords, pages, backlinks, and content themes. It looks for the patterns that explain where the competitor gets organic visibility and which parts matter for your own site."
    }), "\n", jsx(_components.p, {
      children: "You get a focused readout of what to learn from, what to avoid, and where your site may have a better angle."
    }), "\n", jsx(_components.h2, {
      id: "what-this-skill-helps-your-agent-do",
      children: "What this skill helps your agent do"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Review a competitor's organic footprint."
      }), "\n", jsx(_components.li, {
        children: "Find ranking keyword themes and page opportunities."
      }), "\n", jsx(_components.li, {
        children: "Compare backlink and authority signals when relevant."
      }), "\n", jsx(_components.li, {
        children: "Inspect SERPs for important head-to-head keywords."
      }), "\n", jsx(_components.li, {
        children: "Separate evidence from inference."
      }), "\n", jsx(_components.li, {
        children: "Recommend stronger angles instead of copying competitor pages."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "when-to-use-it",
      children: "When to use it"
    }), "\n", jsx(_components.p, {
      children: "Use this skill when a specific competitor keeps appearing in search results, sales conversations, or customer comparisons."
    }), "\n", jsx(_components.p, {
      children: "It helps before creating comparison pages, refreshing positioning, finding keyword gaps, or deciding whether a competitor's SEO advantage comes from content, links, brand, or a small number of strong pages."
    }), "\n", jsx(_components.h2, {
      id: "what-you-get-back",
      children: "What you get back"
    }), "\n", jsx(_components.p, {
      children: "Your agent should return a competitor snapshot, the biggest lesson, the best opportunity to beat them, keyword themes, content patterns, backlink notes, SERP observations, and priority actions."
    }), "\n", jsx(_components.h2, {
      id: "how-to-get-the-best-result",
      children: "How to get the best result"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Give the agent one competitor domain."
      }), "\n", jsx(_components.li, {
        children: "Share your own domain if you want a comparison."
      }), "\n", jsx(_components.li, {
        children: "Mention the product category or topic if the competitor is broad."
      }), "\n", jsx(_components.li, {
        children: "Ask the agent to filter for business fit, not just traffic."
      }), "\n", jsx(_components.li, {
        children: "Ask for evidence and recommendations separately."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "use-it-with-seotoolim-mcp",
      children: "Use it with SeoTool.im MCP"
    }), "\n", jsxs(_components.p, {
      children: ["Set up ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), " so your agent can inspect domain overview data, ranking keywords, SERPs, and backlink context."]
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
          href: "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/competitor-analysis",
          children: "Competitor Analysis skill"
        })
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-skills",
      children: "Related skills"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/competitive-landscape",
          children: "Competitive Landscape"
        }), " if you still need to identify the right competitors."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/keyword-clustering",
          children: "Keyword Clustering"
        }), " to turn useful competitor keywords into page groups."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/link-prospecting",
          children: "Link Prospecting"
        }), " if competitor backlinks reveal outreach opportunities."]
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
