import { AppError } from "@/server/lib/errors";
import { CmsRepository } from "../repositories/CmsRepository";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assertSlug(slug: string): string {
  if (!SLUG_PATTERN.test(slug)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Slug must be lowercase letters, numbers, and hyphens.",
    );
  }
  return slug;
}

function todayIso(): string {
  return new Date().toISOString();
}

export const CmsService = {
  async listPosts() {
    return CmsRepository.listPosts(true);
  },

  async getPost(id: string) {
    const post = await CmsRepository.getPostById(id);
    if (!post) throw new AppError("NOT_FOUND", "Post not found.");
    return post;
  },

  async createPost(
    input: {
      slug: string;
      title: string;
      description?: string;
      contentMd: string;
      published: boolean;
    },
    authorUserId: string,
  ) {
    const slug = assertSlug(normalizeSlug(input.slug));
    if (await CmsRepository.postSlugTaken(slug)) {
      throw new AppError("CONFLICT", "A post with this slug already exists.");
    }
    return CmsRepository.createPost({
      id: crypto.randomUUID(),
      slug,
      title: input.title,
      description: input.description ?? null,
      contentMd: input.contentMd,
      status: input.published ? "published" : "draft",
      publishedAt: input.published ? todayIso() : null,
      authorUserId,
    });
  },

  async updatePost(input: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    contentMd: string;
    published: boolean;
  }) {
    const existing = await CmsRepository.getPostById(input.id);
    if (!existing) throw new AppError("NOT_FOUND", "Post not found.");

    const slug = assertSlug(normalizeSlug(input.slug));
    if (
      slug !== existing.slug &&
      (await CmsRepository.postSlugTaken(slug, input.id))
    ) {
      throw new AppError("CONFLICT", "A post with this slug already exists.");
    }

    const firstPublish = input.published && existing.status !== "published";
    const unpublished = !input.published && existing.status === "published";

    const updated = await CmsRepository.updatePost(input.id, {
      slug,
      title: input.title,
      description: input.description ?? null,
      contentMd: input.contentMd,
      status: input.published ? "published" : "draft",
      publishedAt: firstPublish
        ? (existing.publishedAt ?? todayIso())
        : unpublished
          ? existing.publishedAt
          : existing.publishedAt,
    });
    if (!updated) throw new AppError("NOT_FOUND", "Post not found.");
    return updated;
  },

  async deletePost(input: { id: string }) {
    const existing = await CmsRepository.getPostById(input.id);
    if (!existing) throw new AppError("NOT_FOUND", "Post not found.");
    await CmsRepository.deletePost(input.id);
  },

  async listPages() {
    return CmsRepository.listPages(true);
  },

  async getPage(id: string) {
    const page = await CmsRepository.getPageById(id);
    if (!page) throw new AppError("NOT_FOUND", "Page not found.");
    return page;
  },

  async createPage(
    input: {
      slug: string;
      title: string;
      contentMd: string;
      published: boolean;
    },
    adminUserId: string,
  ) {
    const slug = assertSlug(normalizeSlug(input.slug));
    if (await CmsRepository.pageSlugTaken(slug)) {
      throw new AppError("CONFLICT", "A page with this slug already exists.");
    }
    return CmsRepository.createPage({
      id: crypto.randomUUID(),
      slug,
      title: input.title,
      contentMd: input.contentMd,
      status: input.published ? "published" : "draft",
      updatedByUserId: adminUserId,
    });
  },

  async updatePage(input: {
    id: string;
    slug: string;
    title: string;
    contentMd: string;
    published: boolean;
  }) {
    const existing = await CmsRepository.getPageById(input.id);
    if (!existing) throw new AppError("NOT_FOUND", "Page not found.");

    const slug = assertSlug(normalizeSlug(input.slug));
    if (
      slug !== existing.slug &&
      (await CmsRepository.pageSlugTaken(slug, input.id))
    ) {
      throw new AppError("CONFLICT", "A page with this slug already exists.");
    }

    const updated = await CmsRepository.updatePage(input.id, {
      slug,
      title: input.title,
      contentMd: input.contentMd,
      status: input.published ? "published" : "draft",
    });
    if (!updated) throw new AppError("NOT_FOUND", "Page not found.");
    return updated;
  },

  async deletePage(input: { id: string }) {
    const existing = await CmsRepository.getPageById(input.id);
    if (!existing) throw new AppError("NOT_FOUND", "Page not found.");
    await CmsRepository.deletePage(input.id);
  },
};
