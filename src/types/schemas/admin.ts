import { z } from "zod";
import { PLAN_TIERS } from "@/shared/plans";

// ---------------------------------------------------------------------------
// Admin settings (API keys / provider configuration)
// ---------------------------------------------------------------------------

export const saveAdminSettingSchema = z.object({
  envKey: z.string().min(1),
  value: z.string(),
});

export const removeAdminSettingSchema = z.object({
  envKey: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Admin users
// ---------------------------------------------------------------------------

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export const searchUsersSchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
});

export const adminUserIdSchema = z.object({
  userId: z.string().min(1),
});

export const banUserSchema = adminUserIdSchema.extend({
  banReason: z.string().trim().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Admin billing
// ---------------------------------------------------------------------------

export const listSubscriptionsSchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
});

export const setPlanTierSchema = z.object({
  organizationId: z.string().min(1),
  planTier: z.enum(PLAN_TIERS),
});

export const adjustCreditsSchema = z.object({
  organizationId: z.string().min(1),
  delta: z
    .number()
    .int()
    .refine((value) => value !== 0, {
      message: "Delta cannot be zero.",
    }),
  reason: z.string().trim().max(500).optional(),
});

export const adminOrganizationIdSchema = z.object({
  organizationId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Admin pricing
// ---------------------------------------------------------------------------

export const saveAdminPlanConfigSchema = z.object({
  tier: z.enum(PLAN_TIERS),
  priceUsd: z.number().min(0).max(100000),
  monthlyCredits: z.number().int().min(0).max(100000000),
  paypalPlanId: z.string().trim().max(200).optional(),
  active: z.boolean(),
});

export const retryAdminPlanSyncSchema = z.object({
  tier: z.enum(PLAN_TIERS),
});

// ---------------------------------------------------------------------------
// Admin CMS (blog posts + pages)
// ---------------------------------------------------------------------------

const cmsSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9-]+$/, "Slug can only contain letters, numbers, hyphens.");

export const createCmsPostSchema = z.object({
  slug: cmsSlugSchema,
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(500).optional(),
  contentMd: z.string().min(1).max(500000),
  published: z.boolean(),
});

export const updateCmsPostSchema = createCmsPostSchema.extend({
  id: z.string().min(1),
});

export const deleteCmsItemSchema = z.object({
  id: z.string().min(1),
});

export const createCmsPageSchema = z.object({
  slug: cmsSlugSchema,
  title: z.string().trim().min(1).max(300),
  contentMd: z.string().min(1).max(500000),
  published: z.boolean(),
});

export const updateCmsPageSchema = createCmsPageSchema.extend({
  id: z.string().min(1),
});
