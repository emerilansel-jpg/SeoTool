import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import {
  ListFeedbackSchema,
  UpdateFeedbackStatusSchema,
} from "@/types/schemas/feedback";
import { FeedbackRepository } from "@/server/features/feedback/feedbackRepository";
import { notifyReporterOfResolution } from "@/server/features/feedback/feedbackService";
import { APP_VERSION } from "@/shared/appVersion";

export const listAdminFeedback = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(ListFeedbackSchema)
  .handler(async ({ data }) => {
    return FeedbackRepository.list(data);
  });

export const getNewFeedbackCount = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return { count: await FeedbackRepository.countNew() };
  });

export const getAdminFeedbackDetail = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const row = await FeedbackRepository.getById(data.id);
    if (!row) throw new AppError("NOT_FOUND", "Feedback report not found.");
    return row;
  });

export const updateFeedbackStatus = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(UpdateFeedbackStatusSchema)
  .handler(async ({ data }) => {
    const row = await FeedbackRepository.updateStatus({
      id: data.id,
      status: data.status,
      adminNote: data.adminNote ?? null,
      resolvedInVersion: data.resolvedInVersion ?? null,
      nowIso: new Date().toISOString(),
    });
    if (!row) throw new AppError("NOT_FOUND", "Feedback report not found.");

    let emailed = false;
    if (data.notifyUser && data.status === "resolved") {
      const outcome = await notifyReporterOfResolution({
        id: row.id,
        email: row.email,
        displayNumber: row.displayNumber,
        title: row.title,
        messageToUser: data.messageToUser ?? null,
      });
      emailed = outcome.emailed;
    }

    return { ok: true as const, emailed, notifiedAt: row.notifiedAt };
  });

export const resendFeedbackNotification = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const row = await FeedbackRepository.getById(data.id);
    if (!row) throw new AppError("NOT_FOUND", "Feedback report not found.");

    const emailed = await notifyReporterOfResolution({
      id: row.id,
      email: row.email,
      displayNumber: row.displayNumber,
      title: row.title,
      messageToUser: row.adminNote,
    });
    return { ok: true as const, emailed };
  });

export const currentAppVersion = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return { version: APP_VERSION };
  });
