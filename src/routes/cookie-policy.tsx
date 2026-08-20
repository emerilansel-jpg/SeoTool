import { createFileRoute } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { CmsPageView } from "@/client/features/cms/CmsPageView";
import { loadCmsPage } from "./pages/cms-page-loader";

export const Route = createFileRoute("/cookie-policy")({
  loader: () => loadCmsPage("cookie-policy"),
  head: () => ({
    meta: [{ title: "Cookie Policy - SeoTool.im" }],
  }),
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  const { signedIn } = useMarketingSession();
  const { page } = Route.useLoaderData();
  return (
    <MarketingChrome signedIn={signedIn}>
      <CmsPageView
        title={page.title}
        contentMd={page.contentMd}
        updatedAt={page.updatedAt}
      />
    </MarketingChrome>
  );
}
