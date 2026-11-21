import { z } from "zod";

export const aiBotDashboardInputSchema = z.object({
  projectId: z.string().min(1),
  windowDays: z.coerce.number().int().min(7).max(90).default(30),
});
export type AiBotDashboardInput = z.infer<typeof aiBotDashboardInputSchema>;

export const aiBotConnectInputSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().trim().min(1).max(253),
});
export type AiBotConnectInput = z.infer<typeof aiBotConnectInputSchema>;

export const aiBotDisconnectInputSchema = z.object({
  projectId: z.string().min(1),
});

export const aiBotRotateTokenInputSchema = z.object({
  projectId: z.string().min(1),
});

/** Access-log upload payload: raw file text, client-read via File.text(). */
export const aiBotImportLogInputSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().trim().min(1).max(253),
  content: z
    .string()
    .min(1)
    .max(30 * 1024 * 1024, "Log file is too large (30 MB max)."),
});
export type AiBotImportLogInput = z.infer<typeof aiBotImportLogInputSchema>;

export const aiBotRobotsCheckInputSchema = z.object({
  projectId: z.string().min(1),
});
