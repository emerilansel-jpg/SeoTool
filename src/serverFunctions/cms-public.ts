import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CmsRepository } from "@/server/features/admin/repositories/CmsRepository";

// Public CMS reads for marketing surfaces (blog index, blog post, fixed
// legal pages). No auth middleware: these serve published content only.
// Route modules must go through server functions — a direct value import of
// CmsRepository from a route file drags cloudflare:workers (via db/provider)
// into the client bundle and breaks the production build.

const slugSchema = z.object({ slug: z.string().min(1).max(200) });

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    const posts = await CmsRepository.listPosts(false);
    return posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      publishedAt: post.publishedAt,
    }));
  },
);

export const getPublishedPost = createServerFn({ method: "GET" })
  .validator(slugSchema)
  .handler(async ({ data }) => {
    return CmsRepository.getPublishedPostBySlug(data.slug);
  });

export const getPublishedPage = createServerFn({ method: "GET" })
  .validator(slugSchema)
  .handler(async ({ data }) => {
    return CmsRepository.getPublishedPageBySlug(data.slug);
  });
