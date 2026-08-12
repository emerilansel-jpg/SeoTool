import { createFileRoute } from "@tanstack/react-router";
import defaultMdxComponents from "fumadocs-ui/mdx";
import CookieContent, {
  frontmatter as cookieFrontmatter,
} from "../../content/legal/cookie-policy.md";
import { LegalPage } from "@/components/legal-page";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/cookie-policy")({
  head: () =>
    buildPageSeo({
      title: cookieFrontmatter.title,
      description: cookieFrontmatter.description,
      path: "/cookie-policy",
      titleSuffix: "SeoTool.im",
    }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <LegalPage
      title={cookieFrontmatter.title}
      description={cookieFrontmatter.description}
    >
      <CookieContent components={defaultMdxComponents} />
    </LegalPage>
  );
}
