import { z } from "zod";

export const CreateGmbGridSchema = z.object({
  projectId: z.string(),
  businessName: z.string().min(1, "Business name is required"),
  keyword: z.string().min(1, "Keyword is required"),
  centerLat: z.number(),
  centerLng: z.number(),
  gridSize: z
    .number()
    .int()
    .min(3)
    .max(9)
    .refine((val) => val % 2 !== 0, "Grid size must be odd"),
  radiusMeters: z.number().int().min(100).max(50000),
});
