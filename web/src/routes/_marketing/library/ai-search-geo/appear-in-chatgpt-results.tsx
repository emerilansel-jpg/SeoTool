import { createFileRoute } from "@tanstack/react-router";
import defaultMdxComponents from "fumadocs-ui/mdx";
import Content, {
  frontmatter,
} from "../../../../../content/marketing/library/appear-in-chatgpt-results.mdx";
import { LibrarySpokePage } from "@/components/library-page";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute(
  "/_marketing/library/ai-search-geo/appear-in-chatgpt-results",
)({
  head: () =>
    buildPageSeo({
      title: "How to Appear in ChatGPT Results (GEO Checklist)",
      description: frontmatter.description,
      path: "/library/ai-search-geo/appear-in-chatgpt-results",
      titleSuffix: "SeoTool.im Library",
      ogType: "article",
    }),
  component: () => (
    <LibrarySpokePage
      title={frontmatter.title}
      description={frontmatter.description}
      crumb="How to appear in ChatGPT results"
    >
      <Content components={{ ...defaultMdxComponents }} />
    </LibrarySpokePage>
  ),
});
