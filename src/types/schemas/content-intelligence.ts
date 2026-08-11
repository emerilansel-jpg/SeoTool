import { z } from "zod";

const projectScoped = {
  projectId: z.string().min(1),
};

/** Input for fetching the content scores of a completed audit. */
export const contentScoresInputSchema = z.object({
  ...projectScoped,
  auditId: z.string().min(1),
});

/** Input for a content-quality summary. Omit auditId to use the project's most
 *  recent completed audit (used by the dashboard card). */
export const contentScoreSummaryInputSchema = z.object({
  ...projectScoped,
  auditId: z.string().min(1).optional(),
});

/** Input for fetching per-page entity/topic extraction results. */
export const pageEntitiesInputSchema = z.object({
  ...projectScoped,
  auditId: z.string().min(1),
});

/** Input for a content/keyword gap analysis vs competitor domains.
 *  `domain` is the project's own domain; `competitors` are 1-3 rivals to
 *  compare against. Market (location/language) is resolved by the server fn
 *  from the project config when omitted. */
export const contentGapInputSchema = z.object({
  ...projectScoped,
  domain: z.string().min(1),
  competitors: z.array(z.string().min(1)).min(1).max(3),
  locationCode: z.number().int().optional(),
  languageCode: z.string().optional(),
});
