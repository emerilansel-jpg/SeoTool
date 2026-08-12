import { createFileRoute } from "@tanstack/react-router";
import defaultMdxComponents from "fumadocs-ui/mdx";
import RefundContent, {
  frontmatter as refundFrontmatter,
} from "../../content/legal/refund-policy.md";
import { LegalPage } from "@/components/legal-page";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/refund-policy")({
  head: () =>
    buildPageSeo({
      title: refundFrontmatter.title,
      description: refundFrontmatter.description,
      path: "/refund-policy",
      titleSuffix: "SeoTool.im",
    }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <LegalPage
      title={refundFrontmatter.title}
      description={refundFrontmatter.description}
    >
      <RefundContent components={defaultMdxComponents} />
    </LegalPage>
  );
}
