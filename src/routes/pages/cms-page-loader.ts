import { notFound } from "@tanstack/react-router";
import { CmsRepository } from "@/server/features/admin/repositories/CmsRepository";

/** Loader for fixed-slug CMS pages (privacy, terms, ...). 404s until a
 *  published page exists for the slug (seed via scripts/seed-cms.ts). */
export async function loadCmsPage(slug: string) {
  const page = await CmsRepository.getPublishedPageBySlug(slug);
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
