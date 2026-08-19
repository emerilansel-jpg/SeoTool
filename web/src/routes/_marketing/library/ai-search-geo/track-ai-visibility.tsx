import { createFileRoute } from "@tanstack/react-router";
import defaultMdxComponents from "fumadocs-ui/mdx";
import Content, {
  frontmatter,
} from "../../../../../content/marketing/library/track-ai-visibility.mdx";
import { LibrarySpokePage } from "@/components/library-page";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute(
  "/_marketing/library/ai-search-geo/track-ai-visibility",
)({
  head: () =>
    buildPageSeo({
      title: "How to Track Your AI Visibility (Metrics That Matter)",
      description: frontmatter.description,
      path: "/library/ai-search-geo/track-ai-visibility",
      titleSuffix: "SeoTool.im Library",
      ogType: "article",
    }),
  component: () => (
    <LibrarySpokePage
      title={frontmatter.title}
      description={frontmatter.description}
      crumb="How to track your AI visibility"
    >
      <Content components={{ ...defaultMdxComponents }} />
    </LibrarySpokePage>
  ),
});
