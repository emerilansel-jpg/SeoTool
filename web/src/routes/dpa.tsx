import { createFileRoute } from "@tanstack/react-router";
import defaultMdxComponents from "fumadocs-ui/mdx";
import DpaContent, {
  frontmatter as dpaFrontmatter,
} from "../../content/legal/dpa.md";
import { LegalPage } from "@/components/legal-page";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/dpa")({
  head: () =>
    buildPageSeo({
      title: dpaFrontmatter.title,
      description: dpaFrontmatter.description,
      path: "/dpa",
      titleSuffix: "SeoTool.im",
    }),
  component: DataProcessingAddendum,
});

function DataProcessingAddendum() {
  return (
    <LegalPage
      title={dpaFrontmatter.title}
      description={dpaFrontmatter.description}
    >
      <DpaContent components={defaultMdxComponents} />
    </LegalPage>
  );
}
