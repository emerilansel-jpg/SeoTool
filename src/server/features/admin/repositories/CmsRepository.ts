import { desc, eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { cmsPages, cmsPosts } from "@/db/schema";

// ---------------------------------------------------------------------------
// CMS storage for blog posts and pages. Admin-facing methods see drafts;
// the public-read methods (used by route loaders) only see published rows.
// ---------------------------------------------------------------------------

export interface CmsPostRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  contentMd: string;
  status: string;
  publishedAt: string | null;
  authorUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsPageRow {
  id: string;
  slug: string;
  title: string;
  contentMd: string;
  status: string;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const CmsRepository = {
  async listPosts(includeDrafts: boolean): Promise<CmsPostRow[]> {
    const query = db.select().from(cmsPosts);
    const rows = includeDrafts
      ? await query.orderBy(desc(cmsPosts.updatedAt))
      : await query
          .where(eq(cmsPosts.status, "published"))
          .orderBy(desc(cmsPosts.publishedAt));
    return rows;
  },

  async getPostById(id: string): Promise<CmsPostRow | null> {
    const rows = await db
      .select()
      .from(cmsPosts)
      .where(eq(cmsPosts.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async getPublishedPostBySlug(slug: string): Promise<CmsPostRow | null> {
    const rows = await db
      .select()
      .from(cmsPosts)
      .where(and(eq(cmsPosts.slug, slug), eq(cmsPosts.status, "published")))
      .limit(1);
    return rows[0] ?? null;
  },

  async createPost(values: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    contentMd: string;
    status: string;
    publishedAt: string | null;
    authorUserId: string;
  }): Promise<CmsPostRow> {
    const [row] = await db.insert(cmsPosts).values(values).returning();
    return row;
  },

  async updatePost(
    id: string,
    set: Partial<{
      slug: string;
      title: string;
      description: string | null;
      contentMd: string;
      status: string;
      publishedAt: string | null;
    }>,
  ): Promise<CmsPostRow | null> {
    const [row] = await db
      .update(cmsPosts)
      .set({ ...set, updatedAt: new Date().toISOString() })
      .where(eq(cmsPosts.id, id))
      .returning();
    return row ?? null;
  },

  async deletePost(id: string): Promise<void> {
    await db.delete(cmsPosts).where(eq(cmsPosts.id, id));
  },

  async postSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const rows = await db
      .select({ id: cmsPosts.id })
      .from(cmsPosts)
      .where(
        excludeId
          ? and(eq(cmsPosts.slug, slug), ne(cmsPosts.id, excludeId))
          : eq(cmsPosts.slug, slug),
      )
      .limit(1);
    return rows.length > 0;
  },

  async listPages(includeDrafts: boolean): Promise<CmsPageRow[]> {
    const query = db.select().from(cmsPages);
    return includeDrafts
      ? query.orderBy(desc(cmsPages.updatedAt))
      : query.where(eq(cmsPages.status, "published"));
  },

  async getPageById(id: string): Promise<CmsPageRow | null> {
    const rows = await db
      .select()
      .from(cmsPages)
      .where(eq(cmsPages.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async getPublishedPageBySlug(slug: string): Promise<CmsPageRow | null> {
    const rows = await db
      .select()
      .from(cmsPages)
      .where(and(eq(cmsPages.slug, slug), eq(cmsPages.status, "published")))
      .limit(1);
    return rows[0] ?? null;
  },

  async createPage(values: {
    id: string;
    slug: string;
    title: string;
    contentMd: string;
    status: string;
    updatedByUserId: string;
  }): Promise<CmsPageRow> {
    const [row] = await db.insert(cmsPages).values(values).returning();
    return row;
  },

  async updatePage(
    id: string,
    set: Partial<{
      slug: string;
      title: string;
      contentMd: string;
      status: string;
    }>,
  ): Promise<CmsPageRow | null> {
    const [row] = await db
      .update(cmsPages)
      .set({ ...set, updatedAt: new Date().toISOString() })
      .where(eq(cmsPages.id, id))
      .returning();
    return row ?? null;
  },

  async deletePage(id: string): Promise<void> {
    await db.delete(cmsPages).where(eq(cmsPages.id, id));
  },

  async pageSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const rows = await db
      .select({ id: cmsPages.id })
      .from(cmsPages)
      .where(
        excludeId
          ? and(eq(cmsPages.slug, slug), ne(cmsPages.id, excludeId))
          : eq(cmsPages.slug, slug),
      )
      .limit(1);
    return rows.length > 0;
  },
};
