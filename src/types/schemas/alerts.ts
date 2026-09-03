import { z } from "zod";

export const ALERT_METRIC_TYPES = [
  "rank_drop",
  "rank_increase",
  "audit_critical",
] as const;

export const ALERT_FREQUENCIES = ["daily", "weekly"] as const;

export const alertConditionSchema = z.object({
  // For rank_drop/rank_increase: minimum position change to trigger (e.g., 10 =
  // alert if rank changes by 10+ positions). For audit_critical: minimum number
  // of critical issues.
  threshold: z.number().min(1),
  // Optional: specific keyword to monitor (rank_drop/rank_increase only). If
  // omitted, all tracked keywords are checked.
  keyword: z.string().optional(),
  // Optional: device filter (rank_drop/rank_increase only)
  device: z.enum(["desktop", "mobile"]).optional(),
});

export const createAlertRuleSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100),
  metricType: z.enum(ALERT_METRIC_TYPES),
  condition: alertConditionSchema,
  enabled: z.boolean().default(true),
  frequency: z.enum(ALERT_FREQUENCIES).default("daily"),
  recipients: z.string().min(1, "At least one recipient email is required"),
});

export const updateAlertRuleSchema = createAlertRuleSchema
  .omit({ projectId: true })
  .partial();

export const projectBoundAlertIdSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().min(1),
});
