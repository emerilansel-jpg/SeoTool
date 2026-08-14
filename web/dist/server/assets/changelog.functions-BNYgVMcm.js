import { U as jsxRuntimeExports, a1 as createServerFn } from "./worker-entry-KJBorVTL.js";
import { c as createServerRpc } from "./createServerRpc-dk3r4Ipu.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function _createMdxContent$v(props) {
  const _components = {
    code: "code",
    p: "p",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "# Release Notes\\n\\nStore finalized release notes in this folder as versioned Markdown files.\\n\\nRecommended naming:\\n\\n- ', jsxRuntimeExports.jsx(_components.code, {
      children: "release-notes/v0.0.2.md"
    }), "\\n\\nTypical flow:\\n\\n1. Generate a draft with ", jsxRuntimeExports.jsx(_components.code, {
      children: "pnpm -s release:notes"
    }), ".\\n2. Copy the final edited notes into a versioned file in this folder.\\n3. Publish with ", jsxRuntimeExports.jsx(_components.code, {
      children: "gh release create <tag> --title <tag> --notes-file release-notes/<tag>.md"
    }), '.\\n"']
  });
}
function MDXContent$v(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$v, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "> [!NOTE]\\n> Lots of UX improvements in this release 🎉\\n\\nThanks to @Granata005 for opening PRs and contributing to this release.\\n\\n## Added\\n\\n- Shift-click rank selection, plus better tables across the app.\\n- Improved keyword intent UX, including intent badges in the keyword research table.\\n- Mobile UX improvements for keyword research.\\n\\n## Improved\\n\\n- Smoother keyword research loading states.\\n- More accurate Rank Tracking filters for unranked keywords.\\n- Clicking exit now closes Modals.\\n- More reliable Rank Tracking checks.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.9...v0.0.10%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.9...v0.0.10\\n"
    }), '"']
  });
}
function MDXContent$u(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$u, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "🚀 SeoTool.im now supports MCP, so you can use SeoTool.im as the SEO brain for your Claude Code, Codex, or AI agent workflows.\\r\\n\\r\\nConnect your agent to SeoTool.im and let it research with your live project data instead of starting from a blank chat.\\r\\n\\r\\nFor Claude Code locally:\\r\\n\\r\\n', jsxRuntimeExports.jsx(_components.code, {
      children: "sh\\r\\nclaude mcp add --transport http --scope user seotool-local http://localhost:3001/mcp\\r\\n"
    }), "\\r\\n\\r\\nFor Codex:\\r\\n\\r\\n", jsxRuntimeExports.jsx(_components.code, {
      children: "sh\\r\\ncodex mcp add seotool --url https://seotool.im/mcp\\r\\n"
    }), "\\r\\n\\r\\nLearn more: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://seotool.im/features/mcp%5Cr%5Cn%5Cr%5Cn##",
      children: "https://seotool.im/features/mcp\\r\\n\\r\\n##"
    }), " What you can do\\r\\n\\r\\n- Ask an agent to research keyword ideas for a domain and save the best ones to SeoTool.im.\\r\\n- Compare SERP results while drafting SEO briefs, outlines, or refresh plans.\\r\\n- Pull backlink and domain context into agent workflows without copy/pasting between tools.\\r\\n- Check rank tracking data while planning content updates or reporting on SEO progress.\\r\\n- Use SeoTool.im with Claude Desktop, Claude Code, Codex, or any MCP-compatible AI tool.\\r\\n\\r\\nThis is the first step toward agent-native SEO workflows: your assistant can inspect the data, reason about it, and help you move faster. ✨\\r\\n\\r\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.10...v0.0.11%5Cr%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.10...v0.0.11\\r\\n"
    }), '"']
  });
}
function MDXContent$t(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$t, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "SeoTool.im now supports tagging keywords for organization.\\n\\n## What's new\\n\\n- Add tags to saved keywords.\\n- Bulk edit tags across selected keywords.\\n- Filter saved keywords by tag.\\n- Keep keyword groups easier to scan and export.\\n\\n## MCP workflows\\n\\nTags also work through SeoTool.im's MCP tools.\\n\\nAsk your AI agent to:\\n\\n- Cluster keyword lists and tag each cluster.\\n- Replace broad tags with cleaner page or campaign tags.\\n- Pull only keywords tagged `, jsxRuntimeExports.jsx(_components.code, {
      children: "content refresh"
    }), " when writing briefs.\\n\\nLearn more about MCP: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://seotool.im/features/mcp%5Cn%5CnFull",
      children: "https://seotool.im/features/mcp\\n\\nFull"
    }), " Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.11...v0.0.12%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.11...v0.0.12\\n"
    }), '"']
  });
}
function MDXContent$s(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$s, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "This release has some UI improvements for multi-select and research tasks.\\n\\n## What's new\\n\\n- Add universal bulk action controls across all tables.\\n- Add search tabs so you can compare multiple searches without losing your place for Keyword Research, Domain Overview, and Backlinks.\\n\\n## Improved\\n\\n- Improve MCP tool metadata and output schemas so AI agents get clearer, more structured SeoTool.im responses.\\n- Harden domain and backlinks validation before external API calls.\\n- Extend MCP access tokens to 24 hours for fewer reconnect interruptions.\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.12...v0.0.13%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.12...v0.0.13\\n"
    }), '"']
  });
}
function MDXContent$r(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$r, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "SeoTool.im now prevents duplicate auto-created Default projects per organization.\\n\\n## Migration Note\\n\\nMost installs do not need manual cleanup. If running the latest migrations fails\\nwith a unique-constraint error for\\n', jsxRuntimeExports.jsx(_components.code, {
      children: "projects_one_default_per_organization_idx"
    }), ", follow\\n", jsxRuntimeExports.jsx(_components.code, {
      children: "docs/default-project-cleanup.md"
    }), ".\\n\\n## What happened\\n\\nSeveral simultaneous requests could initialize the same organization at once,\\ncreating more than one auto-created ", jsxRuntimeExports.jsx(_components.code, {
      children: "Default"
    }), " project.\\n\\n## What the cleanup does\\n\\nThe cleanup keeps one canonical ", jsxRuntimeExports.jsx(_components.code, {
      children: "Default"
    }), " project per organization, remaps\\nsupported child rows onto it, preserves rank-tracking history where possible,\\nthen removes duplicate Default projects.\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.13...v0.0.14%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.13...v0.0.14\\n"
    }), '"']
  });
}
function MDXContent$q(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$q, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "This release adds Agent Skills, fixes performance issues, and improves UX.\\r\\n\\r\\n> [!NOTE]\\r\\n> SeoTool.im now includes agent skills for guided SEO workflows. See ', jsxRuntimeExports.jsx(_components.a, {
      href: "../README.md#seotool-skills",
      children: "SeoTool.im Skills"
    }), " for setup and available skills.\\r\\n\\r\\n## What's new\\r\\n\\r\\n- Add SeoTool.im agent skills for:\\r\\n  - Keyword Research\\r\\n  - Keyword Clustering\\r\\n  - Competitor Analysis\\r\\n  - Link Prospecting\\r\\n- Add clearer MCP setup controls in the app, plus a local development guide for self-hosted setup.\\r\\n\\r\\n## Improved\\r\\n\\r\\n- Fix performance issues that could cause crashes when interacting with tabs or table filters.\\r\\n- Unify search tab behavior across the app.\\r\\n- Improve Domain Overview and Keyword Research performance, loading states, filters, and table consistency.\\r\\n- Tweak the MCP prompt to make it more reliable for agent workflows.\\r\\n\\r\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.14...v0.0.15%5Cr%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.14...v0.0.15\\r\\n"
    }), '"']
  });
}
function MDXContent$p(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$p, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Add local seo MCP tools + UX improvements.\\n\\n## What's new\\n\\n- Add MCP tools for local SEO:\\n  - Search nearby businesses.\\n  - Fetch Google Maps and Local Finder results.\\n  - Read Google Business Profile Q&A.\\n\\n## Improved\\n\\n- Sort domain keywords and rank-tracking suggestions by traffic by default.\\n- Clarify keyword metric tooltips across keyword tables.\\n- Improve MCP registration for Perplexity and other dynamic clients.\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.15...v0.0.16%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.15...v0.0.16\\n"
    }), '"']
  });
}
function MDXContent$o(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$o, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "Bug fixes and an internal code cleanup.\\n\\n## Fixed\\n\\n- Fixed an infinite redirect loop between ', jsxRuntimeExports.jsx(_components.code, {
      children: "/verify-email"
    }), " and the app when ", jsxRuntimeExports.jsx(_components.code, {
      children: "BYPASS_EMAIL_VERIFICATION=true"
    }), " (local dev). The email-verification bypass is now honored consistently across the auth route guard, onboarding redirect, and verify-email page. Production behavior is unchanged.\\n\\n## Improved\\n\\n- Simplified complex client code across audit, backlinks, domain, keywords, and rank-tracking features (removed single-use wrappers, dead helpers, and redundant guards) while preserving type safety and behavior.\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.16...v0.0.17%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.16...v0.0.17\\n"
    }), '"']
  });
}
function MDXContent$n(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$n, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Adds self-hosted Google Search Console support, plus a few setup and error-message fixes.\\n\\n## What's new\\n\\n- Connect Google Search Console in self-hosted SeoTool.im with your own Google OAuth client.\\n- Use the new Search Console MCP tools for performance data and URL inspection from your own GSC account.\\n\\n## Improved\\n\\n- Temporary DataForSEO 5xx errors now get quick retries and a clearer "temporarily unavailable" message.\\n\\n## Fixed\\n\\n- Invalid domains now fail earlier with a clearer "enter a valid domain" message.\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.17...v0.0.18%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.17...v0.0.18\\n"
    }), '"']
  });
}
function MDXContent$m(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$m, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "This release adds multi-project support, improves Rank Tracking and AI Citations, and makes Backlinks easier to explore.\\n\\n## What's new\\n\\n- Add multi-project support so each organization can manage multiple sites and switch between them.\\n- Add Rank Tracking trends, keyword position history, and overview stats.\\n- Add Share of Voice to AI Visibility so you can compare your brand against competitors.\\n- Add optional Ahrefs Domain Rating enrichment to backlink and referring-domain tables.\\n\\n## Improved\\n\\n- Improve Backlinks with server-side pagination, sorting, filters, exports, and a one-per-domain view.\\n- Improve Backlinks overview panels and expandable referring-domain rows.\\n- Make Rank Tracking setup clearer and easier to finish.\\n- Add option to hydrate backlink table with Ahrefs DR.\\n- Improve AI citation results with clearer source and prompt tables.\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.18...v0.0.19%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.18...v0.0.19\\n"
    }), '"']
  });
}
function MDXContent$l(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$l, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "## Added\\n\\n- Support keyword research in many more countries.\\n- Created the official Docker image CD.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/bensenescu/open-seo/compare/v0.0.1...main%5Cn",
      children: "https://github.com/bensenescu/open-seo/compare/v0.0.1...main\\n"
    }), '"']
  });
}
function MDXContent$k(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$k, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "This release adds keyword data for 48 new countries, cuts default keyword research costs roughly in half, and makes the MCP tools easier for AI agents to use.\\n\\n## What's new\\n\\n- Add keyword research, rank tracking, and SERP analysis for 48 new countries (including Iceland), powered by Google Ads data. Keyword difficulty and search intent aren't available for these countries, and the UI notes this. Domain analytics still uses the existing country list.\\n- Add an opt-in toggle for clickstream-refined search volumes, available as a checkbox in keyword research or via `, jsxRuntimeExports.jsx(_components.code, {
      children: "includeClickstreamData"
    }), " on the ", jsxRuntimeExports.jsx(_components.code, {
      children: "research_keywords"
    }), " and ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_keyword_metrics"
    }), " MCP tools.\\n\\n## Improved\\n\\n- Cut the cost of a default keyword research run roughly in half by making clickstream volume refinement opt-in instead of always on.\\n- Add descriptions to every MCP tool parameter so AI agents pick the right options, and correct two parameter docs that listed the wrong defaults.\\n- Identify the MCP server with its name, description, website, and icon so MCP clients display it properly.\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.19...v0.0.20%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.19...v0.0.20\\n"
    }), '"']
  });
}
function MDXContent$j(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$j, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "This release cuts rank tracking costs by ~3x, plus fixes for MCP tool output and project lookups.\\n\\n## Improved\\n\\n- Reduce rank tracking costs by ~3x.\\n  - Scheduled checks now run through DataForSEO's task queue, and every check stops crawling SERP pages once your domain is found.\\n\\n## Fixed\\n\\n- Fix MCP tool output validation so results are no longer rejected after credits are spent, and report tool errors more clearly.\\n- Avoid an internal error during project access lookups.\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.20...v0.0.21%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.20...v0.0.21\\n"
    }), '"']
  });
}
function MDXContent$i(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$i, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "This release adds a paginated backlinks-profile MCP tool and gives rank tracking monthly schedules, explicit language selection, and a searchable country picker.\\n\\n## What's new\\n\\n- Add a `, jsxRuntimeExports.jsx(_components.code, {
      children: "get_backlinks_profile"
    }), " MCP tool so AI agents can pull a domain's full backlink list, not just the summary. — thanks @mvanhorn\\n  - Returns per-link rows (linking URL, anchor, dofollow/nofollow, authority/spam signals, new/lost/broken status) in a paginated envelope, with the same filters and sorts the web UI offers.\\n- Add a monthly rank tracking schedule that runs at the end of each month. — thanks @Jalendar10\\n- Add explicit language selection to rank tracking, so you can override a country's default language. The picker lists only the languages DataForSEO supports for the selected country. — thanks @Devamol10\\n\\n## Improved\\n\\n- Add search and device/country filters to the Tracked Domains list so you can find a specific tracker among many. — thanks @mvanhorn\\n- Replace the country dropdown with a searchable combobox you can filter by typing. — thanks @Fishlex0\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.21...v0.0.22%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.21...v0.0.22\\n"
    }), '"']
  });
}
function MDXContent$h(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$h, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "This release lets you refresh every saved keyword's metrics in one click, and makes the MCP tools return their full results in the text response instead of just a row count.\\n\\n## What's new\\n\\n- Add an "Update keyword stats" action to the Saved Keywords page that refreshes search volume, CPC, competition, difficulty, and intent for every saved keyword — no need to re-run keyword research. — thanks @0xenzyme\\n\\n## Fixed\\n\\n- MCP clients that read only the text response now get the full result set — every keyword, volume, difficulty, ranking, competitor, and backlink row — instead of just a count or a truncated list.\\n  - Applies to `, jsxRuntimeExports.jsx(_components.code, {
      children: "research_keywords"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_keyword_metrics"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_ranked_keywords"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_serp_results"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "search_local_businesses"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_local_serp_results"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_google_business_questions"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "find_serp_competitors"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_backlinks_profile"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_backlinks_overview"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_domain_keyword_suggestions"
    }), ", ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_rank_tracker"
    }), ", and ", jsxRuntimeExports.jsx(_components.code, {
      children: "get_search_console_performance"
    }), ". Structured output is unchanged.\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.22...v0.0.23%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.22...v0.0.23\\n"
    }), '"']
  });
}
function MDXContent$g(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$g, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "GSC UI, improved app layout and beta in app agent.\\n\\n## What's new\\n\\n- Get GSC Insights inside the app — thanks @mattmacrocket\\n  - See queries in "striking distance" of ranking\\n- (Beta) In app agent - MCP is still recommended, but we'll be working to improve this during the summer.\\n  - Requires `, jsxRuntimeExports.jsx(_components.code, {
      children: "OPENROUTER_API_KEY"
    }), '\\n- Redesigned the app layout\\n\\n## Fixed\\n\\n- A wrong or mis-formatted DataForSEO API key now shows a clear message telling you how to fix it, instead of "an unexpected error occurred". — thanks @mattmacrocket\\n- Local business searches with invalid input now show an error instead of quietly returning nothing.\\n- Claude answers in AI search work again.\\n- Site audits no longer occasionally crash near the end of a run.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.23...v0.0.24%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.23...v0.0.24\\n"
    }), '"']
  });
}
function MDXContent$f(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$f, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Site Audit issues, local rank tracking and multiple Search Console accounts.\\n\\n## What's new\\n\\n- New Issues tab in Site Audit\\n- City and region targeting for Rank Tracking — thanks @RDeemer63\\n- Multiple Google accounts for Search Console\\n\\n## Fixed\\n\\n- Empty H1 tags are now reported as missing.\\n- Redirect and non-HTML pages now display correctly in Site Audit.\\n- Lighthouse no longer checks the wrong Site Audit start page when both slash forms exist.\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.24...v0.0.25%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.24...v0.0.25\\n"
    }), '"']
  });
}
function MDXContent$e(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$e, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Version number in Settings for self-hosted installs.\\n\\n## What's new\\n\\n- See which version you're running in Settings when self-hosting\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.25...v0.0.26%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.25...v0.0.26\\n"
    }), '"']
  });
}
function MDXContent$d(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$d, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Search intent filters in Keyword Research and metric filters in Rank Tracking.\\n\\n## What's new\\n\\n- Filter Keyword Research by search intent — thanks @mariazuheros\\n- Filter Rank Tracking by volume, difficulty, and CPC — thanks @A-S-Manoj\\n\\n## Fixed\\n\\n- Sorting Rank Tracking by a metric no longer puts keywords with no data first. — thanks @A-S-Manoj\\n- Repeating the same domain or SERP lookup now uses the cache instead of spending credits again. — thanks @bookingseo\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.26...v0.0.27%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.26...v0.0.27\\n"
    }), '"']
  });
}
function MDXContent$c(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$c, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Project market defaults and Keyword Research keyboard controls.\\n\\n## What's new\\n\\n- Set each project's default country and language — thanks @bookingseo\\n  - Keyword Research, Domain Overview, new Rank Tracking setups, and supported MCP tools inherit these defaults.\\n- Press Enter to run a Keyword Research search\\n  - Use Shift+Enter or paste lines to research multiple keywords.\\n\\nFull Changelog: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.27...v0.0.28%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.27...v0.0.28\\n"
    }), '"']
  });
}
function MDXContent$b(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$b, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "## Added\\n\\n- Added the Backlinks page.\\n\\n## Fixed\\n\\n- Renamed from OpenRank back to SeoTool.im.\\n- Fixed website styling issues.\\n\\n## Docs\\n\\n- Clarified how to update self-hosted Docker instances.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/bensenescu/open-seo/compare/v0.0.2...HEAD%5Cn",
      children: "https://github.com/bensenescu/open-seo/compare/v0.0.2...HEAD\\n"
    }), '"']
  });
}
function MDXContent$a(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$a, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "## Added\\n\\n## Improved\\n\\n- Support ', jsxRuntimeExports.jsx(_components.code, {
      children: "ALLOWED_HOSTS"
    }), " for hosting docker behind reverse proxies\\n- Moved Lighthouse audits to DataForSEO\\n  - Users no longer need to enter a PSI api key\\n- Moved the DataForSEO response cache from KV to R2\\n  - R2 storage is 100x cheaper if self hosting on Cloudflare.\\n- Refactored to better use Tanstack Router & Tanstack Start\\n\\n## Fixed\\n\\n- Normalized trailing slashes for page backlinks.\\n\\n## Prepared for Managed Version\\n\\nPreparing for managed version\\n\\n- Added new auth mode: HOSTED\\n- Added better auth\\n- Added autumn pricing for metering\\n- Added posthog for erro tracking\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.3...v0.0.4%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.3...v0.0.4\\n"
    }), '"']
  });
}
function MDXContent$9(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$9, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "This release has lots of quality-of-life improvements and makes the UI more consistent.\\n\\n> [!NOTE]\\n> Read more to learn about the Managed SeoTool.im beta and a side-quest, Sam, an AI content writing agent that works with Claude Code & OpenCode.\\n\\nThanks to everyone who submitted issues or messaged me with suggestions on Discord. I appreciate the feedback and would love to hear how your experience has been or what you've added to your SeoTool.im.\\n\\n## Added\\n\\n- Backlink Analysis\\n  - Grouping by domain with expandable rows.\\n  - Spam backlinks hidden by default.\\n  - Per-tab CSV export.\\n  - Search history.\\n  - Structured table filters.\\n- Domain Overview\\n  - Add filtering and sorting to table\\n- Keyword Research\\n  - Add Bangladesh keyword research.\\n- Site Audit\\n  - Use DataForSEO for Lighthouse audits so users don't need to get a PSI api key.\\n- Theme switching with system, light, and dark options.\\n- Table filters now persist across searches so that you don't need reapply over and over.\\n\\n## Fixed\\n\\n- Reduced backlinks cost by 25% by changing which API endpoint we call to get trends.\\n- Limit lighthouse audits to 20 page sample so that user's don't trigger large, expensive audits accidentally.\\n- Fix bug when saving lots of keywords at once.\\n\\n## Managed SeoTool.im\\n\\nI'm starting to take on beta users for the managed version of SeoTool.im. Don't worry, the self hosted option isn't going anywhere. But, this has two advantages:\\n\\n1. Easy for your non-technical friends to use\\n2. Get access to Backlinks (and soon LLM Mentions) data for just $10/month instead of $100/month for each through DataForSEO\\n\\nIf you want to test it out, here are some links:\\n\\n- Sign Up: `, jsxRuntimeExports.jsx(_components.a, {
      href: "https://seotool.im/sign-up%5Cn-",
      children: "https://seotool.im/sign-up\\n-"
    }), " Pricing Info: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://seotool.im/pricing%5Cn%5Cn##",
      children: "https://seotool.im/pricing\\n\\n##"
    }), " New Free & Open Source AI Content Writing Agent.\\n\\nI built Sam, an AI content writing agent, as fun experiment. Sam does research, cites and fact checks. I think its pretty good and I like its writing (when using GPT 5.4) more than any other agent / product I've used.\\n\\nIt works locally with your Claude Code / OpenCode coding agents. Let me know what you think!\\n\\nhttps://github.com/every-app/sam\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.4...v0.0.5%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.4...v0.0.5\\n"
    }), '"']
  });
}
function MDXContent$8(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$8, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "This release adds Rank Tracking and has some bug fixes and UX improvements.\\n\\n## Added\\n\\n- Rank Tracking MVP.\\n- Improved header navigation.\\n- Updated "AI" page to link to Claude Code / OpenCode Content writing system\\n\\n## Fixed\\n\\n- Removed unused view transitions CSS that was causing navigation errors.\\n- Fixed a runtime error when clearing the backlinks filter.\\n- Handle empty DataForSEO responses gracefully.\\n- Avoided the D1 parameter limit in ', jsxRuntimeExports.jsx(_components.code, {
      children: "getEarliestSnapshotsForKeywords"
    }), ".\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.5...v0.0.6%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.5...v0.0.6\\n"
    }), '"']
  });
}
function MDXContent$7(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$7, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "This release expands country coverage and adds bulk delete for saved keywords.\\n\\n## Added\\n\\n- Support all countries tracked by DataForSEO.\\n- Add country selector to Domain Overview Page\\n- Improve bulk delete of saved keywords.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.6...v0.0.7%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.6...v0.0.7\\n"
    }), '"']
  });
}
function MDXContent$6(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$6, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "This release adds AI Visibility tools 🎉\\n\\n## Added\\n\\n- Brand Lookup - See how your brand is cited by AI.\\n  - What queries do you get mentioned in?\\n  - Which brands and pages are mentioned alongside your brand?\\n- Prompt Explorer - See how different AI models actually respond to queries\\n  - Supports ChatGPT, Claude, Gemini and Perplexity\\n\\n## Fixed\\n\\n- Fix Cloudflare self-hosting bug.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.7...v0.0.8%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.7...v0.0.8\\n"
    }), '"']
  });
}
function MDXContent$5(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$5, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "This release improves domain research + some UX improvements.\\n\\n## Added\\n\\n- Server-side pagination and filtering for domain keywords so that you can search all keywords for the domain.\\n- Export to Google Sheets from every data table.\\n- URL-driven search state — searches are now shareable and survive reloads.\\n\\n## Improved\\n\\n- Clarified self-hosting troubleshooting docs.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.8...v0.0.9%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.8...v0.0.9\\n"
    }), '"']
  });
}
function MDXContent$4(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$4, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Project dashboard, self-host telemetry and Prompt Explorer citations.\\n\\n## What's new\\n\\n- New project dashboard for Search Console, site audit, and backlink data\\n- Self-hosted anonymous usage telemetry\\n  - Opt out with `, jsxRuntimeExports.jsx(_components.code, {
      children: "OPENSEO_TELEMETRY_DISABLED=1"
    }), " or ", jsxRuntimeExports.jsx(_components.code, {
      children: "DO_NOT_TRACK=1"
    }), ".\\n\\n## Fixed\\n\\n- Clearing all filters on the Domain Overview Pages tab no longer freezes the app. — thanks @bookingseo\\n- Closing an active search tab now selects the tab on its right when available. — thanks @bookingseo\\n- Prompt Explorer shows cited sources again. — thanks @bookingseo\\n- SAM chats work again when no custom AI model is configured.\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.28...v0.1.0%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.0.28...v0.1.0\\n"
    }), '"']
  });
}
function MDXContent$3(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$3, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: ['export default "Deploy to Cloudflare fixes.\\n\\n## Fixed\\n\\n- Deploy to Cloudflare works again for self-hosted installs.\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.0...v0.1.1%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.0...v0.1.1\\n"
    }), '"']
  });
}
function MDXContent$2(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$2, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "MCP project creation, per-call location and language on research tools, and a batch of fixes.\\n\\n## What's new\\n\\n- Create projects with the `, jsxRuntimeExports.jsx(_components.code, {
      children: "create_project"
    }), ' MCP tool — thanks @Santofer\\n- Pick a location and language per call on the ranked keywords and SERP competitors MCP tools — thanks @7wenty7\\n\\n## Fixed\\n\\n- Search tabs opened at the default location no longer disappear after a page reload — thanks @xiaonancui\\n- Rank tracking pages no longer show "No tracked domains yet" or a blank page while data is loading.\\n- Month-based Search Console date ranges no longer miss the first few days — thanks @shuvamk\\n- Domain keyword and page lists no longer stop loading more results early — thanks @shuvamk\\n\\nFull Changelog: ', jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.1...v0.1.2%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.1...v0.1.2\\n"
    }), '"']
  });
}
function MDXContent$1(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent$1, {
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
  return jsxRuntimeExports.jsxs(_components.p, {
    children: [`export default "Cloudflare self-hosting overhaul, an SEO audit skill, and rank tracking fixes.\\n\\n## What's new\\n\\n- New Cloudflare self-hosting flow: `, jsxRuntimeExports.jsx(_components.code, {
      children: "pnpm deploy:selfhost"
    }), " provisions and deploys everything.\\n  - Replaces the Deploy to Cloudflare button and manual Wrangler setup.\\n- New ", jsxRuntimeExports.jsx(_components.code, {
      children: "seo-audit"
    }), " agent skill: a one-page, plain-language site report.\\n- Backlinks now sort by most recently found first.\\n\\n## Fixed\\n\\n- Rank tracking now reports your organic position, so rankings no longer look worse than they really are.\\n- Self-hosting setup failures now say what's actually wrong instead of a generic error.\\n- AI features now work in Docker self-hosting when ", jsxRuntimeExports.jsx(_components.code, {
      children: "OPENROUTER_API_KEY"
    }), " is set. — thanks @Nordalux\\n- The project switcher no longer cuts off the bottom of the list when you have many projects.\\n- Dialogs taller than the window now scroll instead of being cut off.\\n\\nFull Changelog: ", jsxRuntimeExports.jsx(_components.a, {
      href: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.2...v0.1.3%5Cn",
      children: "https://github.com/emerilansel-jpg/SeoTool/compare/v0.1.2...v0.1.3\\n"
    }), '"']
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
function C() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var R = C();
function j(l3) {
  R = l3;
}
var z = { exec: () => null };
function A(l3) {
  let e = [];
  return (t) => {
    let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
    return s || (s = l3(n), e[n] = s), s;
  };
}
function k(l3, e = "") {
  let t = typeof l3 == "string" ? l3 : l3.source, n = { replace: (s, r) => {
    let i = typeof r == "string" ? r : r.source;
    return i = i.replace(m.caret, "$1"), t = t.replace(s, i), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var Te = ((l3 = "") => {
  try {
    return !!new RegExp("(?<=1)(?<!1)" + l3);
  } catch {
    return false;
  }
})(), m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l3) => new RegExp(`^( {0,3}${l3})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: A((l3) => new RegExp(`^ {0,${l3}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: A((l3) => new RegExp(`^ {0,${l3}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)), fencesBeginRegex: A((l3) => new RegExp(`^ {0,${l3}}(?:\`\`\`|~~~)`)), headingBeginRegex: A((l3) => new RegExp(`^ {0,${l3}}#`)), htmlBeginRegex: A((l3) => new RegExp(`^ {0,${l3}}<(?:[a-z].*>|!--)`, "i")), blockquoteBeginRegex: A((l3) => new RegExp(`^ {0,${l3}}>`)) }, Oe = /^(?:[ \t]*(?:\n|$))+/, we = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, ye = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, q = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Pe = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, U = / {0,3}(?:[*+-]|\d{1,9}[.)])/, oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, ae = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Se = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), K = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/, _e = /^[^\n]+/, W = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, $e = k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", W).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Le = k(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, U).getRegex(), Q = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", X = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Me = k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", X).replace("tag", Q).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), le = (l3) => k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", l3).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex(), ze = le(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/), Ee = le(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/), Ce = k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ee).getRegex(), J = { blockquote: Ce, code: we, def: $e, fences: ye, heading: Pe, hr: q, html: Me, lheading: ae, list: Le, newline: Oe, paragraph: ze, table: z, text: _e }, se = k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex(), Ae = { ...J, lheading: Se, table: se, paragraph: k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex() }, Ie = { ...J, html: k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", X).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: z, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: k(K).replace("hr", q).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ae).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() }, Be = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, De = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, pe = /^( {2,}|\\)\n(?!\s*$)/, qe = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, _ = /[\p{P}\p{S}]/u, I = /[\s\p{P}\p{S}]/u, v = /[^\s\p{P}\p{S}]/u, ve = k(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, I).getRegex(), He = /[\p{Pi}\p{Ps}"']/u, ue = /(?!~)[\p{P}\p{S}]/u, Ze = /(?!~)[\s\p{P}\p{S}]/u, Ge = /(?:[^\s\p{P}\p{S}]|~)/u, Qe = k(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Te ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), ce = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/, Ne = k(ce, "u").replace(/punct/g, _).getRegex(), je = k(ce, "u").replace(/punct/g, ue).getRegex(), Fe = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, Ue = k(Fe, "u").replace(/openQuote/g, He).replace(/punct/g, _).getRegex(), he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Ke = k(he, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), We = k(he, "gu").replace(/notPunctSpace/g, Ge).replace(/punctSpace/g, Ze).replace(/punct/g, ue).getRegex(), Xe = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", Je = k(Xe, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), Ve = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), Ye = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", et = k(Ye, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), tt = k(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, _).getRegex(), nt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", rt = k(nt, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), st = k(/\\(punct)/, "gu").replace(/punct/g, _).getRegex(), it = k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), ot = k(X).replace("(?:-->|$)", "-->").getRegex(), at = k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", ot).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), G = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/, lt = k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", G).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), de = k(/^!?\[(label)\]\[(ref)\]/).replace("label", G).replace("ref", W).getRegex(), ke = k(/^!?\[(ref)\](?:\[\])?/).replace("ref", W).getRegex(), pt = k("reflink|nolink(?!\\()", "g").replace("reflink", de).replace("nolink", ke).getRegex(), ie = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, V = { _backpedal: z, anyPunctuation: st, autolink: it, blockSkip: Qe, br: pe, code: De, del: z, delLDelim: z, delRDelim: z, emStrongLDelim: Ne, emStrongRDelimAst: Ke, emStrongRDelimUnd: Ve, escape: Be, link: lt, nolink: ke, punctuation: ve, reflink: de, reflinkSearch: pt, tag: at, text: qe, url: z }, ut = { ...V, emStrongLDelim: Ue, emStrongRDelimAst: Je, emStrongRDelimUnd: et, link: k(/^!?\[(label)\]\((.*?)\)/).replace("label", G).getRegex(), reflink: k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", G).getRegex() }, F = { ...V, emStrongRDelimAst: We, emStrongLDelim: je, delLDelim: tt, delRDelim: rt, url: k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ie).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: k(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ie).getRegex() }, ct = { ...F, br: k(pe).replace("{2,}", "*").getRegex(), text: k(F.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() }, H = { normal: J, gfm: Ae, pedantic: Ie }, B = { normal: V, gfm: F, breaks: ct, pedantic: ut };
var ht = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }, ge = (l3) => ht[l3];
function O(l3, e) {
  if (e) {
    if (m.escapeTest.test(l3)) return l3.replace(m.escapeReplace, ge);
  } else if (m.escapeTestNoEncode.test(l3)) return l3.replace(m.escapeReplaceNoEncode, ge);
  return l3;
}
function Y(l3) {
  try {
    l3 = encodeURI(l3).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return l3;
}
function ee(l3, e) {
  let t = l3.replace(m.findPipe, (r, i, o) => {
    let p = false, a = i;
    for (; --a >= 0 && o[a] === "\\"; ) p = !p;
    return p ? "|" : " |";
  }), n = t.split(m.splitPipe), s = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
  else for (; n.length < e; ) n.push("");
  for (; s < n.length; s++) n[s] = n[s].trim().replace(m.slashPipe, "|");
  return n;
}
function $(l3, e, t) {
  let n = l3.length;
  if (n === 0) return "";
  let s = 0;
  for (; s < n; ) {
    let r = l3.charAt(n - s - 1);
    if (r === e && true) s++;
    else break;
  }
  return l3.slice(0, n - s);
}
function te(l3) {
  let e = l3.split(`
`), t = e.length - 1;
  for (; t >= 0 && m.blankLine.test(e[t]); ) t--;
  return e.length - t <= 2 ? l3 : e.slice(0, t + 1).join(`
`);
}
function fe(l3, e) {
  if (l3.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let n = 0; n < l3.length; n++) if (l3[n] === "\\") n++;
  else if (l3[n] === e[0]) t++;
  else if (l3[n] === e[1] && (t--, t < 0)) return n;
  return t > 0 ? -2 : -1;
}
function me(l3, e = 0) {
  let t = e, n = "";
  for (let s of l3) if (s === "	") {
    let r = 4 - t % 4;
    n += " ".repeat(r), t += r;
  } else n += s, t++;
  return n;
}
function xe(l3, e, t, n, s) {
  let r = e.href, i = e.title || null, o = l3[1].replace(s.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let p = { type: l3[0].charAt(0) === "!" ? "image" : "link", raw: t, href: r, title: i, text: o, tokens: n.inlineTokens(o) };
  return n.state.inLink = false, p;
}
function dt(l3, e, t) {
  let n = l3.match(t.other.indentCodeCompensation);
  if (n === null) return e;
  let s = n[1];
  return e.split(`
`).map((r) => {
    let i = r.match(t.other.beginningSpace);
    if (i === null) return r;
    let [o] = i;
    return o.length >= s.length ? r.slice(s.length) : r;
  }).join(`
`);
}
var y = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || R;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0) return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = this.options.pedantic ? t[0] : te(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], s = dt(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let s = $(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
      }
      return { type: "heading", raw: $(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t) return { type: "hr", raw: $(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = $(t[0], `
`).split(`
`), s = "", r = "", i = [];
      for (; n.length > 0; ) {
        let o = false, p = [], a;
        for (a = 0; a < n.length; a++) if (this.rules.other.blockquoteStart.test(n[a])) p.push(n[a]), o = true;
        else if (!o) p.push(n[a]);
        else break;
        n = n.slice(a);
        let u = p.join(`
`), c = u.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${u}` : u, r = r ? `${r}
${c}` : c;
        let h = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, i, true), this.lexer.state.top = h, n.length === 0) break;
        let d = i.at(-1);
        if (d?.type === "code") break;
        if (d?.type === "blockquote") {
          let T = d, g = n.join(`
`), w = T.raw + `
` + g.replace(this.rules.other.blockquoteSetextReplace2, ""), M = this.blockquote(w);
          i[i.length - 1] = M, s = `${s}
${g}`, r = r.substring(0, r.length - T.text.length) + M.text;
          break;
        } else if (d?.type === "list") {
          let T = d, g = T.raw + `
` + n.join(`
`), w = this.list(g);
          i[i.length - 1] = w, s = s.substring(0, s.length - d.raw.length) + w.raw, r = r.substring(0, r.length - T.raw.length) + w.raw, n = g.substring(i.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: i, text: r };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), s = n.length > 1, r = { type: "list", raw: "", ordered: s, start: s ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
      let i = this.rules.other.listItemRegex(n), o = false;
      for (; e; ) {
        let a = false, u = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e)) break;
        u = t[0], e = e.substring(u.length);
        let h = me(t[2].split(`
`, 1)[0], t[1].length), d = e.split(`
`, 1)[0], T = !h.trim(), g = 0;
        if (this.options.pedantic ? (g = 2, c = h.trimStart()) : T ? g = t[1].length + 1 : (g = h.search(this.rules.other.nonSpaceChar), g = g > 4 ? 1 : g, c = h.slice(g), g += t[1].length), T && this.rules.other.blankLine.test(d) && (u += d + `
`, e = e.substring(d.length + 1), a = true), !a) {
          let w = this.rules.other.nextBulletRegex(g), M = this.rules.other.hrRegex(g), ne = this.rules.other.fencesBeginRegex(g), re = this.rules.other.headingBeginRegex(g), be = this.rules.other.htmlBeginRegex(g), Re = this.rules.other.blockquoteBeginRegex(g);
          for (; e; ) {
            let N = e.split(`
`, 1)[0], D;
            if (d = N, this.options.pedantic ? (d = d.replace(this.rules.other.listReplaceNesting, "  "), D = d) : D = d.replace(this.rules.other.tabCharGlobal, "    "), ne.test(d) || re.test(d) || be.test(d) || Re.test(d) || w.test(d) || M.test(d)) break;
            if (D.search(this.rules.other.nonSpaceChar) >= g || !d.trim()) c += `
` + D.slice(g);
            else {
              if (T || h.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(h) || re.test(h) || M.test(h)) break;
              c += `
` + d;
            }
            T = !d.trim(), u += N + `
`, e = e.substring(N.length + 1), h = D.slice(g);
          }
        }
        r.loose || (o ? r.loose = true : this.rules.other.doubleBlankLine.test(u) && (o = true)), r.items.push({ type: "list_item", raw: u, task: !!this.options.gfm && this.rules.other.listIsTask.test(c), loose: false, text: c, tokens: [] }), r.raw += u;
      }
      let p = r.items.at(-1);
      if (p) p.raw = p.raw.trimEnd(), p.text = p.text.trimEnd();
      else return;
      r.raw = r.raw.trimEnd();
      for (let a of r.items) {
        this.lexer.state.top = false, a.tokens = this.lexer.blockTokens(a.text, []);
        let u = a.tokens[0];
        if (a.task && (u?.type === "text" || u?.type === "paragraph")) {
          a.text = a.text.replace(this.rules.other.listReplaceTask, ""), u.raw = u.raw.replace(this.rules.other.listReplaceTask, ""), u.text = u.text.replace(this.rules.other.listReplaceTask, "");
          for (let h = this.lexer.inlineQueue.length - 1; h >= 0; h--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)) {
            this.lexer.inlineQueue[h].src = this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask, "");
            break;
          }
          let c = this.rules.other.listTaskCheckbox.exec(a.raw);
          if (c) {
            let h = { type: "checkbox", raw: c[0] + " ", checked: c[0] !== "[ ]" };
            a.checked = h.checked, r.loose ? a.tokens[0] && ["paragraph", "text"].includes(a.tokens[0].type) && "tokens" in a.tokens[0] && a.tokens[0].tokens ? (a.tokens[0].raw = h.raw + a.tokens[0].raw, a.tokens[0].text = h.raw + a.tokens[0].text, a.tokens[0].tokens.unshift(h)) : a.tokens.unshift({ type: "paragraph", raw: h.raw, text: h.raw, tokens: [h] }) : a.tokens.unshift(h);
          }
        } else a.task && (a.task = false);
        if (!r.loose) {
          let c = a.tokens.filter((d) => d.type === "space"), h = c.length > 0 && c.some((d) => this.rules.other.anyLine.test(d.raw));
          r.loose = h;
        }
      }
      if (r.loose) for (let a of r.items) {
        a.loose = true;
        for (let u of a.tokens) u.type === "text" && (u.type = "paragraph");
      }
      return r;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) {
      let n = te(t[0]);
      return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
    }
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: $(t[0], `
`), href: s, title: r };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
    let n = ee(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = { type: "table", raw: $(t[0], `
`), header: [], align: [], rows: [] };
    if (n.length === s.length) {
      for (let o of s) this.rules.other.tableAlignRight.test(o) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? i.align.push("left") : i.align.push(null);
      for (let o = 0; o < n.length; o++) i.header.push({ text: n[o], tokens: this.lexer.inline(n[o]), header: true, align: i.align[o] });
      for (let o of r) i.rows.push(ee(o, i.header.length).map((p, a) => ({ text: p, tokens: this.lexer.inline(p), header: false, align: i.align[a] })));
      return i;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: $(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t) return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n)) return;
        let i = $(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0) return;
      } else {
        let i = fe(t[2], "()");
        if (i === -2) return;
        if (i > -1) {
          let p = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
          t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, p).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        let i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), xe(t, { href: s && s.replace(this.rules.inline.anyPunctuation, "$1"), title: r && r.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = t[s.toLowerCase()];
      if (!r) {
        let i = n[0].charAt(0);
        return { type: "text", raw: i, text: i };
      }
      return xe(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || !s[1] && !s[2] && !s[3] && !s[4] || s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, p, a = i, u = 0, c = s[0][0], h = n === c, d = c === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (d.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = d.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (p = [...o].length, s[3] || s[4]) {
          a += p;
          continue;
        } else if (s[5] || s[6]) {
          if (i % 3 && !((i + p) % 3)) {
            u += p;
            continue;
          }
          if (h) break;
        }
        if (a -= p, a > 0) continue;
        p = Math.min(p, p + a + u);
        let T = [...s[0]][0].length, g = e.slice(0, i + s.index + T + p);
        if (Math.min(i, p) % 2) {
          let M = g.slice(1, -1);
          return { type: "em", raw: g, text: M, tokens: this.lexer.inlineTokens(M) };
        }
        let w = g.slice(2, -2);
        return { type: "strong", raw: g, text: w, tokens: this.lexer.inlineTokens(w) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t) return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let s = this.rules.inline.delLDelim.exec(e);
    if (!s) return;
    if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, p, a = i, u = this.rules.inline.delRDelim;
      for (u.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = u.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (p = [...o].length, p !== i)) continue;
        if (s[3] || s[4]) {
          a += p;
          continue;
        }
        if (a -= p, a > 0) continue;
        p = Math.min(p, p + a);
        let c = [...s[0]][0].length, h = e.slice(0, i + s.index + c + p), d = h.slice(i, -i);
        return { type: "del", raw: h, text: d, tokens: this.lexer.inlineTokens(d) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, s;
      if (t[2] === "@") n = t[0], s = "mailto:" + n;
      else {
        let r;
        do
          r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r !== t[0]);
        n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
};
var x = class l {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || R, this.options.tokenizer = this.options.tokenizer || new y(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t = { other: m, block: H.normal, inline: B.normal };
    this.options.pedantic ? (t.block = H.pedantic, t.inline = B.pedantic) : this.options.gfm && (t.block = H.gfm, this.options.breaks ? t.inline = B.breaks : t.inline = B.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: H, inline: B };
  }
  static lex(e, t) {
    return new l(t).lex(e);
  }
  static lexInline(e, t) {
    return new l(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0; t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));
    let s = 1 / 0;
    for (; e; ) {
      if (e.length < s) s = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      let r;
      if (this.options.extensions?.block?.some((o) => (r = o.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false)) continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        r.raw.length === 1 && o !== void 0 ? o.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.raw, this.inlineQueue.at(-1).src = o.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let o = 1 / 0, p = e.slice(1), a;
        this.options.extensions.startBlock.forEach((u) => {
          a = u.call({ lexer: this }, p), typeof a == "number" && a >= 0 && (o = Math.min(o, a));
        }), o < 1 / 0 && o >= 0 && (i = e.substring(0, o + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let o = t.at(-1);
        n && o?.type === "paragraph" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = e;
    if (this.tokens.links) {
      let o = Object.keys(this.tokens.links);
      o.length > 0 && (n = n.replace(this.tokenizer.rules.inline.reflinkSearch, (p) => o.includes(p.slice(p.lastIndexOf("[") + 1, -1)) ? "[" + "a".repeat(p.length - 2) + "]" : p));
    }
    n = n.replace(this.tokenizer.rules.inline.anyPunctuation, "++"), n = n.replace(this.tokenizer.rules.inline.blockSkip, (o, p, a) => {
      let u = a ? a.length : 0;
      return o.slice(0, u) + "[" + "a".repeat(o.length - u - 2) + "]";
    }), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, r = "", i = 1 / 0;
    for (; e; ) {
      if (e.length < i) i = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      s || (r = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((a) => (o = a.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), true) : false)) continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let a = t.at(-1);
        o.type === "text" && a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, r)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e, n, r)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      let p = e;
      if (this.options.extensions?.startInline) {
        let a = 1 / 0, u = e.slice(1), c;
        this.options.extensions.startInline.forEach((h) => {
          c = h.call({ lexer: this }, u), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
        }), a < 1 / 0 && a >= 0 && (p = e.substring(0, a + 1));
      }
      if (o = this.tokenizer.inlineText(p)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (r = o.raw.slice(-1)), s = true;
        let a = t.at(-1);
        a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return t;
  }
  infiniteLoopError(e) {
    let t = "Infinite loop on byte: " + e;
    if (this.options.silent) console.error(t);
    else throw new Error(t);
  }
};
var P = class {
  options;
  parser;
  constructor(e) {
    this.options = e || R;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let s = (t || "").match(m.notSpaceStart)?.[0], r = e.replace(m.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + O(s) + '">' + (n ? r : O(r, true)) + `</code></pre>
` : "<pre><code>" + (n ? r : O(r, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let t = e.ordered, n = e.start, s = "";
    for (let o = 0; o < e.items.length; o++) {
      let p = e.items[o];
      s += this.listitem(p);
    }
    let r = t ? "ol" : "ul", i = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + i + `>
` + s + "</" + r + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r = 0; r < e.header.length; r++) n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r = 0; r < e.rows.length; r++) {
      let i = e.rows[r];
      n = "";
      for (let o = 0; o < i.length; o++) n += this.tablecell(i[o]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${O(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let s = this.parser.parseInline(n), r = Y(e);
    if (r === null) return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + O(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    let r = Y(e);
    if (r === null) return O(n);
    e = r;
    let i = `<img src="${e}" alt="${O(n)}"`;
    return t && (i += ` title="${O(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : O(e.text);
  }
};
var L = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var b = class l2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || R, this.options.renderer = this.options.renderer || new P(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L();
  }
  static parse(e, t) {
    return new l2(t).parse(e);
  }
  static parseInline(e, t) {
    return new l2(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (this.options.extensions?.renderers?.[s.type]) {
        let i = s, o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(i.type)) {
          t += o || "";
          continue;
        }
      }
      let r = s;
      switch (r.type) {
        case "space": {
          t += this.renderer.space(r);
          break;
        }
        case "hr": {
          t += this.renderer.hr(r);
          break;
        }
        case "heading": {
          t += this.renderer.heading(r);
          break;
        }
        case "code": {
          t += this.renderer.code(r);
          break;
        }
        case "table": {
          t += this.renderer.table(r);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(r);
          break;
        }
        case "list": {
          t += this.renderer.list(r);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(r);
          break;
        }
        case "html": {
          t += this.renderer.html(r);
          break;
        }
        case "def": {
          t += this.renderer.def(r);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(r);
          break;
        }
        case "text": {
          t += this.renderer.text(r);
          break;
        }
        default: {
          let i = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent) return console.error(i), "";
          throw new Error(i);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      if (this.options.extensions?.renderers?.[r.type]) {
        let o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
        if (o !== false || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
          n += o || "";
          continue;
        }
      }
      let i = r;
      switch (i.type) {
        case "escape": {
          n += t.text(i);
          break;
        }
        case "html": {
          n += t.html(i);
          break;
        }
        case "link": {
          n += t.link(i);
          break;
        }
        case "image": {
          n += t.image(i);
          break;
        }
        case "checkbox": {
          n += t.checkbox(i);
          break;
        }
        case "strong": {
          n += t.strong(i);
          break;
        }
        case "em": {
          n += t.em(i);
          break;
        }
        case "codespan": {
          n += t.codespan(i);
          break;
        }
        case "br": {
          n += t.br(i);
          break;
        }
        case "del": {
          n += t.del(i);
          break;
        }
        case "text": {
          n += t.text(i);
          break;
        }
        default: {
          let o = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent) return console.error(o), "";
          throw new Error(o);
        }
      }
    }
    return n;
  }
};
var S = class {
  options;
  block;
  constructor(e) {
    this.options = e || R;
  }
  static passThroughHooks = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer(e = this.block) {
    return e ? x.lex : x.lexInline;
  }
  provideParser(e = this.block) {
    return e ? b.parse : b.parseInline;
  }
};
var Z = class {
  defaults = C();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = P;
  TextRenderer = L;
  Lexer = x;
  Tokenizer = y;
  Hooks = S;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let s of e) switch (n = n.concat(t.call(this, s)), s.type) {
      case "table": {
        let r = s;
        for (let i of r.header) n = n.concat(this.walkTokens(i.tokens, t));
        for (let i of r.rows) for (let o of i) n = n.concat(this.walkTokens(o.tokens, t));
        break;
      }
      case "list": {
        let r = s;
        n = n.concat(this.walkTokens(r.items, t));
        break;
      }
      default: {
        let r = s;
        this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((i) => {
          let o = r[i].flat(1 / 0);
          n = n.concat(this.walkTokens(o, t));
        }) : r.tokens && (n = n.concat(this.walkTokens(r.tokens, t)));
      }
    }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let s = { ...n };
      if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name) throw new Error("extension name required");
        if ("renderer" in r) {
          let i = t.renderers[r.name];
          i ? t.renderers[r.name] = function(...o) {
            let p = r.renderer.apply(this, o);
            return p === false && (p = i.apply(this, o)), p;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let i = t[r.level];
          i ? i.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), s.extensions = t), n.renderer) {
        let r = this.defaults.renderer || new P(this.defaults);
        for (let i in n.renderer) {
          if (!(i in r)) throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i)) continue;
          let o = i, p = n.renderer[o], a = r[o];
          r[o] = (...u) => {
            let c = p.apply(r, u);
            return c === false && (c = a.apply(r, u)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        let r = this.defaults.tokenizer || new y(this.defaults);
        for (let i in n.tokenizer) {
          if (!(i in r)) throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i)) continue;
          let o = i, p = n.tokenizer[o], a = r[o];
          r[o] = (...u) => {
            let c = p.apply(r, u);
            return c === false && (c = a.apply(r, u)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        let r = this.defaults.hooks || new S();
        for (let i in n.hooks) {
          if (!(i in r)) throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i)) continue;
          let o = i, p = n.hooks[o], a = r[o];
          S.passThroughHooks.has(i) ? r[o] = (u) => {
            if (this.defaults.async && S.passThroughHooksRespectAsync.has(i)) return (async () => {
              let h = await p.call(r, u);
              return a.call(r, h);
            })();
            let c = p.call(r, u);
            return a.call(r, c);
          } : r[o] = (...u) => {
            if (this.defaults.async) return (async () => {
              let h = await p.apply(r, u);
              return h === false && (h = await a.apply(r, u)), h;
            })();
            let c = p.apply(r, u);
            return c === false && (c = a.apply(r, u)), c;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        let r = this.defaults.walkTokens, i = n.walkTokens;
        s.walkTokens = function(o) {
          let p = [];
          return p.push(i.call(this, o)), r && (p = p.concat(r.call(this, o))), p;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, s) => {
      let r = { ...s }, i = { ...this.defaults, ...r }, o = this.onError(!!i.silent, !!i.async);
      if (this.defaults.async === true && r.async === false) return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null) return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string") return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
        let p = i.hooks ? await i.hooks.preprocess(n) : n, u = await (i.hooks ? await i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(p, i), c = i.hooks ? await i.hooks.processAllTokens(u) : u;
        i.walkTokens && await Promise.all(this.walkTokens(c, i.walkTokens));
        let d = await (i.hooks ? await i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(c, i);
        return i.hooks ? await i.hooks.postprocess(d) : d;
      })().catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let a = (i.hooks ? i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(n, i);
        i.hooks && (a = i.hooks.processAllTokens(a)), i.walkTokens && this.walkTokens(a, i.walkTokens);
        let c = (i.hooks ? i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(a, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (p) {
        return o(p);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let s = "<p>An error occurred:</p><pre>" + O(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t) return Promise.reject(n);
      throw n;
    };
  }
};
var E = new Z();
function f(l3, e) {
  return E.parse(l3, e);
}
f.options = f.setOptions = function(l3) {
  return E.setOptions(l3), f.defaults = E.defaults, j(f.defaults), f;
};
f.getDefaults = C;
f.defaults = R;
function kt(...l3) {
  return E.use(...l3), f.defaults = E.defaults, j(f.defaults), f;
}
f.use = kt;
f.walkTokens = function(l3, e) {
  return E.walkTokens(l3, e);
};
f.parseInline = E.parseInline;
f.Parser = b;
f.parser = b.parse;
f.Renderer = P;
f.TextRenderer = L;
f.Lexer = x;
f.lexer = x.lex;
f.Tokenizer = y;
f.Hooks = S;
f.parse = f;
f.options;
f.setOptions;
f.walkTokens;
f.parseInline;
b.parse;
x.lex;
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
      const html = await f.parse(content);
      logs.push({
        version,
        html,
        raw: content
      });
    }
    return logs.sort((a, b2) => {
      const aParts = a.version.replace("v", "").split(".").map(Number);
      const bParts = b2.version.replace("v", "").split(".").map(Number);
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
