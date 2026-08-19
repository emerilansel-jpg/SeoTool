import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "Competitive Landscape Agent Skill",
  "description": "Run competitive SEO research with your AI agent: map market leaders, content patterns, keyword coverage, backlinks, and gaps."
};
let extractedReferences = [{
  "href": "/docs/mcp"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/competitive-landscape"
}, {
  "href": "/docs/skills/competitor-analysis"
}, {
  "href": "/docs/skills/keyword-research"
}, {
  "href": "/docs/skills/keyword-clustering"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "The Competitive Landscape Agent Skill maps the SEO market before you decide what to build."
  }, {
    "heading": void 0,
    "content": "Your agent inspects the market from several angles: recurring ranking domains, content patterns, keyword coverage, and authority signals."
  }, {
    "heading": void 0,
    "content": "You get a higher-level view of who is winning, why they are winning, and where your site has room to compete."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Build a representative query set for a market or category."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Inspect SERPs to find recurring domains."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Separate direct product competitors from publishers, directories, communities, marketplaces, and resource sites."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Compare organic footprints and keyword coverage across the strongest domains."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Identify winning themes, content formats, authority patterns, and underserved angles."
  }, {
    "heading": "when-to-use-it",
    "content": "Use this skill when the market is unclear, you are entering a new category, or you do not know which SEO competitors matter."
  }, {
    "heading": "when-to-use-it",
    "content": "It also helps when business competitors are not the same as SEO competitors. In many markets, the pages winning search traffic come from publishers, directories, forums, or comparison sites rather than direct product competitors."
  }, {
    "heading": "what-you-get-back",
    "content": "Your agent should return market leaders, the most winnable opportunity area, the biggest ranking barrier, the query set it used, domain types, winning themes, and recommended next workflows."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Provide a category, market, seed keyword set, or your own domain."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Share known competitors if you have them."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Tell the agent the country or language if search behavior is market-specific."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Ask it to label domain types clearly so business competitors and SEO competitors do not get mixed together."
  }, {
    "heading": "use-it-with-seotoolim-mcp",
    "content": "Set up SeoTool.im MCP so your agent can research keywords, inspect SERPs, compare domains, and review backlink overview data when authority matters."
  }, {
    "heading": "read-the-actual-skill",
    "content": "The source SKILL.md lives on GitHub:"
  }, {
    "heading": "read-the-actual-skill",
    "content": "Competitive Landscape skill"
  }, {
    "heading": "related-skills",
    "content": "Competitor Analysis for a deep dive on one domain."
  }, {
    "heading": "related-skills",
    "content": "Keyword Research when you need to expand opportunity themes."
  }, {
    "heading": "related-skills",
    "content": "Keyword Clustering when you are ready to turn opportunities into page targets."
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
      command: "/competitive-landscape"
    }), "\n", jsx(_components.p, {
      children: "The Competitive Landscape Agent Skill maps the SEO market before you decide what to build."
    }), "\n", jsx(_components.p, {
      children: "Your agent inspects the market from several angles: recurring ranking domains, content patterns, keyword coverage, and authority signals."
    }), "\n", jsx(_components.p, {
      children: "You get a higher-level view of who is winning, why they are winning, and where your site has room to compete."
    }), "\n", jsx(_components.h2, {
      id: "what-this-skill-helps-your-agent-do",
      children: "What this skill helps your agent do"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Build a representative query set for a market or category."
      }), "\n", jsx(_components.li, {
        children: "Inspect SERPs to find recurring domains."
      }), "\n", jsx(_components.li, {
        children: "Separate direct product competitors from publishers, directories, communities, marketplaces, and resource sites."
      }), "\n", jsx(_components.li, {
        children: "Compare organic footprints and keyword coverage across the strongest domains."
      }), "\n", jsx(_components.li, {
        children: "Identify winning themes, content formats, authority patterns, and underserved angles."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "when-to-use-it",
      children: "When to use it"
    }), "\n", jsx(_components.p, {
      children: "Use this skill when the market is unclear, you are entering a new category, or you do not know which SEO competitors matter."
    }), "\n", jsx(_components.p, {
      children: "It also helps when business competitors are not the same as SEO competitors. In many markets, the pages winning search traffic come from publishers, directories, forums, or comparison sites rather than direct product competitors."
    }), "\n", jsx(_components.h2, {
      id: "what-you-get-back",
      children: "What you get back"
    }), "\n", jsx(_components.p, {
      children: "Your agent should return market leaders, the most winnable opportunity area, the biggest ranking barrier, the query set it used, domain types, winning themes, and recommended next workflows."
    }), "\n", jsx(_components.h2, {
      id: "how-to-get-the-best-result",
      children: "How to get the best result"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Provide a category, market, seed keyword set, or your own domain."
      }), "\n", jsx(_components.li, {
        children: "Share known competitors if you have them."
      }), "\n", jsx(_components.li, {
        children: "Tell the agent the country or language if search behavior is market-specific."
      }), "\n", jsx(_components.li, {
        children: "Ask it to label domain types clearly so business competitors and SEO competitors do not get mixed together."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "use-it-with-seotoolim-mcp",
      children: "Use it with SeoTool.im MCP"
    }), "\n", jsxs(_components.p, {
      children: ["Set up ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), " so your agent can research keywords, inspect SERPs, compare domains, and review backlink overview data when authority matters."]
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
          href: "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/competitive-landscape",
          children: "Competitive Landscape skill"
        })
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-skills",
      children: "Related skills"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/competitor-analysis",
          children: "Competitor Analysis"
        }), " for a deep dive on one domain."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/keyword-research",
          children: "Keyword Research"
        }), " when you need to expand opportunity themes."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/keyword-clustering",
          children: "Keyword Clustering"
        }), " when you are ready to turn opportunities into page targets."]
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
