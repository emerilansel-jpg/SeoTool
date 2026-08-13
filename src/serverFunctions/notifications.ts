import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { NotificationRepository } from "@/server/features/notifications/repositories/NotificationRepository";

// Notifications are user-scoped (the bell inbox), so these only need an
// authenticated session — not project context.

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    return NotificationRepository.listForUser(context.userId);
  });

export const getUnreadNotificationCount = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    return { count: await NotificationRepository.countUnread(context.userId) };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    await NotificationRepository.markRead(data.id, context.userId);
    return { success: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    await NotificationRepository.markAllRead(context.userId);
    return { success: true };
  });
