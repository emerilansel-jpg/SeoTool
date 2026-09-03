import { z } from "zod";

export const CreateGmbGridSchema = z.object({
  projectId: z.string().min(1),
  businessName: z.string().trim().min(1, "Business name is required"),
  placeId: z.string().trim().min(1, "Select a verified Google business"),
  cid: z.string().trim().optional(),
  address: z.string().trim().optional(),
  keyword: z.string().trim().min(1, "Keyword is required"),
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  gridSize: z
    .number()
    .int()
    .min(3)
    .max(15)
    .refine((val) => val % 2 !== 0, "Grid size must be odd"),
  radiusMeters: z.number().int().min(100).max(100000),
  languageCode: z.string().trim().min(2).max(5).default("en"),
  device: z.enum(["desktop", "mobile"]).default("mobile"),
  mapZoom: z.number().int().min(3).max(21).default(15),
  scheduleInterval: z.enum(["weekly", "monthly", "manual"]).default("manual"),
  costConfirmed: z.literal(true),
});

export type CreateGmbGridInput = z.infer<typeof CreateGmbGridSchema>;

export const SearchGmbProfilesSchema = z.object({
  projectId: z.string().min(1),
  query: z.string().trim().min(3).max(120),
});

export const GetGmbGridConfigsSchema = z.object({
  projectId: z.string().min(1),
});

export const GetGmbGridRunSchema = z.object({
  projectId: z.string().min(1),
  runId: z.string().uuid(),
});
