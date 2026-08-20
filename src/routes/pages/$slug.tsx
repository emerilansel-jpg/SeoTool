import { createFileRoute } from "@tanstack/react-router";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { CmsPageView } from "@/client/features/cms/CmsPageView";
import { loadCmsPage } from "./cms-page-loader";

export const Route = createFileRoute("/pages/$slug")({
  loader: async ({ params }) => loadCmsPage(params.slug),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.page.title} - SeoTool.im`
          : "SeoTool.im",
      },
    ],
  }),
  component: CustomCmsPage,
});

function CustomCmsPage() {
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
