import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import {
  createCmsPageSchema,
  createCmsPostSchema,
  deleteCmsItemSchema,
  updateCmsPageSchema,
  updateCmsPostSchema,
} from "@/types/schemas/admin";
import { CmsService } from "@/server/features/admin/services/CmsService";

// Blog posts
export const listAdminPosts = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return CmsService.listPosts();
  });

export const getAdminPost = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(deleteCmsItemSchema)
  .handler(async ({ data }) => {
    return CmsService.getPost(data.id);
  });

export const createAdminPost = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(createCmsPostSchema)
  .handler(async ({ data, context }) => {
    return CmsService.createPost(data, context.userId);
  });

export const updateAdminPost = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(updateCmsPostSchema)
  .handler(async ({ data }) => {
    return CmsService.updatePost(data);
  });

export const deleteAdminPost = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(deleteCmsItemSchema)
  .handler(async ({ data }) => {
    await CmsService.deletePost(data);
    return { ok: true };
  });

// Pages
export const listAdminPages = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return CmsService.listPages();
  });

export const getAdminPage = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(deleteCmsItemSchema)
  .handler(async ({ data }) => {
    return CmsService.getPage(data.id);
  });

export const createAdminPage = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(createCmsPageSchema)
  .handler(async ({ data, context }) => {
    return CmsService.createPage(data, context.userId);
  });

export const updateAdminPage = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(updateCmsPageSchema)
  .handler(async ({ data }) => {
    return CmsService.updatePage(data);
  });

export const deleteAdminPage = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(deleteCmsItemSchema)
  .handler(async ({ data }) => {
    await CmsService.deletePage(data);
    return { ok: true };
  });
