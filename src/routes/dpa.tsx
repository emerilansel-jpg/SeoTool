import { createFileRoute } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { CmsPageView } from "@/client/features/cms/CmsPageView";
import { loadCmsPage } from "./pages/-cms-page-loader";

export const Route = createFileRoute("/dpa")({
  loader: () => loadCmsPage("dpa"),
  head: () => ({
    meta: [{ title: "Data Processing Agreement - SeoTool.im" }],
  }),
  component: DpaPage,
});

function DpaPage() {
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
