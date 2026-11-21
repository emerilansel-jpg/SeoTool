import { z } from "zod";

export const FEEDBACK_TYPES = ["bug", "feature"] as const;
export const FEEDBACK_STATUSES = [
  "new",
  "in_progress",
  "resolved",
  "wont_fix",
] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

/** 5 MB screenshot cap; base64 inflates by ~4/3. */
const MAX_SCREENSHOT_BASE64_LENGTH = Math.ceil((5 * 1024 * 1024 * 4) / 3);

const base64Image = z
  .string()
  .regex(/^[A-Za-z0-9+/=\s]+$/, "Screenshot must be a base64-encoded image.")
  .refine(
    (value) => value.length <= MAX_SCREENSHOT_BASE64_LENGTH,
    "Screenshot is too large. Please attach an image under 5 MB.",
  );

export const SubmitFeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  title: z.string().trim().min(5, "Give the report a short title.").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Describe what happened in a few words.")
    .max(2000),
  email: z
    .string()
    .trim()
    .email("Enter a valid email so we can reply to you.")
    .max(200),
  screenshotBase64: base64Image.optional(),
  screenshotMime: z.enum(["image/jpeg", "image/png"]).optional(),
  pageUrl: z.string().trim().max(500).optional(),
  userAgent: z.string().trim().max(300).optional(),
  appVersion: z.string().trim().max(20).optional(),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;

export const ListFeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES).optional(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const UpdateFeedbackStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(FEEDBACK_STATUSES),
  adminNote: z.string().trim().max(1000).optional(),
  resolvedInVersion: z.string().trim().max(20).optional(),
  notifyUser: z.boolean().default(true),
  messageToUser: z.string().trim().max(1000).optional(),
});
