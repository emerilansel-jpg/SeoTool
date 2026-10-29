import { z } from "zod";

const flexibleOptionalUrlSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val) return val;
    const trimmed = val.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  })
  .pipe(z.string().url("Must be a valid URL").optional().nullable());

export const createTopicClusterSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  pillarPageUrl: flexibleOptionalUrlSchema,
});

export const updateTopicClusterSchema = createTopicClusterSchema
  .omit({ projectId: true })
  .partial();

export const createContentBriefSchema = z.object({
  projectId: z.string().min(1),
  clusterId: z.string().optional().nullable(),
  targetKeyword: z.string().min(1, "Target keyword is required"),
  title: z.string().optional().nullable(),
  status: z
    .enum(["idea", "briefing", "writing", "published", "archived"])
    .default("idea"),
  priorityScore: z.number().min(0).max(100).optional().nullable(),
  targetUrl: flexibleOptionalUrlSchema,
  briefDataJson: z.string().optional().nullable(), // Stored as stringified JSON
});

export const updateContentBriefSchema = createContentBriefSchema
  .omit({ projectId: true })
  .partial();

// Request input schema for server-fns
export const projectBoundIdSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().min(1),
});

// Generative Content Brief Outline Schema
export const generatedBriefOutlineSchema = z.object({
  searchIntent: z
    .enum(["informational", "transactional", "navigational", "commercial"])
    .catch("informational"),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()).catch([]),
  suggestedTitle: z.string(),
  metaDescription: z.string(),
  outline: z
    .array(
      z.object({
        heading: z.string(),
        level: z.enum(["h2", "h3"]).catch("h2"),
        keyPoints: z.array(z.string()).catch([]),
      }),
    )
    .catch([]),
});
export type GeneratedBriefOutline = z.infer<typeof generatedBriefOutlineSchema>;
