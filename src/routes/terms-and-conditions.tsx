import { createFileRoute } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { CmsPageView } from "@/client/features/cms/CmsPageView";
import { loadCmsPage } from "./pages/cms-page-loader";

export const Route = createFileRoute("/terms-and-conditions")({
  loader: () => loadCmsPage("terms-and-conditions"),
  head: () => ({
    meta: [{ title: "Terms and Conditions - SeoTool.im" }],
  }),
  component: TermsPage,
});

function TermsPage() {
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
