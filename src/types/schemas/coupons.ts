import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .transform((value) => `${value}T23:59:59.000Z`);

export const CreateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Z0-9-]{4,32}$/i, "Letters, digits and dashes only")
    .transform((value) => value.toUpperCase())
    .optional(),
  credits: z.number().int().min(1).max(10_000_000),
  maxRedemptions: z.number().int().min(1).max(100_000).optional(),
  expiresAt: isoDate.optional(),
  note: z.string().trim().max(200).optional(),
});

export type CreateCouponInput = z.infer<typeof CreateCouponSchema>;

export const ListCouponsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const RedeemCouponSchema = z.object({
  code: z.string().trim().min(4).max(32),
});
