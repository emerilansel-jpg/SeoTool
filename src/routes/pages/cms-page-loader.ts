import { notFound } from "@tanstack/react-router";
import { getPublishedPage } from "@/serverFunctions/cms-public";

/** Loader for fixed-slug CMS pages (privacy, terms, ...). 404s until a
 *  published page exists for the slug. Goes through a server fn so the
 *  repository (and its cloudflare:workers dependency chain) never enters
 *  the client bundle. */
export async function loadCmsPage(slug: string) {
  const page = await getPublishedPage({ data: { slug } });
  if (!page) throw notFound();
  return {
    page: {
      slug: page.slug,
      title: page.title,
      contentMd: page.contentMd,
      updatedAt: page.updatedAt,
    },
  };
}
