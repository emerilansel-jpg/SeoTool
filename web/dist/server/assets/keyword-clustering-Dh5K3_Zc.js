import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "Keyword Clustering Agent Skill",
  "description": "Cluster keywords by intent and map them to existing or proposed pages with your AI agent."
};
let extractedReferences = [{
  "href": "/docs/mcp"
}, {
  "href": "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/keyword-clustering"
}, {
  "href": "/docs/skills/keyword-research"
}, {
  "href": "/docs/skills/competitor-analysis"
}, {
  "href": "/docs/skills/seo-coach"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "The Keyword Clustering Agent Skill turns a messy keyword list into a page plan."
  }, {
    "heading": void 0,
    "content": "Your agent sorts keywords, compares intent, and decides which terms belong on the same page. It uses the keyword set, SERP context, and your site context to recommend page groups."
  }, {
    "heading": void 0,
    "content": "You get a content map: which keywords belong together, which pages should target them, where existing pages fit, and where cannibalization might become a problem."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Group keywords by intent, SERP similarity, and page type."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Separate terms that look similar but need different pages."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Map clusters to existing URLs when they fit."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Recommend new pages when no current page matches the search intent."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Flag weak, off-strategy, or do-not-target keywords."
  }, {
    "heading": "what-this-skill-helps-your-agent-do",
    "content": "Suggest saved keyword tags only after user confirmation."
  }, {
    "heading": "when-to-use-it",
    "content": "Use this skill when you already have keywords but do not yet have a content plan."
  }, {
    "heading": "when-to-use-it",
    "content": "It helps when a keyword export is too large to sort by hand, when multiple pages might compete for the same intent, or when you need to turn research into page briefs."
  }, {
    "heading": "what-you-get-back",
    "content": "Your agent should return clusters, primary keywords, secondary keywords, search intent, page targets, priorities, and notes about cannibalization or consolidation."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Provide a keyword list, saved keyword tag, Search Console export, seed topic, or target domain."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Share existing pages if you want the agent to map keywords to current URLs."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Ask the agent to check SERP overlap for important borderline terms."
  }, {
    "heading": "how-to-get-the-best-result",
    "content": "Keep final tag changes user-approved."
  }, {
    "heading": "use-it-with-seotoolim-mcp",
    "content": "Set up SeoTool.im MCP so your agent can read saved keywords, inspect SERPs, and use SeoTool.im project context while clustering."
  }, {
    "heading": "read-the-actual-skill",
    "content": "The source SKILL.md lives on GitHub:"
  }, {
    "heading": "read-the-actual-skill",
    "content": "Keyword Clustering skill"
  }, {
    "heading": "related-skills",
    "content": "Keyword Research when you need more candidate terms."
  }, {
    "heading": "related-skills",
    "content": "Competitor Analysis when competitor pages should inform the map."
  }, {
    "heading": "related-skills",
    "content": "SEO Coach if you are unsure whether clustering is the next step."
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
      command: "/keyword-clustering"
    }), "\n", jsx(_components.p, {
      children: "The Keyword Clustering Agent Skill turns a messy keyword list into a page plan."
    }), "\n", jsx(_components.p, {
      children: "Your agent sorts keywords, compares intent, and decides which terms belong on the same page. It uses the keyword set, SERP context, and your site context to recommend page groups."
    }), "\n", jsx(_components.p, {
      children: "You get a content map: which keywords belong together, which pages should target them, where existing pages fit, and where cannibalization might become a problem."
    }), "\n", jsx(_components.h2, {
      id: "what-this-skill-helps-your-agent-do",
      children: "What this skill helps your agent do"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Group keywords by intent, SERP similarity, and page type."
      }), "\n", jsx(_components.li, {
        children: "Separate terms that look similar but need different pages."
      }), "\n", jsx(_components.li, {
        children: "Map clusters to existing URLs when they fit."
      }), "\n", jsx(_components.li, {
        children: "Recommend new pages when no current page matches the search intent."
      }), "\n", jsx(_components.li, {
        children: "Flag weak, off-strategy, or do-not-target keywords."
      }), "\n", jsx(_components.li, {
        children: "Suggest saved keyword tags only after user confirmation."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "when-to-use-it",
      children: "When to use it"
    }), "\n", jsx(_components.p, {
      children: "Use this skill when you already have keywords but do not yet have a content plan."
    }), "\n", jsx(_components.p, {
      children: "It helps when a keyword export is too large to sort by hand, when multiple pages might compete for the same intent, or when you need to turn research into page briefs."
    }), "\n", jsx(_components.h2, {
      id: "what-you-get-back",
      children: "What you get back"
    }), "\n", jsx(_components.p, {
      children: "Your agent should return clusters, primary keywords, secondary keywords, search intent, page targets, priorities, and notes about cannibalization or consolidation."
    }), "\n", jsx(_components.h2, {
      id: "how-to-get-the-best-result",
      children: "How to get the best result"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Provide a keyword list, saved keyword tag, Search Console export, seed topic, or target domain."
      }), "\n", jsx(_components.li, {
        children: "Share existing pages if you want the agent to map keywords to current URLs."
      }), "\n", jsx(_components.li, {
        children: "Ask the agent to check SERP overlap for important borderline terms."
      }), "\n", jsx(_components.li, {
        children: "Keep final tag changes user-approved."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "use-it-with-seotoolim-mcp",
      children: "Use it with SeoTool.im MCP"
    }), "\n", jsxs(_components.p, {
      children: ["Set up ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), " so your agent can read saved keywords, inspect SERPs, and use SeoTool.im project context while clustering."]
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
          href: "https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills/keyword-clustering",
          children: "Keyword Clustering skill"
        })
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "related-skills",
      children: "Related skills"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/keyword-research",
          children: "Keyword Research"
        }), " when you need more candidate terms."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/competitor-analysis",
          children: "Competitor Analysis"
        }), " when competitor pages should inform the map."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.a, {
          href: "/docs/skills/seo-coach",
          children: "SEO Coach"
        }), " if you are unsure whether clustering is the next step."]
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
