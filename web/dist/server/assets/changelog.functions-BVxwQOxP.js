import { jsx, jsxs } from "react/jsx-runtime";
import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { marked } from "marked";
import { c as createServerFn } from "../server.js";
import "node:async_hooks";
import "srvx";
import "react";
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
function _createMdxContent$v(props) {
  const _components = {
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "# Release Notes\\n\\nStore finalized release notes in this folder as versioned Markdown files.\\n\\nRecommended naming:\\n\\n- ', jsx(_components.code, {
      children: "release-notes/v0.0.2.md"
    }), "\\n\\nTypical flow:\\n\\n1. Generate a draft with ", jsx(_components.code, {
      children: "pnpm -s release:notes"
    }), ".\\n2. Copy the final edited notes into a versioned file in this folder.\\n3. Publish with ", jsx(_components.code, {
      children: "gh release create <tag> --title <tag> --notes-file release-notes/<tag>.md"
    }), '.\\n"']
  });
}
function MDXContent$v(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$v, {
      ...props
    })
  }) : _createMdxContent$v(props);
}
function _createMdxContent$u(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "> [!NOTE]\\n> Lots of UX improvements in this release 🎉\\n\\nThanks to @Granata005 for opening PRs and contributing to this release.\\n\\n## Added\\n\\n- Shift-click rank selection, plus better tables across the app.\\n- Improved keyword intent UX, including intent badges in the keyword research table.\\n- Mobile UX improvements for keyword research.\\n\\n## Improved\\n\\n- Smoother keyword research loading states.\\n- More accurate Rank Tracking filters for unranked keywords.\\n- Clicking exit now closes Modals.\\n- More reliable Rank Tracking checks.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.9...v0.0.10%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.9...v0.0.10\\n"
    }), '"']
  });
}
function MDXContent$u(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$u, {
      ...props
    })
  }) : _createMdxContent$u(props);
}
function _createMdxContent$t(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "🚀 SeoTool.im now supports MCP, so you can use SeoTool.im as the SEO brain for your Claude Code, Codex, or AI agent workflows.\\r\\n\\r\\nConnect your agent to SeoTool.im and let it research with your live project data instead of starting from a blank chat.\\r\\n\\r\\nFor Claude Code locally:\\r\\n\\r\\n', jsx(_components.code, {
      children: "sh\\r\\nclaude mcp add --transport http --scope user seotool-local http://localhost:3001/mcp\\r\\n"
    }), "\\r\\n\\r\\nFor Codex:\\r\\n\\r\\n", jsx(_components.code, {
      children: "sh\\r\\ncodex mcp add seotool --url https://seotool.im/mcp\\r\\n"
    }), "\\r\\n\\r\\nLearn more: ", jsx(_components.a, {
      href: "https://seotool.im/features/mcp%5Cr%5Cn%5Cr%5Cn##",
      children: "https://seotool.im/features/mcp\\r\\n\\r\\n##"
    }), " What you can do\\r\\n\\r\\n- Ask an agent to research keyword ideas for a domain and save the best ones to SeoTool.im.\\r\\n- Compare SERP results while drafting SEO briefs, outlines, or refresh plans.\\r\\n- Pull backlink and domain context into agent workflows without copy/pasting between tools.\\r\\n- Check rank tracking data while planning content updates or reporting on SEO progress.\\r\\n- Use SeoTool.im with Claude Desktop, Claude Code, Codex, or any MCP-compatible AI tool.\\r\\n\\r\\nThis is the first step toward agent-native SEO workflows: your assistant can inspect the data, reason about it, and help you move faster. ✨\\r\\n\\r\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.10...v0.0.11%5Cr%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.10...v0.0.11\\r\\n"
    }), '"']
  });
}
function MDXContent$t(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$t, {
      ...props
    })
  }) : _createMdxContent$t(props);
}
function _createMdxContent$s(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "SeoTool.im now supports tagging keywords for organization.\\n\\n## What's new\\n\\n- Add tags to saved keywords.\\n- Bulk edit tags across selected keywords.\\n- Filter saved keywords by tag.\\n- Keep keyword groups easier to scan and export.\\n\\n## MCP workflows\\n\\nTags also work through SeoTool.im's MCP tools.\\n\\nAsk your AI agent to:\\n\\n- Cluster keyword lists and tag each cluster.\\n- Replace broad tags with cleaner page or campaign tags.\\n- Pull only keywords tagged `, jsx(_components.code, {
      children: "content refresh"
    }), " when writing briefs.\\n\\nLearn more about MCP: ", jsx(_components.a, {
      href: "https://seotool.im/features/mcp%5Cn%5CnFull",
      children: "https://seotool.im/features/mcp\\n\\nFull"
    }), " Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.11...v0.0.12%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.11...v0.0.12\\n"
    }), '"']
  });
}
function MDXContent$s(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$s, {
      ...props
    })
  }) : _createMdxContent$s(props);
}
function _createMdxContent$r(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "This release has some UI improvements for multi-select and research tasks.\\n\\n## What's new\\n\\n- Add universal bulk action controls across all tables.\\n- Add search tabs so you can compare multiple searches without losing your place for Keyword Research, Domain Overview, and Backlinks.\\n\\n## Improved\\n\\n- Improve MCP tool metadata and output schemas so AI agents get clearer, more structured SeoTool.im responses.\\n- Harden domain and backlinks validation before external API calls.\\n- Extend MCP access tokens to 24 hours for fewer reconnect interruptions.\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.12...v0.0.13%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.12...v0.0.13\\n"
    }), '"']
  });
}
function MDXContent$r(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$r, {
      ...props
    })
  }) : _createMdxContent$r(props);
}
function _createMdxContent$q(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "SeoTool.im now prevents duplicate auto-created Default projects per organization.\\n\\n## Migration Note\\n\\nMost installs do not need manual cleanup. If running the latest migrations fails\\nwith a unique-constraint error for\\n', jsx(_components.code, {
      children: "projects_one_default_per_organization_idx"
    }), ", follow\\n", jsx(_components.code, {
      children: "docs/default-project-cleanup.md"
    }), ".\\n\\n## What happened\\n\\nSeveral simultaneous requests could initialize the same organization at once,\\ncreating more than one auto-created ", jsx(_components.code, {
      children: "Default"
    }), " project.\\n\\n## What the cleanup does\\n\\nThe cleanup keeps one canonical ", jsx(_components.code, {
      children: "Default"
    }), " project per organization, remaps\\nsupported child rows onto it, preserves rank-tracking history where possible,\\nthen removes duplicate Default projects.\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.13...v0.0.14%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.13...v0.0.14\\n"
    }), '"']
  });
}
function MDXContent$q(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$q, {
      ...props
    })
  }) : _createMdxContent$q(props);
}
function _createMdxContent$p(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "This release adds Agent Skills, fixes performance issues, and improves UX.\\r\\n\\r\\n> [!NOTE]\\r\\n> SeoTool.im now includes agent skills for guided SEO workflows. See ', jsx(_components.a, {
      href: "../README.md#seotool-skills",
      children: "SeoTool.im Skills"
    }), " for setup and available skills.\\r\\n\\r\\n## What's new\\r\\n\\r\\n- Add SeoTool.im agent skills for:\\r\\n  - Keyword Research\\r\\n  - Keyword Clustering\\r\\n  - Competitor Analysis\\r\\n  - Link Prospecting\\r\\n- Add clearer MCP setup controls in the app, plus a local development guide for self-hosted setup.\\r\\n\\r\\n## Improved\\r\\n\\r\\n- Fix performance issues that could cause crashes when interacting with tabs or table filters.\\r\\n- Unify search tab behavior across the app.\\r\\n- Improve Domain Overview and Keyword Research performance, loading states, filters, and table consistency.\\r\\n- Tweak the MCP prompt to make it more reliable for agent workflows.\\r\\n\\r\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.14...v0.0.15%5Cr%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.14...v0.0.15\\r\\n"
    }), '"']
  });
}
function MDXContent$p(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$p, {
      ...props
    })
  }) : _createMdxContent$p(props);
}
function _createMdxContent$o(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Add local seo MCP tools + UX improvements.\\n\\n## What's new\\n\\n- Add MCP tools for local SEO:\\n  - Search nearby businesses.\\n  - Fetch Google Maps and Local Finder results.\\n  - Read Google Business Profile Q&A.\\n\\n## Improved\\n\\n- Sort domain keywords and rank-tracking suggestions by traffic by default.\\n- Clarify keyword metric tooltips across keyword tables.\\n- Improve MCP registration for Perplexity and other dynamic clients.\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.15...v0.0.16%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.15...v0.0.16\\n"
    }), '"']
  });
}
function MDXContent$o(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$o, {
      ...props
    })
  }) : _createMdxContent$o(props);
}
function _createMdxContent$n(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "Bug fixes and an internal code cleanup.\\n\\n## Fixed\\n\\n- Fixed an infinite redirect loop between ', jsx(_components.code, {
      children: "/verify-email"
    }), " and the app when ", jsx(_components.code, {
      children: "BYPASS_EMAIL_VERIFICATION=true"
    }), " (local dev). The email-verification bypass is now honored consistently across the auth route guard, onboarding redirect, and verify-email page. Production behavior is unchanged.\\n\\n## Improved\\n\\n- Simplified complex client code across audit, backlinks, domain, keywords, and rank-tracking features (removed single-use wrappers, dead helpers, and redundant guards) while preserving type safety and behavior.\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.16...v0.0.17%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.16...v0.0.17\\n"
    }), '"']
  });
}
function MDXContent$n(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$n, {
      ...props
    })
  }) : _createMdxContent$n(props);
}
function _createMdxContent$m(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Adds self-hosted Google Search Console support, plus a few setup and error-message fixes.\\n\\n## What's new\\n\\n- Connect Google Search Console in self-hosted SeoTool.im with your own Google OAuth client.\\n- Use the new Search Console MCP tools for performance data and URL inspection from your own GSC account.\\n\\n## Improved\\n\\n- Temporary DataForSEO 5xx errors now get quick retries and a clearer "temporarily unavailable" message.\\n\\n## Fixed\\n\\n- Invalid domains now fail earlier with a clearer "enter a valid domain" message.\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.17...v0.0.18%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.17...v0.0.18\\n"
    }), '"']
  });
}
function MDXContent$m(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$m, {
      ...props
    })
  }) : _createMdxContent$m(props);
}
function _createMdxContent$l(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "This release adds multi-project support, improves Rank Tracking and AI Citations, and makes Backlinks easier to explore.\\n\\n## What's new\\n\\n- Add multi-project support so each organization can manage multiple sites and switch between them.\\n- Add Rank Tracking trends, keyword position history, and overview stats.\\n- Add Share of Voice to AI Visibility so you can compare your brand against competitors.\\n- Add optional Ahrefs Domain Rating enrichment to backlink and referring-domain tables.\\n\\n## Improved\\n\\n- Improve Backlinks with server-side pagination, sorting, filters, exports, and a one-per-domain view.\\n- Improve Backlinks overview panels and expandable referring-domain rows.\\n- Make Rank Tracking setup clearer and easier to finish.\\n- Add option to hydrate backlink table with Ahrefs DR.\\n- Improve AI citation results with clearer source and prompt tables.\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.18...v0.0.19%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.18...v0.0.19\\n"
    }), '"']
  });
}
function MDXContent$l(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$l, {
      ...props
    })
  }) : _createMdxContent$l(props);
}
function _createMdxContent$k(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "## Added\\n\\n- Support keyword research in many more countries.\\n- Created the official Docker image CD.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/bensenescu/open-seo/compare/v0.0.1...main%5Cn",
      children: "https://github.com/bensenescu/open-seo/compare/v0.0.1...main\\n"
    }), '"']
  });
}
function MDXContent$k(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$k, {
      ...props
    })
  }) : _createMdxContent$k(props);
}
function _createMdxContent$j(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "This release adds keyword data for 48 new countries, cuts default keyword research costs roughly in half, and makes the MCP tools easier for AI agents to use.\\n\\n## What's new\\n\\n- Add keyword research, rank tracking, and SERP analysis for 48 new countries (including Iceland), powered by Google Ads data. Keyword difficulty and search intent aren't available for these countries, and the UI notes this. Domain analytics still uses the existing country list.\\n- Add an opt-in toggle for clickstream-refined search volumes, available as a checkbox in keyword research or via `, jsx(_components.code, {
      children: "includeClickstreamData"
    }), " on the ", jsx(_components.code, {
      children: "research_keywords"
    }), " and ", jsx(_components.code, {
      children: "get_keyword_metrics"
    }), " MCP tools.\\n\\n## Improved\\n\\n- Cut the cost of a default keyword research run roughly in half by making clickstream volume refinement opt-in instead of always on.\\n- Add descriptions to every MCP tool parameter so AI agents pick the right options, and correct two parameter docs that listed the wrong defaults.\\n- Identify the MCP server with its name, description, website, and icon so MCP clients display it properly.\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.19...v0.0.20%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.19...v0.0.20\\n"
    }), '"']
  });
}
function MDXContent$j(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$j, {
      ...props
    })
  }) : _createMdxContent$j(props);
}
function _createMdxContent$i(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "This release cuts rank tracking costs by ~3x, plus fixes for MCP tool output and project lookups.\\n\\n## Improved\\n\\n- Reduce rank tracking costs by ~3x.\\n  - Scheduled checks now run through DataForSEO's task queue, and every check stops crawling SERP pages once your domain is found.\\n\\n## Fixed\\n\\n- Fix MCP tool output validation so results are no longer rejected after credits are spent, and report tool errors more clearly.\\n- Avoid an internal error during project access lookups.\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.20...v0.0.21%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.20...v0.0.21\\n"
    }), '"']
  });
}
function MDXContent$i(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$i, {
      ...props
    })
  }) : _createMdxContent$i(props);
}
function _createMdxContent$h(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "This release adds a paginated backlinks-profile MCP tool and gives rank tracking monthly schedules, explicit language selection, and a searchable country picker.\\n\\n## What's new\\n\\n- Add a `, jsx(_components.code, {
      children: "get_backlinks_profile"
    }), " MCP tool so AI agents can pull a domain's full backlink list, not just the summary. — thanks @mvanhorn\\n  - Returns per-link rows (linking URL, anchor, dofollow/nofollow, authority/spam signals, new/lost/broken status) in a paginated envelope, with the same filters and sorts the web UI offers.\\n- Add a monthly rank tracking schedule that runs at the end of each month. — thanks @Jalendar10\\n- Add explicit language selection to rank tracking, so you can override a country's default language. The picker lists only the languages DataForSEO supports for the selected country. — thanks @Devamol10\\n\\n## Improved\\n\\n- Add search and device/country filters to the Tracked Domains list so you can find a specific tracker among many. — thanks @mvanhorn\\n- Replace the country dropdown with a searchable combobox you can filter by typing. — thanks @Fishlex0\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.21...v0.0.22%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.21...v0.0.22\\n"
    }), '"']
  });
}
function MDXContent$h(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$h, {
      ...props
    })
  }) : _createMdxContent$h(props);
}
function _createMdxContent$g(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "This release lets you refresh every saved keyword's metrics in one click, and makes the MCP tools return their full results in the text response instead of just a row count.\\n\\n## What's new\\n\\n- Add an "Update keyword stats" action to the Saved Keywords page that refreshes search volume, CPC, competition, difficulty, and intent for every saved keyword — no need to re-run keyword research. — thanks @0xenzyme\\n\\n## Fixed\\n\\n- MCP clients that read only the text response now get the full result set — every keyword, volume, difficulty, ranking, competitor, and backlink row — instead of just a count or a truncated list.\\n  - Applies to `, jsx(_components.code, {
      children: "research_keywords"
    }), ", ", jsx(_components.code, {
      children: "get_keyword_metrics"
    }), ", ", jsx(_components.code, {
      children: "get_ranked_keywords"
    }), ", ", jsx(_components.code, {
      children: "get_serp_results"
    }), ", ", jsx(_components.code, {
      children: "search_local_businesses"
    }), ", ", jsx(_components.code, {
      children: "get_local_serp_results"
    }), ", ", jsx(_components.code, {
      children: "get_google_business_questions"
    }), ", ", jsx(_components.code, {
      children: "find_serp_competitors"
    }), ", ", jsx(_components.code, {
      children: "get_backlinks_profile"
    }), ", ", jsx(_components.code, {
      children: "get_backlinks_overview"
    }), ", ", jsx(_components.code, {
      children: "get_domain_keyword_suggestions"
    }), ", ", jsx(_components.code, {
      children: "get_rank_tracker"
    }), ", and ", jsx(_components.code, {
      children: "get_search_console_performance"
    }), ". Structured output is unchanged.\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.22...v0.0.23%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.22...v0.0.23\\n"
    }), '"']
  });
}
function MDXContent$g(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$g, {
      ...props
    })
  }) : _createMdxContent$g(props);
}
function _createMdxContent$f(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "GSC UI, improved app layout and beta in app agent.\\n\\n## What's new\\n\\n- Get GSC Insights inside the app — thanks @mattmacrocket\\n  - See queries in "striking distance" of ranking\\n- (Beta) In app agent - MCP is still recommended, but we'll be working to improve this during the summer.\\n  - Requires `, jsx(_components.code, {
      children: "OPENROUTER_API_KEY"
    }), '\\n- Redesigned the app layout\\n\\n## Fixed\\n\\n- A wrong or mis-formatted DataForSEO API key now shows a clear message telling you how to fix it, instead of "an unexpected error occurred". — thanks @mattmacrocket\\n- Local business searches with invalid input now show an error instead of quietly returning nothing.\\n- Claude answers in AI search work again.\\n- Site audits no longer occasionally crash near the end of a run.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.23...v0.0.24%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.23...v0.0.24\\n"
    }), '"']
  });
}
function MDXContent$f(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$f, {
      ...props
    })
  }) : _createMdxContent$f(props);
}
function _createMdxContent$e(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Site Audit issues, local rank tracking and multiple Search Console accounts.\\n\\n## What's new\\n\\n- New Issues tab in Site Audit\\n- City and region targeting for Rank Tracking — thanks @RDeemer63\\n- Multiple Google accounts for Search Console\\n\\n## Fixed\\n\\n- Empty H1 tags are now reported as missing.\\n- Redirect and non-HTML pages now display correctly in Site Audit.\\n- Lighthouse no longer checks the wrong Site Audit start page when both slash forms exist.\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.24...v0.0.25%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.24...v0.0.25\\n"
    }), '"']
  });
}
function MDXContent$e(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$e, {
      ...props
    })
  }) : _createMdxContent$e(props);
}
function _createMdxContent$d(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Version number in Settings for self-hosted installs.\\n\\n## What's new\\n\\n- See which version you're running in Settings when self-hosting\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.25...v0.0.26%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.25...v0.0.26\\n"
    }), '"']
  });
}
function MDXContent$d(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$d, {
      ...props
    })
  }) : _createMdxContent$d(props);
}
function _createMdxContent$c(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Search intent filters in Keyword Research and metric filters in Rank Tracking.\\n\\n## What's new\\n\\n- Filter Keyword Research by search intent — thanks @mariazuheros\\n- Filter Rank Tracking by volume, difficulty, and CPC — thanks @A-S-Manoj\\n\\n## Fixed\\n\\n- Sorting Rank Tracking by a metric no longer puts keywords with no data first. — thanks @A-S-Manoj\\n- Repeating the same domain or SERP lookup now uses the cache instead of spending credits again. — thanks @bookingseo\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.26...v0.0.27%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.26...v0.0.27\\n"
    }), '"']
  });
}
function MDXContent$c(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$c, {
      ...props
    })
  }) : _createMdxContent$c(props);
}
function _createMdxContent$b(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Project market defaults and Keyword Research keyboard controls.\\n\\n## What's new\\n\\n- Set each project's default country and language — thanks @bookingseo\\n  - Keyword Research, Domain Overview, new Rank Tracking setups, and supported MCP tools inherit these defaults.\\n- Press Enter to run a Keyword Research search\\n  - Use Shift+Enter or paste lines to research multiple keywords.\\n\\nFull Changelog: `, jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.27...v0.0.28%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.27...v0.0.28\\n"
    }), '"']
  });
}
function MDXContent$b(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$b, {
      ...props
    })
  }) : _createMdxContent$b(props);
}
function _createMdxContent$a(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "## Added\\n\\n- Added the Backlinks page.\\n\\n## Fixed\\n\\n- Renamed from OpenRank back to SeoTool.im.\\n- Fixed website styling issues.\\n\\n## Docs\\n\\n- Clarified how to update self-hosted Docker instances.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/bensenescu/open-seo/compare/v0.0.2...HEAD%5Cn",
      children: "https://github.com/bensenescu/open-seo/compare/v0.0.2...HEAD\\n"
    }), '"']
  });
}
function MDXContent$a(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$a, {
      ...props
    })
  }) : _createMdxContent$a(props);
}
function _createMdxContent$9(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "## Added\\n\\n## Improved\\n\\n- Support ', jsx(_components.code, {
      children: "ALLOWED_HOSTS"
    }), " for hosting docker behind reverse proxies\\n- Moved Lighthouse audits to DataForSEO\\n  - Users no longer need to enter a PSI api key\\n- Moved the DataForSEO response cache from KV to R2\\n  - R2 storage is 100x cheaper if self hosting on Cloudflare.\\n- Refactored to better use Tanstack Router & Tanstack Start\\n\\n## Fixed\\n\\n- Normalized trailing slashes for page backlinks.\\n\\n## Prepared for Managed Version\\n\\nPreparing for managed version\\n\\n- Added new auth mode: HOSTED\\n- Added better auth\\n- Added autumn pricing for metering\\n- Added posthog for erro tracking\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.3...v0.0.4%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.3...v0.0.4\\n"
    }), '"']
  });
}
function MDXContent$9(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$9, {
      ...props
    })
  }) : _createMdxContent$9(props);
}
function _createMdxContent$8(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "This release has lots of quality-of-life improvements and makes the UI more consistent.\\n\\n> [!NOTE]\\n> Read more to learn about the Managed SeoTool.im beta and a side-quest, Sam, an AI content writing agent that works with Claude Code & OpenCode.\\n\\nThanks to everyone who submitted issues or messaged me with suggestions on Discord. I appreciate the feedback and would love to hear how your experience has been or what you've added to your SeoTool.im.\\n\\n## Added\\n\\n- Backlink Analysis\\n  - Grouping by domain with expandable rows.\\n  - Spam backlinks hidden by default.\\n  - Per-tab CSV export.\\n  - Search history.\\n  - Structured table filters.\\n- Domain Overview\\n  - Add filtering and sorting to table\\n- Keyword Research\\n  - Add Bangladesh keyword research.\\n- Site Audit\\n  - Use DataForSEO for Lighthouse audits so users don't need to get a PSI api key.\\n- Theme switching with system, light, and dark options.\\n- Table filters now persist across searches so that you don't need reapply over and over.\\n\\n## Fixed\\n\\n- Reduced backlinks cost by 25% by changing which API endpoint we call to get trends.\\n- Limit lighthouse audits to 20 page sample so that user's don't trigger large, expensive audits accidentally.\\n- Fix bug when saving lots of keywords at once.\\n\\n## Managed SeoTool.im\\n\\nI'm starting to take on beta users for the managed version of SeoTool.im. Don't worry, the self hosted option isn't going anywhere. But, this has two advantages:\\n\\n1. Easy for your non-technical friends to use\\n2. Get access to Backlinks (and soon LLM Mentions) data for just $10/month instead of $100/month for each through DataForSEO\\n\\nIf you want to test it out, here are some links:\\n\\n- Sign Up: `, jsx(_components.a, {
      href: "https://seotool.im/sign-up%5Cn-",
      children: "https://seotool.im/sign-up\\n-"
    }), " Pricing Info: ", jsx(_components.a, {
      href: "https://seotool.im/pricing%5Cn%5Cn##",
      children: "https://seotool.im/pricing\\n\\n##"
    }), " New Free & Open Source AI Content Writing Agent.\\n\\nI built Sam, an AI content writing agent, as fun experiment. Sam does research, cites and fact checks. I think its pretty good and I like its writing (when using GPT 5.4) more than any other agent / product I've used.\\n\\nIt works locally with your Claude Code / OpenCode coding agents. Let me know what you think!\\n\\nhttps://github.com/every-app/sam\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.4...v0.0.5%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.4...v0.0.5\\n"
    }), '"']
  });
}
function MDXContent$8(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$8, {
      ...props
    })
  }) : _createMdxContent$8(props);
}
function _createMdxContent$7(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "This release adds Rank Tracking and has some bug fixes and UX improvements.\\n\\n## Added\\n\\n- Rank Tracking MVP.\\n- Improved header navigation.\\n- Updated "AI" page to link to Claude Code / OpenCode Content writing system\\n\\n## Fixed\\n\\n- Removed unused view transitions CSS that was causing navigation errors.\\n- Fixed a runtime error when clearing the backlinks filter.\\n- Handle empty DataForSEO responses gracefully.\\n- Avoided the D1 parameter limit in ', jsx(_components.code, {
      children: "getEarliestSnapshotsForKeywords"
    }), ".\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.5...v0.0.6%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.5...v0.0.6\\n"
    }), '"']
  });
}
function MDXContent$7(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$7, {
      ...props
    })
  }) : _createMdxContent$7(props);
}
function _createMdxContent$6(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "This release expands country coverage and adds bulk delete for saved keywords.\\n\\n## Added\\n\\n- Support all countries tracked by DataForSEO.\\n- Add country selector to Domain Overview Page\\n- Improve bulk delete of saved keywords.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.6...v0.0.7%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.6...v0.0.7\\n"
    }), '"']
  });
}
function MDXContent$6(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$6, {
      ...props
    })
  }) : _createMdxContent$6(props);
}
function _createMdxContent$5(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "This release adds AI Visibility tools 🎉\\n\\n## Added\\n\\n- Brand Lookup - See how your brand is cited by AI.\\n  - What queries do you get mentioned in?\\n  - Which brands and pages are mentioned alongside your brand?\\n- Prompt Explorer - See how different AI models actually respond to queries\\n  - Supports ChatGPT, Claude, Gemini and Perplexity\\n\\n## Fixed\\n\\n- Fix Cloudflare self-hosting bug.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.7...v0.0.8%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.7...v0.0.8\\n"
    }), '"']
  });
}
function MDXContent$5(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$5, {
      ...props
    })
  }) : _createMdxContent$5(props);
}
function _createMdxContent$4(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "This release improves domain research + some UX improvements.\\n\\n## Added\\n\\n- Server-side pagination and filtering for domain keywords so that you can search all keywords for the domain.\\n- Export to Google Sheets from every data table.\\n- URL-driven search state — searches are now shareable and survive reloads.\\n\\n## Improved\\n\\n- Clarified self-hosting troubleshooting docs.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.8...v0.0.9%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.8...v0.0.9\\n"
    }), '"']
  });
}
function MDXContent$4(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$4, {
      ...props
    })
  }) : _createMdxContent$4(props);
}
function _createMdxContent$3(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Project dashboard, self-host telemetry and Prompt Explorer citations.\\n\\n## What's new\\n\\n- New project dashboard for Search Console, site audit, and backlink data\\n- Self-hosted anonymous usage telemetry\\n  - Opt out with `, jsx(_components.code, {
      children: "OPENSEO_TELEMETRY_DISABLED=1"
    }), " or ", jsx(_components.code, {
      children: "DO_NOT_TRACK=1"
    }), ".\\n\\n## Fixed\\n\\n- Clearing all filters on the Domain Overview Pages tab no longer freezes the app. — thanks @bookingseo\\n- Closing an active search tab now selects the tab on its right when available. — thanks @bookingseo\\n- Prompt Explorer shows cited sources again. — thanks @bookingseo\\n- SAM chats work again when no custom AI model is configured.\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.28...v0.1.0%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.28...v0.1.0\\n"
    }), '"']
  });
}
function MDXContent$3(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$3, {
      ...props
    })
  }) : _createMdxContent$3(props);
}
function _createMdxContent$2(props) {
  const _components = {
    a: "a",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: ['export default "Deploy to Cloudflare fixes.\\n\\n## Fixed\\n\\n- Deploy to Cloudflare works again for self-hosted installs.\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.0...v0.1.1%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.0...v0.1.1\\n"
    }), '"']
  });
}
function MDXContent$2(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$2, {
      ...props
    })
  }) : _createMdxContent$2(props);
}
function _createMdxContent$1(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "MCP project creation, per-call location and language on research tools, and a batch of fixes.\\n\\n## What's new\\n\\n- Create projects with the `, jsx(_components.code, {
      children: "create_project"
    }), ' MCP tool — thanks @Santofer\\n- Pick a location and language per call on the ranked keywords and SERP competitors MCP tools — thanks @7wenty7\\n\\n## Fixed\\n\\n- Search tabs opened at the default location no longer disappear after a page reload — thanks @xiaonancui\\n- Rank tracking pages no longer show "No tracked domains yet" or a blank page while data is loading.\\n- Month-based Search Console date ranges no longer miss the first few days — thanks @shuvamk\\n- Domain keyword and page lists no longer stop loading more results early — thanks @shuvamk\\n\\nFull Changelog: ', jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.1...v0.1.2%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.1...v0.1.2\\n"
    }), '"']
  });
}
function MDXContent$1(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$1, {
      ...props
    })
  }) : _createMdxContent$1(props);
}
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxs(_components.p, {
    children: [`export default "Cloudflare self-hosting overhaul, an SEO audit skill, and rank tracking fixes.\\n\\n## What's new\\n\\n- New Cloudflare self-hosting flow: `, jsx(_components.code, {
      children: "pnpm deploy:selfhost"
    }), " provisions and deploys everything.\\n  - Replaces the Deploy to Cloudflare button and manual Wrangler setup.\\n- New ", jsx(_components.code, {
      children: "seo-audit"
    }), " agent skill: a one-page, plain-language site report.\\n- Backlinks now sort by most recently found first.\\n\\n## Fixed\\n\\n- Rank tracking now reports your organic position, so rankings no longer look worse than they really are.\\n- Self-hosting setup failures now say what's actually wrong instead of a generic error.\\n- AI features now work in Docker self-hosting when ", jsx(_components.code, {
      children: "OPENROUTER_API_KEY"
    }), " is set. — thanks @Nordalux\\n- The project switcher no longer cuts off the bottom of the list when you have many projects.\\n- Dialogs taller than the window now scroll instead of being cut off.\\n\\nFull Changelog: ", jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.2...v0.1.3%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.2...v0.1.3\\n"
    }), '"']
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
const getChangelogs_createServerFn_handler = createServerRpc({
  id: "76d8809bf016ea3360495d1d0964f396e36d61b9cf4ca99dabdae918b8ca5c91",
  name: "getChangelogs",
  filename: "src/lib/changelog.functions.ts"
}, (opts) => getChangelogs.__executeServer(opts));
const getChangelogs = createServerFn({
  method: "GET"
}).handler(getChangelogs_createServerFn_handler, async () => {
  try {
    const files = /* @__PURE__ */ Object.assign({
      "../../content/release-notes/README.md": MDXContent$v,
      "../../content/release-notes/v0.0.10.md": MDXContent$u,
      "../../content/release-notes/v0.0.11.md": MDXContent$t,
      "../../content/release-notes/v0.0.12.md": MDXContent$s,
      "../../content/release-notes/v0.0.13.md": MDXContent$r,
      "../../content/release-notes/v0.0.14.md": MDXContent$q,
      "../../content/release-notes/v0.0.15.md": MDXContent$p,
      "../../content/release-notes/v0.0.16.md": MDXContent$o,
      "../../content/release-notes/v0.0.17.md": MDXContent$n,
      "../../content/release-notes/v0.0.18.md": MDXContent$m,
      "../../content/release-notes/v0.0.19.md": MDXContent$l,
      "../../content/release-notes/v0.0.2.md": MDXContent$k,
      "../../content/release-notes/v0.0.20.md": MDXContent$j,
      "../../content/release-notes/v0.0.21.md": MDXContent$i,
      "../../content/release-notes/v0.0.22.md": MDXContent$h,
      "../../content/release-notes/v0.0.23.md": MDXContent$g,
      "../../content/release-notes/v0.0.24.md": MDXContent$f,
      "../../content/release-notes/v0.0.25.md": MDXContent$e,
      "../../content/release-notes/v0.0.26.md": MDXContent$d,
      "../../content/release-notes/v0.0.27.md": MDXContent$c,
      "../../content/release-notes/v0.0.28.md": MDXContent$b,
      "../../content/release-notes/v0.0.3.md": MDXContent$a,
      "../../content/release-notes/v0.0.4.md": MDXContent$9,
      "../../content/release-notes/v0.0.5.md": MDXContent$8,
      "../../content/release-notes/v0.0.6.md": MDXContent$7,
      "../../content/release-notes/v0.0.7.md": MDXContent$6,
      "../../content/release-notes/v0.0.8.md": MDXContent$5,
      "../../content/release-notes/v0.0.9.md": MDXContent$4,
      "../../content/release-notes/v0.1.0.md": MDXContent$3,
      "../../content/release-notes/v0.1.1.md": MDXContent$2,
      "../../content/release-notes/v0.1.2.md": MDXContent$1,
      "../../content/release-notes/v0.1.3.md": MDXContent
    });
    const logs = [];
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.includes("README.md")) continue;
      const fileName = filePath.split("/").pop() ?? "";
      const version = fileName.replace(".md", "");
      const html = await marked.parse(content);
      logs.push({
        version,
        html,
        raw: content
      });
    }
    return logs.sort((a, b) => {
      const aParts = a.version.replace("v", "").split(".").map(Number);
      const bParts = b.version.replace("v", "").split(".").map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] ?? 0;
        const bVal = bParts[i] ?? 0;
        if (aVal !== bVal) return bVal - aVal;
      }
      return 0;
    });
  } catch {
    return [];
  }
});
export {
  getChangelogs_createServerFn_handler
};
